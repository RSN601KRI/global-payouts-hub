import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createApiKey, revokeApiKey } from "@/server/payments.functions";
import { toast } from "sonner";
import { KeyRound, Plus, Copy, Trash2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/dashboard/api-keys")({
  component: ApiKeys,
});

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

function ApiKeys() {
  const { business, hasRole } = useAuth();
  const [list, setList] = useState<ApiKey[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!business) return;
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, [business]);

  if (!hasRole("admin")) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardContent className="py-8 text-center">
            <ShieldAlert className="size-8 mx-auto text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">Only admins can manage API keys.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await createApiKey({ data: { name } });
      setNewKey(r.api_key);
      setName("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      await revokeApiKey({ data: { id } });
      toast.success("Key revoked");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground text-sm">Programmatic access for your SaaS to trigger payouts.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setNewKey(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="size-4 mr-1" /> New API key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{newKey ? "API key created" : "Create API key"}</DialogTitle></DialogHeader>
            {newKey ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Copy this key now — it won't be shown again.</div>
                <div className="font-mono text-xs bg-muted p-3 rounded break-all">{newKey}</div>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(newKey);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="size-4 mr-1" /> Copy
                </Button>
              </div>
            ) : (
              <form onSubmit={onCreate} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Key name</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Production server" />
                </div>
                <Button type="submit" disabled={busy} className="w-full" variant="hero">Create</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No keys yet.</div>
          ) : (
            <div className="divide-y divide-border/50">
              {list.map((k) => (
                <div key={k.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2"><KeyRound className="size-4 text-muted-foreground" /> {k.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{k.key_prefix}…</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Scopes: {k.scopes.join(", ")} · created {new Date(k.created_at).toLocaleDateString()}
                      {k.last_used_at && ` · last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {k.revoked_at ? (
                      <Badge variant="destructive">revoked</Badge>
                    ) : (
                      <>
                        <Badge variant="default">active</Badge>
                        <Button size="sm" variant="ghost" onClick={() => onRevoke(k.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-2">Quickstart</h3>
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://your-app"}/api/public/v1/payouts \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient_id": "<uuid>",
    "amount": 250,
    "currency": "USDC",
    "rail": "auto",
    "memo": "Invoice #1042"
  }'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
