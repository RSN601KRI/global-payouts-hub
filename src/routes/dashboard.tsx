import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Send,
  Calendar,
  Wallet,
  KeyRound,
  Activity,
  Zap,
  LogOut,
  Settings,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/auth" });
    }
  },
  component: DashboardLayout,
});

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/recipients", label: "Recipients", icon: Users },
  { to: "/dashboard/payouts", label: "Payouts", icon: Send },
  { to: "/dashboard/schedules", label: "Schedules", icon: Calendar },
  { to: "/dashboard/wallets", label: "Wallets", icon: Wallet },
  { to: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
  { to: "/dashboard/monitoring", label: "Monitoring", icon: Activity },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function DashboardLayout() {
  const { business, user, loading, signOut, hasRole } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border/50 glass-strong p-4 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="size-8 rounded-lg gradient-primary flex items-center justify-center glow-primary">
            <Zap className="size-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Streamline</span>
        </Link>

        <div className="px-2 mb-6">
          <div className="text-xs text-muted-foreground">Workspace</div>
          <div className="text-sm font-medium truncate">{business?.name ?? "—"}</div>
          {business && (
            <Badge
              variant={business.kyc_status === "approved" ? "default" : "secondary"}
              className="mt-2 text-[10px]"
            >
              KYC: {business.kyc_status}
            </Badge>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              activeProps={{
                className:
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-primary/10 text-foreground font-medium",
              }}
            >
              <item.icon className="size-4" />
              {item.label}
              {item.to === "/dashboard/api-keys" && !hasRole("admin") && (
                <span className="ml-auto text-[9px] text-muted-foreground">admin</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border/50 pt-4 px-2">
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mt-2 text-muted-foreground"
            onClick={async () => {
              await signOut();
              router.navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
