import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Mail, Globe } from "lucide-react";

export const Route = createFileRoute("/dashboard/recipients")({
  component: Recipients,
});

interface Recipient {
  id: string;
  name: string;
  email: string | null;
  country: string | null;
  payout_method: "crypto_wallet" | "bank_transfer" | "auto";
  wallet_address: string | null;
  bank_currency: string | null;
  archived: boolean;
}

function Recipients() {
  const { business, hasAnyRole } = useAuth();
  const canWrite = hasAnyRole(["admin", "finance"]);
  const [list, setList] = useState<Recipient[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    payout_method: "auto" as Recipient["payout_method"],
    wallet_address: "",
    bank_currency: "",
    bank_iban: "",
    bank_bic: "",
  });

  const load = async () => {
    if (!business) return;
    const { data } = await supabase
      .from("recipients")
      .select("id, name, email, country, payout_method, wallet_address, bank_currency, archived")
      .eq("business_id", business.id)
      .eq("archived", false)
      .order("created_at", { ascending: false });
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, [business]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    const bank_details = form.bank_iban
      ? { iban: form.bank_iban, bic: form.bank_bic, currency: form.bank_currency }
      : null;
    const { error } = await supabase.from("recipients").insert({
      business_id: business.id,
      name: form.name,
      email: form.email || null,
      country: form.country.toUpperCase() || null,
      payout_method: form.payout_method,
      wallet_address: form.wallet_address || null,
      bank_currency: form.bank_currency || null,
      bank_details,
    });
    if (error) return toast.error(error.message);
    toast.success("Recipient added");
    setOpen(false);
    setForm({ name: "", email: "", country: "", payout_method: "auto", wallet_address: "", bank_currency: "", bank_iban: "", bank_bic: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipients</h1>
          <p className="text-muted-foreground text-sm">Contractors, vendors, and team members you pay.</p>
        </div>
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="size-4 mr-1" /> Add recipient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New recipient</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                  <Field label="Country (ISO-2)"><Input maxLength={2} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
                  <Field label="Method">
                    <Select value={form.payout_method} onValueChange={(v) => setForm({ ...form, payout_method: v as Recipient["payout_method"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="crypto_wallet">Solana wallet</SelectItem>
                        <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Solana wallet address (optional)">
                  <Input placeholder="Base58 address" value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Bank currency"><Input placeholder="USD" value={form.bank_currency} onChange={(e) => setForm({ ...form, bank_currency: e.target.value })} /></Field>
                  <Field label="IBAN"><Input value={form.bank_iban} onChange={(e) => setForm({ ...form, bank_iban: e.target.value })} /></Field>
                  <Field label="BIC"><Input value={form.bank_bic} onChange={(e) => setForm({ ...form, bank_bic: e.target.value })} /></Field>
                </div>
                <Button type="submit" className="w-full" variant="hero">Save recipient</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No recipients yet.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {list.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      {r.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {r.email}</span>}
                      {r.country && <span className="inline-flex items-center gap-1"><Globe className="size-3" /> {r.country}</span>}
                      {r.wallet_address && <span className="font-mono truncate">{r.wallet_address.slice(0, 8)}…{r.wallet_address.slice(-4)}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{r.payout_method.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
