/**
 * Inbound webhook from Dodo Payments (status updates for fiat payouts).
 * Verifies HMAC-SHA256 signature with DODO_PAYMENTS_WEBHOOK_SECRET, then
 * updates the matching payout/transaction records.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyDodoSignature } from "@/server/dodo.server";

export const Route = createFileRoute("/api/public/webhooks/dodo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const sig = request.headers.get("x-dodo-signature");
        const ok = await verifyDodoSignature(raw, sig);
        if (!ok) return new Response("Invalid signature", { status: 401 });

        let payload: { event?: string; payout_id?: string; external_reference?: string; status?: string };
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const ref = payload.external_reference ?? payload.payout_id;
        if (!ref) return new Response("Missing reference", { status: 400 });

        const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const newStatus =
          payload.status === "completed" ? "completed" :
          payload.status === "failed" ? "failed" :
          "processing";

        await supa
          .from("payouts")
          .update({
            status: newStatus,
            completed_at: newStatus === "completed" ? new Date().toISOString() : null,
            failure_reason: newStatus === "failed" ? "Reported failed by provider" : null,
          })
          .eq("id", ref);

        return new Response("ok", { status: 200 });
      },
    },
  },
});
