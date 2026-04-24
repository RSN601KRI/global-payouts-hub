/**
 * Server functions exposed to the dashboard.
 * Each handler validates the user is a member of the target business
 * before doing anything privileged.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";
import { generateWallet, requestAirdrop, getSolBalance } from "./solana.server";
import { executePayout, getServiceClient } from "./payments.server";

function getUserClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const auth = getRequestHeader("authorization") ?? "";
  return createClient(url, key, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireUserAndBusiness() {
  const supa = getUserClient();
  const { data: u } = await supa.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { data: profile } = await supa
    .from("profiles")
    .select("current_business_id")
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (!profile?.current_business_id) throw new Error("No business context");
  return { supa, userId: u.user.id, businessId: profile.current_business_id as string };
}

async function requireRole(roles: ("admin" | "finance" | "viewer")[]) {
  const ctx = await requireUserAndBusiness();
  const { data } = await ctx.supa
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("business_id", ctx.businessId);
  const userRoles = (data ?? []).map((r) => r.role);
  if (!userRoles.some((r) => roles.includes(r as "admin" | "finance" | "viewer"))) {
    throw new Error("Insufficient permissions");
  }
  return ctx;
}

// ===== KYC =====
export const submitKyc = createServerFn({ method: "POST" })
  .inputValidator((d: { legal_name: string; country: string }) =>
    z.object({ legal_name: z.string().min(2).max(200), country: z.string().min(2).max(2) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supa, businessId } = await requireRole(["admin"]);
    const { error } = await supa
      .from("businesses")
      .update({
        legal_name: data.legal_name,
        country: data.country,
        kyc_status: "in_review",
        kyc_submitted_at: new Date().toISOString(),
      })
      .eq("id", businessId);
    if (error) throw error;
    // Auto-approve in dev for demo purposes
    const admin = getServiceClient();
    setTimeout(async () => {
      await admin
        .from("businesses")
        .update({ kyc_status: "approved", kyc_approved_at: new Date().toISOString() })
        .eq("id", businessId);
    }, 2000);
    return { ok: true };
  });

// ===== Wallets =====
export const createWallet = createServerFn({ method: "POST" })
  .inputValidator((d: { label?: string; airdrop?: boolean }) =>
    z.object({ label: z.string().max(60).optional(), airdrop: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { businessId } = await requireRole(["admin", "finance"]);
    const admin = getServiceClient();
    const w = generateWallet();
    const { count } = await admin.from("wallets").select("*", { count: "exact", head: true }).eq("business_id", businessId);
    const { error } = await admin.from("wallets").insert({
      business_id: businessId,
      label: data.label ?? "Treasury",
      network: "solana-devnet",
      public_key: w.publicKey,
      encrypted_secret: w.encryptedSecret,
      is_default: (count ?? 0) === 0,
    });
    if (error) throw new Error(error.message);
    if (data.airdrop) {
      try {
        await requestAirdrop(w.publicKey, 1);
      } catch {
        // devnet airdrop sometimes throttled; ignore
      }
    }
    return { ok: true, public_key: w.publicKey };
  });

export const refreshWalletBalances = createServerFn({ method: "POST" }).handler(async () => {
  const { businessId } = await requireRole(["admin", "finance", "viewer"]);
  const admin = getServiceClient();
  const { data: wallets } = await admin.from("wallets").select("id, public_key").eq("business_id", businessId);
  if (!wallets) return { updated: 0 };
  for (const w of wallets) {
    const sol = await getSolBalance(w.public_key);
    await admin.from("wallets").update({ balance_sol: sol }).eq("id", w.id);
  }
  return { updated: wallets.length };
});

// ===== Payouts =====
const payoutInput = z.object({
  recipient_id: z.string().uuid(),
  amount: z.number().positive().max(1_000_000),
  currency: z.string().min(3).max(8).default("USDC"),
  rail: z.enum(["solana_usdc", "dodo_fiat", "auto"]).default("auto"),
  memo: z.string().max(200).optional(),
});

export const createPayout = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof payoutInput>) => payoutInput.parse(d))
  .handler(async ({ data }) => {
    const { businessId, userId } = await requireRole(["admin", "finance"]);
    const admin = getServiceClient();

    const { data: recipient, error: rerr } = await admin
      .from("recipients")
      .select("*")
      .eq("id", data.recipient_id)
      .eq("business_id", businessId)
      .maybeSingle();
    if (rerr || !recipient) throw new Error("Recipient not found");

    const { data: payout, error: perr } = await admin
      .from("payouts")
      .insert({
        business_id: businessId,
        recipient_id: data.recipient_id,
        amount: data.amount,
        currency: data.currency,
        rail: data.rail,
        memo: data.memo,
        status: "processing",
        initiated_by: userId,
        source: "dashboard",
      })
      .select("*")
      .single();
    if (perr || !payout) throw new Error(perr?.message ?? "Failed to create payout");

    const result = await executePayout(payout, recipient);

    await admin
      .from("payouts")
      .update({
        status: result.status,
        resolved_rail: result.resolved_rail,
        external_reference: result.external_reference ?? null,
        failure_reason: result.failure_reason ?? null,
        completed_at: result.status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", payout.id);

    await admin.from("transactions").insert({
      business_id: businessId,
      payout_id: payout.id,
      rail: result.resolved_rail,
      network: result.resolved_rail === "solana_usdc" ? "solana-devnet" : "dodo",
      tx_signature: result.tx_signature ?? result.external_reference ?? null,
      amount: data.amount,
      currency: data.currency,
      status: result.status,
      raw_response: result.raw ?? null,
    });

    const { raw: _raw, ...resultSafe } = result;
    return { ok: result.status !== "failed", payout_id: payout.id, ...resultSafe };
  });

// ===== Schedules =====
const scheduleInput = z.object({
  name: z.string().min(2).max(120),
  cadence: z.enum(["weekly", "biweekly", "monthly"]),
  next_run_at: z.string(),
  currency: z.string().default("USDC"),
  rail: z.enum(["solana_usdc", "dodo_fiat", "auto"]).default("auto"),
  recipient_amounts: z.array(z.object({ recipient_id: z.string().uuid(), amount: z.number().positive() })).min(1),
});

export const createSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof scheduleInput>) => scheduleInput.parse(d))
  .handler(async ({ data }) => {
    const { businessId } = await requireRole(["admin", "finance"]);
    const admin = getServiceClient();
    const total = data.recipient_amounts.reduce((s, r) => s + r.amount, 0);
    const { error } = await admin.from("payout_schedules").insert({
      business_id: businessId,
      name: data.name,
      cadence: data.cadence,
      next_run_at: data.next_run_at,
      currency: data.currency,
      rail: data.rail,
      recipient_amounts: data.recipient_amounts,
      total_amount: total,
      status: "active",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const runDueSchedules = createServerFn({ method: "POST" }).handler(async () => {
  const { businessId } = await requireRole(["admin", "finance"]);
  const admin = getServiceClient();
  const now = new Date();
  const { data: schedules } = await admin
    .from("payout_schedules")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "active")
    .lte("next_run_at", now.toISOString());
  if (!schedules?.length) return { ran: 0 };

  let ran = 0;
  for (const s of schedules) {
    const items = (s.recipient_amounts as Array<{ recipient_id: string; amount: number }>) ?? [];
    for (const item of items) {
      const { data: recipient } = await admin.from("recipients").select("*").eq("id", item.recipient_id).maybeSingle();
      if (!recipient) continue;
      const { data: payout } = await admin
        .from("payouts")
        .insert({
          business_id: businessId,
          recipient_id: item.recipient_id,
          schedule_id: s.id,
          amount: item.amount,
          currency: s.currency,
          rail: s.rail,
          status: "processing",
          source: "schedule",
        })
        .select("*")
        .single();
      if (!payout) continue;
      const result = await executePayout(payout, recipient);
      await admin
        .from("payouts")
        .update({
          status: result.status,
          resolved_rail: result.resolved_rail,
          external_reference: result.external_reference ?? null,
          failure_reason: result.failure_reason ?? null,
          completed_at: result.status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", payout.id);
      await admin.from("transactions").insert({
        business_id: businessId,
        payout_id: payout.id,
        rail: result.resolved_rail,
        network: result.resolved_rail === "solana_usdc" ? "solana-devnet" : "dodo",
        tx_signature: result.tx_signature ?? result.external_reference ?? null,
        amount: item.amount,
        currency: s.currency,
        status: result.status,
        raw_response: result.raw ?? null,
      });
      ran++;
    }

    // Roll forward the schedule
    const next = new Date(s.next_run_at);
    if (s.cadence === "weekly") next.setDate(next.getDate() + 7);
    else if (s.cadence === "biweekly") next.setDate(next.getDate() + 14);
    else next.setMonth(next.getMonth() + 1);
    await admin
      .from("payout_schedules")
      .update({ last_run_at: now.toISOString(), next_run_at: next.toISOString() })
      .eq("id", s.id);
  }
  return { ran };
});

// ===== API keys =====
export const createApiKey = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string }) => z.object({ name: z.string().min(2).max(60) }).parse(d))
  .handler(async ({ data }) => {
    const { businessId, userId } = await requireRole(["admin"]);
    const admin = getServiceClient();
    const raw = `sk_live_${crypto.randomBytes(24).toString("base64url")}`;
    const hashed = crypto.createHash("sha256").update(raw).digest("hex");
    const prefix = raw.slice(0, 12);
    const { error } = await admin.from("api_keys").insert({
      business_id: businessId,
      name: data.name,
      key_prefix: prefix,
      hashed_key: hashed,
      created_by: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true, api_key: raw, prefix };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { businessId } = await requireRole(["admin"]);
    const admin = getServiceClient();
    await admin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("business_id", businessId);
    return { ok: true };
  });
