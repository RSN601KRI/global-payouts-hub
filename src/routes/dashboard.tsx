import { createFileRoute, Outlet, redirect, Link, useRouter, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
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
  Code2,
  Search,
  ChevronDown,
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

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }>;
}> = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
      { to: "/dashboard/monitoring", label: "Analytics", icon: Activity },
    ],
  },
  {
    label: "Payments",
    items: [
      { to: "/dashboard/payouts", label: "Payouts", icon: Send },
      { to: "/dashboard/recipients", label: "Recipients", icon: Users },
      { to: "/dashboard/schedules", label: "Schedules", icon: Calendar },
      { to: "/dashboard/wallets", label: "Wallets", icon: Wallet },
    ],
  },
  {
    label: "Developers",
    items: [
      { to: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
      { to: "/docs", label: "Documentation", icon: Code2 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

function DashboardLayout() {
  const { business, user, loading, signOut, hasRole } = useAuth();
  const router = useRouter();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-muted-foreground text-sm"
        >
          Loading…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border/40 glass-strong p-4 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-7 px-2 group">
          <div className="relative size-8 rounded-lg gradient-primary flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg gradient-primary blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
            <Zap className="relative size-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Streamline</span>
        </Link>

        {/* Workspace switcher */}
        <button className="w-full glass rounded-lg px-3 py-2.5 mb-5 flex items-center gap-3 hover:border-primary/30 transition-colors text-left group">
          <div className="size-8 rounded-md gradient-aurora flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
            {business?.name?.charAt(0).toUpperCase() ?? "W"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Workspace</div>
            <div className="text-sm font-medium truncate">{business?.name ?? "—"}</div>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="w-full bg-muted/30 border border-border/40 rounded-lg pl-8 pr-12 py-1.5 text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/40"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground glass px-1 py-0.5 rounded font-mono">⌘K</kbd>
        </div>

        {business && business.kyc_status !== "approved" && (
          <Badge variant="secondary" className="mb-3 text-[10px] w-fit">
            <span className="size-1.5 rounded-full bg-amber-500 mr-1.5" />
            KYC: {business.kyc_status}
          </Badge>
        )}

        <nav className="flex-1 overflow-y-auto space-y-5 -mx-1 px-1">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 mb-1.5">
                {g.label}
              </div>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to as "/dashboard"}
                      activeOptions={{ exact: item.exact }}
                      className="relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
                      activeProps={{
                        className:
                          "relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-foreground font-medium bg-primary/8",
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="dash-nav-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <item.icon className="size-3.5" />
                      {item.label}
                      {item.to === "/dashboard/api-keys" && !hasRole("admin") && (
                        <span className="ml-auto text-[9px] text-muted-foreground">admin</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border/40 pt-3 px-1 mt-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="size-7 rounded-full gradient-aurora flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{user?.email?.split("@")[0]}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mt-1 text-muted-foreground text-xs h-8"
            onClick={async () => {
              await signOut();
              router.navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-3.5 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="ml-64">
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
