import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createSchedule, runDueSchedules } from "@/server/payments.functions";
import { toast } from "sonner";
import { Plus, Play, Calendar } from "lucide-react";

export const Route = createFileRoute("/dashboard/schedules")({
  component: Schedules,
});

interface Schedule {
  id: string;
  name: string;
  cadence: string;
  status: string;
  next_run_at: string;
  last_run_at: string | null;
  total_amount: number | null;
  currency: string;
  rail: string;
  recipient_amounts: Array<{ recipient_id: string; amount: number }>;
}

function Schedules() {
  const { business, hasAnyRole } = useAuth();
  const canWrite = hasAnyRole(["admin", "finance"]);
  const [list, setList] = useState<Schedule[]>([]);
  const [recipients, setRecipients] = useState<Array<{ id: string; name: string }>>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cadence: "monthly" as "weekly" | "biweekly" | "monthly",
    next_run_at: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    currency: "USDC",
    rail: "auto" as "auto" | "solana_usdc" | "dodo_fiat",
  });
  const [picked, setPicked] = useState<Record<string, string>>({});

  const load = async () => {
    if (!business) return;
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from("payout_schedules").select("*").eq("business_id", business.id).order("next_run_at"),
      supabase.from("recipients").select("id, name").eq("business_id", business.id).eq("archived", false),
    ]);
    setList((s ?? []) as unknown as Schedule[]);
    setRecipients(r ?? []);
  };

  useEffect(() => {
    load();
  }, [business]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipient_amounts = Object.entries(picked)
      .filter(([, amt]) => amt && Number(amt) > 0)
      .map(([recipient_id, amount]) => ({ recipient_id, amount: Number(amount) }));
    if (recipient_amounts.length === 0) return toast.error("Pick at least one recipient with amount");
    setBusy(true);
    try {
      await createSchedule({
        data: {
          name: form.name,
          cadence: form.cadence,
          next_run_at: new Date(form.next_run_at).toISOString(),
          currency: form.currency,
          rail: form.rail,
          recipient_amounts,
        },
      });
      toast.success("Schedule created");
      setOpen(false);
      setPicked({});
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onRunDue = async () => {
    setBusy(true);
    try {
      const r = await runDueSchedules();
      toast.success(`Ran ${r.ran} payout(s)`);
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
          <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground text-sm">Recurring payouts for payroll and vendor cycles.</p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onRunDue} disabled={busy}>
              <Play className="size-4 mr-1" /> Run due now
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="size-4 mr-1" /> New schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>New payout schedule</DialogTitle></DialogHeader>
                <form onSubmit={onCreate} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="January contractors" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cadence</Label>
                      <Select value={form.cadence} onValueChange={(v) => setForm({ ...form, cadence: v as typeof form.cadence })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>First run</Label>
                      <Input type="date" value={form.next_run_at} onChange={(e) => setForm({ ...form, next_run_at: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rail</Label>
                      <Select value={form.rail} onValueChange={(v) => setForm({ ...form, rail: v as typeof form.rail })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="solana_usdc">Solana USDC</SelectItem>
                          <SelectItem value="dodo_fiat">Dodo fiat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-auto border rounded-md p-3">
                    {recipients.map((r) => (
                      <div key={r.id} className="flex items-center gap-3">
                        <Checkbox
                          checked={!!picked[r.id]}
                          onCheckedChange={(checked) => {
                            setPicked((p) => {
                              const next = { ...p };
                              if (checked) next[r.id] = "100";
                              else delete next[r.id];
                              return next;
                            });
                          }}
                        />
                        <div className="flex-1 text-sm">{r.name}</div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-28"
                          value={picked[r.id] ?? ""}
                          onChange={(e) => setPicked({ ...picked, [r.id]: e.target.value })}
                          placeholder="Amount"
                        />
                      </div>
                    ))}
                    {recipients.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No recipients yet</div>}
                  </div>

                  <Button type="submit" disabled={busy} className="w-full" variant="hero">Create schedule</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No schedules yet.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {list.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" /> {s.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.cadence} · next {new Date(s.next_run_at).toLocaleDateString()} · {s.recipient_amounts?.length ?? 0} recipients · {Number(s.total_amount ?? 0).toLocaleString()} {s.currency}
                    </div>
                  </div>
                  <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
