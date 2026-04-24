import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPayout } from "@/server/payments.functions";
import { toast } from "sonner";
import { Send, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard/payouts")({
  component: Payouts,
});

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  rail: string;
  resolved_rail: string | null;
  external_reference: string | null;
  failure_reason: string | null;
  created_at: string;
  recipient_id: string | null;
  source: string;
  recipients?: { name: string } | null;
}

interface RecipientLite {
  id: string;
  name: string;
}

function Payouts() {
  const { business, hasAnyRole } = useAuth();
  const canSend = hasAnyRole(["admin", "finance"]);
  const [list, setList] = useState<Payout[]>([]);
  const [recipients, setRecipients] = useState<RecipientLite[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    recipient_id: "",
    amount: "100",
    currency: "USDC",
    rail: "auto" as "auto" | "solana_usdc" | "dodo_fiat",
    memo: "",
  });

  const load = async () => {
    if (!business) return;
    const [{ data: payoutsData }, { data: recData }] = await Promise.all([
      supabase
        .from("payouts")
        .select("*, recipients(name)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("recipients").select("id, name").eq("business_id", business.id).eq("archived", false),
    ]);
    setList((payoutsData ?? []) as Payout[]);
    setRecipients(recData ?? []);
  };

  useEffect(() => {
    load();
    if (!business) return;
    const channel = supabase
      .channel("payouts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "payouts", filter: `business_id=eq.${business.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [business]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await createPayout({
        data: {
          recipient_id: form.recipient_id,
          amount: Number(form.amount),
          currency: form.currency,
          rail: form.rail,
          memo: form.memo || undefined,
        },
      });
      if (result.ok) toast.success(`Payout ${result.status} via ${result.resolved_rail}`);
      else toast.error(`Payout failed: ${result.failure_reason ?? "unknown"}`);
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground text-sm">Real-time stablecoin and fiat transfers.</p>
        </div>
        {canSend && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={recipients.length === 0}>
                <Send className="size-4 mr-1" /> New payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send payout</DialogTitle></DialogHeader>
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Recipient</Label>
                  <Select value={form.recipient_id} onValueChange={(v) => setForm({ ...form, recipient_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Choose recipient" /></SelectTrigger>
                    <SelectContent>
                      {recipients.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label>Amount</Label>
                    <Input type="number" step="0.01" min="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Rail</Label>
                  <Select value={form.rail} onValueChange={(v) => setForm({ ...form, rail: v as typeof form.rail })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (recommended)</SelectItem>
                      <SelectItem value="solana_usdc">Solana USDC (devnet)</SelectItem>
                      <SelectItem value="dodo_fiat">Dodo fiat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Memo (optional)</Label>
                  <Input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
                </div>
                <Button type="submit" disabled={busy || !form.recipient_id} className="w-full" variant="hero">
                  {busy ? "Sending…" : "Send payout"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {recipients.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Add a recipient first — <Link to="/dashboard/recipients" className="text-primary underline">Recipients</Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No payouts yet.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {list.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{p.recipients?.name ?? "Unknown"} — {Number(p.amount).toLocaleString()} {p.currency}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{new Date(p.created_at).toLocaleString()}</span>
                      <span>·</span>
                      <span className="capitalize">{(p.resolved_rail ?? p.rail).replace("_", " ")}</span>
                      <span>·</span>
                      <span className="capitalize">{p.source}</span>
                      {p.external_reference && p.resolved_rail === "solana_usdc" && (
                        <a
                          href={`https://explorer.solana.com/tx/${p.external_reference}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1"
                        >
                          tx <ExternalLink className="size-3" />
                        </a>
                      )}
                      {p.failure_reason && <span className="text-destructive">· {p.failure_reason}</span>}
                    </div>
                  </div>
                  <Badge variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "secondary"}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
