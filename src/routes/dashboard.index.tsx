import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Motion";
import { motion } from "framer-motion";
import { submitKyc } from "@/server/payments.functions";
import { toast } from "sonner";
import { ArrowUpRight, DollarSign, Send, TrendingUp, Users, AlertTriangle, Activity } from "lucide-react";
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
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">Cross-border stablecoin payouts at a glance.</p>
          </div>
          <Badge variant="outline" className="gap-1.5 py-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-mint" />
            </span>
            Solana devnet · Dodo Test
          </Badge>
        </div>
      </Reveal>

      {business?.kyc_status !== "approved" && hasRole("admin") && (
        <Reveal>
          <Card className="border-amber-500/30 bg-amber-500/5 overflow-hidden relative">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                Complete KYC to unlock fiat payouts
              </CardTitle>
              <CardDescription>
                Crypto rails work without KYC, but Dodo Payments requires verified business info.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
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
        </Reveal>
      )}

      <StaggerGroup className="grid gap-4 md:grid-cols-4">
        <StaggerItem><StatCard icon={DollarSign} label="Total sent" value={`$${stats.totalSent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} trend="+12.4%" /></StaggerItem>
        <StaggerItem><StatCard icon={Send} label="Payouts" value={stats.payoutCount.toString()} trend="+8" /></StaggerItem>
        <StaggerItem><StatCard icon={Users} label="Recipients" value={stats.recipientCount.toString()} /></StaggerItem>
        <StaggerItem><StatCard icon={TrendingUp} label="Success rate" value={`${stats.successRate.toFixed(1)}%`} sub={stats.failures > 0 ? `${stats.failures} failed` : "all healthy"} /></StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.1}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 glass overflow-hidden">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Volume</CardTitle>
                <CardDescription>Last 14 days, USD-equivalent</CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Activity className="size-2.5" /> Live
              </Badge>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.18 265)" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="oklch(0.7 0.18 265)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0.04 265 / 0.2)" />
                  <XAxis dataKey="day" stroke="oklch(0.7 0.02 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.03 265 / 0.95)",
                      border: "1px solid oklch(0.4 0.04 265 / 0.4)",
                      borderRadius: 10,
                      fontSize: 12,
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Area type="monotone" dataKey="usd" stroke="oklch(0.7 0.18 265)" fill="url(#g)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Transaction count</CardTitle>
              <CardDescription>Daily payout volume</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.4 0.04 265 / 0.2)" />
                  <XAxis dataKey="day" stroke="oklch(0.7 0.02 260)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0.03 265 / 0.95)",
                      border: "1px solid oklch(0.4 0.04 265 / 0.4)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="oklch(0.78 0.15 220)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <Card className="glass">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent payouts</CardTitle>
              <CardDescription>Latest 6 transactions across rails</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="text-sm text-muted-foreground py-12 text-center">
                No payouts yet — send your first stablecoin transfer.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recent.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{Number(p.amount).toLocaleString()} {p.currency}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(p.created_at).toLocaleString()} · {p.resolved_rail ?? "—"}
                      </div>
                    </div>
                    <Badge variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "secondary"}>
                      {p.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend }: { icon: typeof ArrowUpRight; label: string; value: string; sub?: string; trend?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="glass relative overflow-hidden h-full">
        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-primary/5 blur-2xl" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="size-3.5 text-primary" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
          <div className="flex items-center gap-2 mt-1">
            {trend && <span className="text-[11px] text-mint font-medium">{trend}</span>}
            {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
