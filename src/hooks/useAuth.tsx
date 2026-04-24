import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "finance" | "viewer";

export interface BusinessContext {
  id: string;
  name: string;
  kyc_status: "pending" | "in_review" | "approved" | "rejected";
  default_currency: string;
  country: string | null;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  business: BusinessContext | null;
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessContext | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContext = async (uid: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_business_id")
      .eq("user_id", uid)
      .maybeSingle();

    const businessId = profile?.current_business_id;
    if (!businessId) {
      setBusiness(null);
      setRoles([]);
      return;
    }

    const [{ data: biz }, { data: roleRows }] = await Promise.all([
      supabase
        .from("businesses")
        .select("id, name, kyc_status, default_currency, country")
        .eq("id", businessId)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("business_id", businessId),
    ]);

    setBusiness(biz as BusinessContext | null);
    setRoles((roleRows ?? []).map((r) => r.role as AppRole));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer to avoid deadlocks
        setTimeout(() => loadContext(newSession.user.id), 0);
      } else {
        setBusiness(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadContext(data.session.user.id);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    if (user) await loadContext(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthState = {
    loading,
    session,
    user,
    business,
    roles,
    hasRole: (r) => roles.includes(r),
    hasAnyRole: (rs) => rs.some((r) => roles.includes(r)),
    refresh,
    signOut,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
