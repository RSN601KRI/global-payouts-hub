import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

interface Member {
  user_id: string;
  joined_at: string;
  invited_email: string | null;
  profile?: { display_name: string | null; email: string | null } | null;
  role?: string | null;
}

function SettingsPage() {
  const { business, refresh, hasRole } = useAuth();
  const [name, setName] = useState(business?.name ?? "");
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => setName(business?.name ?? ""), [business]);

  useEffect(() => {
    if (!business) return;
    (async () => {
      const { data: m } = await supabase
        .from("business_members")
        .select("user_id, joined_at, invited_email")
        .eq("business_id", business.id);
      const userIds = (m ?? []).map((x) => x.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .in("user_id", userIds);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("business_id", business.id);
      const byUser = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      const roleByUser = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
      setMembers(
        (m ?? []).map((mem) => ({
          ...mem,
          profile: byUser.get(mem.user_id) ?? null,
          role: roleByUser.get(mem.user_id) ?? null,
        })),
      );
    })();
  }, [business]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    const { error } = await supabase.from("businesses").update({ name }).eq("id", business.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Workspace configuration and team.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Workspace</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Workspace name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!hasRole("admin")} />
            </div>
            <div className="text-xs text-muted-foreground">
              KYC: <Badge variant={business?.kyc_status === "approved" ? "default" : "secondary"}>{business?.kyc_status}</Badge>
              {business?.country && <> · Country: {business.country}</>}
            </div>
            {hasRole("admin") && <Button type="submit" variant="hero">Save</Button>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team members</CardTitle>
          <CardDescription>Invite teammates by sharing the signup URL — they'll be added to a separate workspace and you can transfer them as roles are added.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {members.map((m) => (
              <div key={m.user_id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{m.profile?.display_name ?? m.profile?.email ?? "Member"}</div>
                  <div className="text-xs text-muted-foreground">{m.profile?.email}</div>
                </div>
                <Badge variant="outline" className="capitalize">{m.role ?? "—"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
