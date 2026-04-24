/**
 * Public payouts API for SaaS platforms.
 *   POST /api/public/v1/payouts  — create a payout
 *   GET  /api/public/v1/payouts  — list recent payouts
 *
 * Auth: Bearer <api_key>  (sk_live_...)
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { z } from "zod";
import { executePayout } from "@/server/payments.server";

function service() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const raw = header.slice(7).trim();
  if (!raw) return null;
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  const supa = service();
  const { data } = await supa
    .from("api_keys")
    .select("id, business_id, scopes, revoked_at")
    .eq("hashed_key", hashed)
    .maybeSingle();
  if (!data || data.revoked_at) return null;
  await supa.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { businessId: data.business_id as string, scopes: (data.scopes as string[]) ?? [], keyId: data.id };
}

const PayoutSchema = z.object({
  recipient_id: z.string().uuid().optional(),
  recipient: z
    .object({
      name: z.string().min(2).max(120),
      email: z.string().email().optional(),
      country: z.string().length(2).optional(),
      wallet_address: z.string().min(32).max(64).optional(),
      bank_currency: z.string().min(3).max(8).optional(),
      bank_details: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  amount: z.number().positive().max(1_000_000),
  currency: z.string().min(3).max(8).default("USDC"),
  rail: z.enum(["solana_usdc", "dodo_fiat", "auto"]).default("auto"),
  memo: z.string().max(200).optional(),
  external_id: z.string().max(120).optional(),
});

export const Route = createFileRoute("/api/public/v1/payouts")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),

      GET: async ({ request }) => {
        const auth = await authenticate(request);
        if (!auth) return jsonError(401, "Invalid or missing API key");
        const supa = service();
        const { data } = await supa
          .from("payouts")
          .select("id, amount, currency, status, rail, resolved_rail, external_reference, created_at, completed_at, failure_reason")
          .eq("business_id", auth.businessId)
          .order("created_at", { ascending: false })
          .limit(50);
        return json({ data: data ?? [] });
      },

      POST: async ({ request }) => {
        const auth = await authenticate(request);
        if (!auth) return jsonError(401, "Invalid or missing API key");
        if (!auth.scopes.includes("payouts:create")) return jsonError(403, "Missing scope: payouts:create");

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "Invalid JSON");
        }
        const parsed = PayoutSchema.safeParse(body);
        if (!parsed.success) return jsonError(400, parsed.error.issues.map((i) => i.message).join("; "));
        const input = parsed.data;

        const supa = service();
        let recipientId = input.recipient_id;

        // Upsert ad-hoc recipient if provided inline
        if (!recipientId && input.recipient) {
          const { data: created, error: rerr } = await supa
            .from("recipients")
            .insert({
              business_id: auth.businessId,
              name: input.recipient.name,
              email: input.recipient.email ?? null,
              country: input.recipient.country ?? null,
              payout_method: input.recipient.wallet_address ? "crypto_wallet" : input.recipient.bank_details ? "bank_transfer" : "auto",
              wallet_address: input.recipient.wallet_address ?? null,
              bank_currency: input.recipient.bank_currency ?? null,
              bank_details: input.recipient.bank_details ?? null,
            })
            .select("id")
            .single();
          if (rerr || !created) return jsonError(400, rerr?.message ?? "Could not create recipient");
          recipientId = created.id;
        }

        if (!recipientId) return jsonError(400, "recipient_id or recipient is required");

        const { data: recipient } = await supa
          .from("recipients")
          .select("*")
          .eq("id", recipientId)
          .eq("business_id", auth.businessId)
          .maybeSingle();
        if (!recipient) return jsonError(404, "Recipient not found");

        const { data: payout, error: perr } = await supa
          .from("payouts")
          .insert({
            business_id: auth.businessId,
            recipient_id: recipientId,
            amount: input.amount,
            currency: input.currency,
            rail: input.rail,
            memo: input.memo ?? null,
            status: "processing",
            source: "api",
            metadata: input.external_id ? { external_id: input.external_id } : {},
          })
          .select("*")
          .single();
        if (perr || !payout) return jsonError(500, perr?.message ?? "Failed to create payout");

        const result = await executePayout(payout, recipient);

        await supa
          .from("payouts")
          .update({
            status: result.status,
            resolved_rail: result.resolved_rail,
            external_reference: result.external_reference ?? null,
            failure_reason: result.failure_reason ?? null,
            completed_at: result.status === "completed" ? new Date().toISOString() : null,
          })
          .eq("id", payout.id);

        await supa.from("transactions").insert({
          business_id: auth.businessId,
          payout_id: payout.id,
          rail: result.resolved_rail,
          network: result.resolved_rail === "solana_usdc" ? "solana-devnet" : "dodo",
          tx_signature: result.tx_signature ?? result.external_reference ?? null,
          amount: input.amount,
          currency: input.currency,
          status: result.status,
        });

        return json({
          id: payout.id,
          status: result.status,
          rail: result.resolved_rail,
          tx_signature: result.tx_signature ?? null,
          external_reference: result.external_reference ?? null,
          failure_reason: result.failure_reason ?? null,
        });
      },
    },
  },
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function jsonError(status: number, message: string) {
  return json({ error: message }, status);
}
