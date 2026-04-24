/**
 * Dodo Payments adapter — fiat off-ramp for cross-border payouts.
 * Wraps the Dodo Payments REST API. All calls go through this adapter
 * so we can swap providers without touching business logic.
 */
const DODO_BASE_URL = process.env.DODO_PAYMENTS_BASE_URL ?? "https://test.dodopayments.com";

export interface DodoPayoutRequest {
  external_reference: string;
  amount: number; // in major units
  currency: string; // e.g. USD, EUR, INR
  recipient: {
    name: string;
    email?: string;
    country?: string;
    bank_details?: Record<string, unknown>;
  };
  memo?: string;
}

export interface DodoPayoutResponse {
  ok: boolean;
  provider_reference: string;
  status: "queued" | "processing" | "completed" | "failed";
  raw: unknown;
  error?: string;
}

function authHeader(): Record<string, string> {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error("DODO_PAYMENTS_API_KEY is not configured");
  return { Authorization: `Bearer ${key}` };
}

export async function createDodoPayout(req: DodoPayoutRequest): Promise<DodoPayoutResponse> {
  try {
    const res = await fetch(`${DODO_BASE_URL}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(req),
    });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        provider_reference: req.external_reference,
        status: "failed",
        raw,
        error: typeof raw === "object" && raw && "message" in raw ? String((raw as { message: unknown }).message) : `HTTP ${res.status}`,
      };
    }
    const data = raw as { id?: string; status?: string };
    return {
      ok: true,
      provider_reference: data.id ?? req.external_reference,
      status: (data.status as DodoPayoutResponse["status"]) ?? "queued",
      raw,
    };
  } catch (err) {
    return {
      ok: false,
      provider_reference: req.external_reference,
      status: "failed",
      raw: null,
      error: err instanceof Error ? err.message : "Network error contacting Dodo Payments",
    };
  }
}

export async function getDodoPayout(providerReference: string): Promise<DodoPayoutResponse> {
  try {
    const res = await fetch(`${DODO_BASE_URL}/payouts/${providerReference}`, {
      headers: authHeader(),
    });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, provider_reference: providerReference, status: "failed", raw, error: `HTTP ${res.status}` };
    }
    const data = raw as { status?: string };
    return {
      ok: true,
      provider_reference: providerReference,
      status: (data.status as DodoPayoutResponse["status"]) ?? "processing",
      raw,
    };
  } catch (err) {
    return {
      ok: false,
      provider_reference: providerReference,
      status: "failed",
      raw: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Verify a Dodo webhook signature. Uses HMAC-SHA256 over the raw body
 * with the configured webhook secret.
 */
export async function verifyDodoSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const crypto = await import("crypto");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
