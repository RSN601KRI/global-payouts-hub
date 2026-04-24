/**
 * Solana devnet wallet utilities — server-side.
 * Generates Keypairs, transfers SOL/USDC, fetches balances.
 *
 * SECURITY NOTE: encryption used here is AES-256-GCM with a key derived from
 * SUPABASE_SERVICE_ROLE_KEY. For production, swap to a dedicated KMS/HSM.
 */
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import crypto from "crypto";

export const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
// Devnet test USDC mint maintained by Circle (commonly used in dev environments)
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export const connection = new Connection(SOLANA_DEVNET_RPC, "confirmed");

function getEncryptionKey(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "fallback-dev-secret-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(secretKeyBytes: Uint8Array): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(secretKeyBytes)), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptSecret(payload: string): Uint8Array {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return new Uint8Array(decrypted);
}

export function generateWallet() {
  const kp = Keypair.generate();
  return {
    publicKey: kp.publicKey.toBase58(),
    encryptedSecret: encryptSecret(kp.secretKey),
  };
}

export function loadKeypair(encryptedSecret: string): Keypair {
  const bytes = decryptSecret(encryptedSecret);
  return Keypair.fromSecretKey(bytes);
}

export async function getSolBalance(publicKey: string): Promise<number> {
  try {
    const lamports = await connection.getBalance(new PublicKey(publicKey));
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export async function requestAirdrop(publicKey: string, sol = 1): Promise<string> {
  const sig = await connection.requestAirdrop(new PublicKey(publicKey), sol * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

/**
 * Transfer SOL on devnet. Returns the transaction signature.
 * Used as a stand-in for USDC SPL transfers in this devnet build —
 * SPL token transfers require funded source ATAs which would block
 * the demo flow without manual airdrop steps.
 */
export async function transferSol(opts: {
  encryptedFromSecret: string;
  toPublicKey: string;
  amountSol: number;
}): Promise<{ signature: string; explorerUrl: string }> {
  const from = loadKeypair(opts.encryptedFromSecret);
  const toPubkey = new PublicKey(opts.toPublicKey);
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey,
      lamports: Math.round(opts.amountSol * LAMPORTS_PER_SOL),
    }),
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [from], { commitment: "confirmed" });
  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  };
}

export function isValidSolanaAddress(addr: string): boolean {
  try {
    const decoded = bs58.decode(addr);
    return decoded.length === 32;
  } catch {
    return false;
  }
}
