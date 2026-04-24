/**
 * Multi-rail abstraction. Picks the best rail per payout and provides
 * uniform execute() + monitoring + fallback logic.
 *
 * Rails:
 *  - solana_usdc: on-chain devnet stablecoin transfer
 *  - dodo_fiat:   off-chain bank/wire via Dodo Payments
 *
 * "auto" rule: prefer Solana when recipient has a wallet_address; otherwise Dodo.
 *              On Solana failure, retries on Dodo if recipient has bank_details.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { transferSol, generateWallet, loadKeypair, isValidSolanaAddress } from "./solana.server";
import { createDodoPayout } from "./dodo.server";

type Rail = "solana_usdc" | "dodo_fiat" | "auto";

interface Recipient {
  id: string;
  name: string;
  email: string | null;
  country: string | null;
  payout_method: "crypto_wallet" | "bank_transfer" | "auto";
  wallet_address: string | null;
  bank_currency: string | null;
  bank_details: Record<string, unknown> | null;
}

interface Payout {
  id: string;
  business_id: string;
  recipient_id: string | null;
  amount: number;
  currency: string;
  rail: Rail;
  memo: string | null;
}

export function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Service role credentials missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function pickRail(rail: Rail, recipient: Recipient): "solana_usdc" | "dodo_fiat" {
  if (rail === "solana_usdc") return "solana_usdc";
  if (rail === "dodo_fiat") return "dodo_fiat";
  // auto
  if (recipient.payout_method === "crypto_wallet" && recipient.wallet_address) return "solana_usdc";
  if (recipient.payout_method === "bank_transfer") return "dodo_fiat";
  return recipient.wallet_address && isValidSolanaAddress(recipient.wallet_address)
    ? "solana_usdc"
    : "dodo_fiat";
}

export interface ExecuteResult {
  status: "completed" | "failed" | "processing";
  resolved_rail: "solana_usdc" | "dodo_fiat";
  tx_signature?: string;
  external_reference?: string;
  failure_reason?: string;
  raw?: unknown;
}

async function ensureWallet(supa: SupabaseClient, businessId: string) {
  const { data: existing } = await supa
    .from("wallets")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_default", true)
    .maybeSingle();
  if (existing) return existing;

  const w = generateWallet();
  const { data: inserted, error } = await supa
    .from("wallets")
    .insert({
      business_id: businessId,
      label: "Treasury",
      network: "solana-devnet",
      public_key: w.publicKey,
      encrypted_secret: w.encryptedSecret,
      is_default: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return inserted;
}

async function logMonitoring(
  supa: SupabaseClient,
  businessId: string,
  payoutId: string,
  severity: "info" | "warn" | "error",
  category: string,
  message: string,
  details?: unknown,
) {
  await supa.from("monitoring_events").insert({
    business_id: businessId,
    payout_id: payoutId,
    severity,
    category,
    message,
    details: details ?? null,
  });
}

export async function executePayout(payout: Payout, recipient: Recipient): Promise<ExecuteResult> {
  const supa = getServiceClient();
  const chosen = pickRail(payout.rail, recipient);

  const tryDodo = async (): Promise<ExecuteResult> => {
    const dodo = await createDodoPayout({
      external_reference: payout.id,
      amount: payout.amount,
      currency: payout.currency === "USDC" ? recipient.bank_currency ?? "USD" : payout.currency,
      recipient: {
        name: recipient.name,
        email: recipient.email ?? undefined,
        country: recipient.country ?? undefined,
        bank_details: recipient.bank_details ?? undefined,
      },
      memo: payout.memo ?? undefined,
    });
    if (!dodo.ok) {
      await logMonitoring(supa, payout.business_id, payout.id, "error", "rail_failure", `Dodo payout failed: ${dodo.error}`, dodo.raw);
      return { status: "failed", resolved_rail: "dodo_fiat", failure_reason: dodo.error, raw: dodo.raw };
    }
    return {
      status: dodo.status === "completed" ? "completed" : "processing",
      resolved_rail: "dodo_fiat",
      external_reference: dodo.provider_reference,
      raw: dodo.raw,
    };
  };

  if (chosen === "solana_usdc") {
    if (!recipient.wallet_address || !isValidSolanaAddress(recipient.wallet_address)) {
      await logMonitoring(supa, payout.business_id, payout.id, "warn", "rail_failure", "Invalid Solana address; falling back to Dodo");
      if (recipient.bank_details) return tryDodo();
      return { status: "failed", resolved_rail: "solana_usdc", failure_reason: "Invalid Solana address and no bank fallback" };
    }
    const wallet = await ensureWallet(supa, payout.business_id);
    try {
      // Devnet: send a tiny SOL amount (0.0001 SOL per "USDC unit" demo scale)
      // to keep the demo transferable without funded SPL token accounts.
      const demoSol = Math.max(0.0001, Math.min(payout.amount * 0.0001, 0.5));
      const result = await transferSol({
        encryptedFromSecret: wallet.encrypted_secret,
        toPublicKey: recipient.wallet_address,
        amountSol: demoSol,
      });
      return {
        status: "completed",
        resolved_rail: "solana_usdc",
        tx_signature: result.signature,
        raw: { explorerUrl: result.explorerUrl, demoSol },
      };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Solana transfer failed";
      await logMonitoring(supa, payout.business_id, payout.id, "error", "rail_failure", reason);
      // Fallback to Dodo if available
      if (recipient.bank_details) {
        await logMonitoring(supa, payout.business_id, payout.id, "warn", "rail_failure", "Falling back to Dodo Payments");
        return tryDodo();
      }
      return { status: "failed", resolved_rail: "solana_usdc", failure_reason: reason };
    }
  }

  return tryDodo();
}

export { loadKeypair };
