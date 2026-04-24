import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, AlertCircle, Info } from "lucide-react";

export const Route = createFileRoute("/dashboard/monitoring")({
  component: Monitoring,
});

interface Event {
  id: string;
  severity: "info" | "warn" | "error";
  category: string;
  message: string;
  payout_id: string | null;
  created_at: string;
}

function Monitoring() {
  const { business } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!business) return;
    const load = async () => {
      const { data } = await supabase
        .from("monitoring_events")
        .select("id, severity, category, message, payout_id, created_at")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(100);
      setEvents((data ?? []) as Event[]);
    };
    load();

    const channel = supabase
      .channel("monitoring-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "monitoring_events", filter: `business_id=eq.${business.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [business]);

  const Icon = (sev: Event["severity"]) => (sev === "error" ? AlertCircle : sev === "warn" ? AlertTriangle : Info);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
        <p className="text-muted-foreground text-sm">Anomalies, rail failures, and fallback events.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">
              <Activity className="size-6 mx-auto mb-2 text-muted-foreground" />
              All clear — no events recorded.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {events.map((e) => {
                const I = Icon(e.severity);
                return (
                  <div key={e.id} className="p-4 flex items-start gap-3">
                    <I
                      className={`size-4 mt-0.5 ${
                        e.severity === "error"
                          ? "text-destructive"
                          : e.severity === "warn"
                            ? "text-amber-500"
                            : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{e.message}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(e.created_at).toLocaleString()} · {e.category}
                        {e.payout_id && ` · payout ${e.payout_id.slice(0, 8)}`}
                      </div>
                    </div>
                    <Badge
                      variant={e.severity === "error" ? "destructive" : e.severity === "warn" ? "secondary" : "outline"}
                    >
                      {e.severity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
