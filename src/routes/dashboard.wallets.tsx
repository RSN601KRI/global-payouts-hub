import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createWallet, refreshWalletBalances } from "@/server/payments.functions";
import { toast } from "sonner";
import { Plus, RefreshCw, Copy, ExternalLink, Wallet } from "lucide-react";

export const Route = createFileRoute("/dashboard/wallets")({
  component: Wallets,
});

interface WalletRow {
  id: string;
  label: string;
  network: string;
  public_key: string;
  balance_sol: number | null;
  balance_usdc: number | null;
  is_default: boolean;
}

function Wallets() {
  const { business, hasAnyRole } = useAuth();
  const canWrite = hasAnyRole(["admin", "finance"]);
  const [list, setList] = useState<WalletRow[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!business) return;
    const { data } = await supabase
      .from("wallets")
      .select("id, label, network, public_key, balance_sol, balance_usdc, is_default")
      .eq("business_id", business.id)
      .order("is_default", { ascending: false });
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, [business]);

  const onCreate = async () => {
    setBusy(true);
    try {
      const r = await createWallet({ data: { airdrop: true } });
      toast.success(`Wallet created · airdropped 1 SOL`);
      console.log("New wallet public key:", r.public_key);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    setBusy(true);
    try {
      await refreshWalletBalances();
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground text-sm">Solana devnet treasury accounts powering on-chain payouts.</p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={refresh} disabled={busy}>
              <RefreshCw className="size-4 mr-1" /> Refresh balances
            </Button>
            <Button variant="hero" onClick={onCreate} disabled={busy}>
              <Plus className="size-4 mr-1" /> New wallet
            </Button>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="size-8 mx-auto text-muted-foreground" />
            <div className="text-sm text-muted-foreground mt-2">No wallets yet — create your first treasury wallet.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((w) => (
            <Card key={w.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    <Wallet className="size-4" /> {w.label}
                  </div>
                  {w.is_default && <Badge variant="outline">default</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{w.network}</div>
                <div className="font-mono text-xs flex items-center gap-2 bg-muted/50 rounded p-2">
                  <span className="truncate">{w.public_key}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(w.public_key);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="size-3 text-muted-foreground hover:text-foreground" />
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${w.public_key}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-3 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">SOL</div>
                    <div className="text-lg font-semibold">{Number(w.balance_sol ?? 0).toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">USDC (devnet)</div>
                    <div className="text-lg font-semibold">{Number(w.balance_usdc ?? 0).toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
