import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitKyc } from "@/server/payments.functions";
import { toast } from "sonner";
import { ArrowUpRight, DollarSign, Send, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

interface Stats {
  totalSent: number;
  payoutCount: number;
  recipientCount: number;
  successRate: number;
  failures: number;
}

function Overview() {
  const { business, refresh, hasRole } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalSent: 0, payoutCount: 0, recipientCount: 0, successRate: 0, failures: 0 });
  const [series, setSeries] = useState<{ day: string; usd: number; count: number }[]>([]);
  const [recent, setRecent] = useState<Array<{ id: string; amount: number; currency: string; status: string; created_at: string; resolved_rail: string | null }>>([]);
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!business) return;
    (async () => {
      const [{ data: payouts }, { count: rCount }] = await Promise.all([
        supabase
          .from("payouts")
          .select("id, amount, currency, status, created_at, resolved_rail")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("recipients").select("*", { count: "exact", head: true }).eq("business_id", business.id),
      ]);
      const list = payouts ?? [];
      const completed = list.filter((p) => p.status === "completed");
      const failed = list.filter((p) => p.status === "failed");
      const totalSent = completed.reduce((s, p) => s + Number(p.amount), 0);
      const successRate = list.length === 0 ? 0 : (completed.length / list.length) * 100;
      setStats({
        totalSent,
        payoutCount: list.length,
        recipientCount: rCount ?? 0,
        successRate,
        failures: failed.length,
      });

      // 14-day series
      const map = new Map<string, { usd: number; count: number }>();
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        map.set(d.toISOString().slice(0, 10), { usd: 0, count: 0 });
      }
      for (const p of list) {
        const k = new Date(p.created_at).toISOString().slice(0, 10);
        if (map.has(k)) {
          const cur = map.get(k)!;
          if (p.status === "completed") cur.usd += Number(p.amount);
          cur.count += 1;
        }
      }
      setSeries(Array.from(map.entries()).map(([day, v]) => ({ day: day.slice(5), usd: v.usd, count: v.count })));
      setRecent(list.slice(0, 6));
    })();
  }, [business]);

  const onSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitKyc({ data: { legal_name: legalName, country: country.toUpperCase() } });
      toast.success("KYC submitted — auto-approving in dev");
      setTimeout(refresh, 2500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm">Cross-border stablecoin payouts at a glance.</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Solana devnet · Dodo Test
        </Badge>
      </div>

      {business?.kyc_status !== "approved" && hasRole("admin") && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              Complete KYC to unlock fiat payouts
            </CardTitle>
            <CardDescription>
              Crypto rails work without KYC, but Dodo Payments requires verified business info.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmitKyc} className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Legal business name</Label>
                <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} required minLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Country (ISO-2)</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} required maxLength={2} placeholder="US" />
              </div>
              <Button type="submit" disabled={submitting} className="sm:col-span-3" variant="hero">
                Submit for verification
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={DollarSign} label="Total sent" value={`$${stats.totalSent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <StatCard icon={Send} label="Payouts" value={stats.payoutCount.toString()} />
        <StatCard icon={Users} label="Recipients" value={stats.recipientCount.toString()} />
        <StatCard icon={TrendingUp} label="Success rate" value={`${stats.successRate.toFixed(1)}%`} sub={stats.failures > 0 ? `${stats.failures} failed` : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Volume — last 14 days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="usd" stroke="hsl(var(--primary))" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction count</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent payouts</CardTitle>
            <CardDescription>Latest 6 transactions across rails</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No payouts yet.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {recent.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{Number(p.amount).toLocaleString()} {p.currency}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()} · {p.resolved_rail ?? "—"}</div>
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

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof ArrowUpRight; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{label}</div>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
