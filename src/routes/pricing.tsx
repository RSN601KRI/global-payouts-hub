import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Streamline" },
      {
        name: "description",
        content: "Transparent, usage-based pricing for stablecoin payouts. No setup fees. No minimums.",
      },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "+ 0.5% per payout",
    desc: "For startups testing global payouts.",
    features: ["Up to $50k/mo volume", "Wallet & bank off-ramp", "Standard KYC/KYB", "Email support", "Sandbox + REST API"],
  },
  {
    name: "Growth",
    price: "$299",
    cadence: "+ 0.3% per payout",
    desc: "For scaling teams paying contractors weekly.",
    features: ["Unlimited volume", "Recurring payroll", "Multi-sig approvals", "Webhooks & SDKs", "Priority support", "Tax form automation"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "Volume-based pricing",
    desc: "For platforms processing millions monthly.",
    features: ["Custom FX rates", "Dedicated infrastructure", "SOC 2 + audit logs", "SLA guarantees", "White-glove onboarding", "Solutions engineering"],
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="text-sm text-primary font-medium mb-4">Pricing</div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Pay only for what you <span className="gradient-text">send.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Up to 94% cheaper than wire transfers. No hidden FX markups, no banking partners.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-8 transition-all ${
                t.featured
                  ? "glass-strong border-primary/50 shadow-[var(--shadow-glow)] scale-[1.02]"
                  : "glass hover:border-primary/30"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold gradient-primary text-primary-foreground">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">{t.desc}</p>
              <div className="mb-1">
                <span className="text-5xl font-bold">{t.price}</span>
                {t.name !== "Enterprise" && <span className="text-muted-foreground">/mo</span>}
              </div>
              <div className="text-sm text-muted-foreground mb-8">{t.cadence}</div>
              <Button variant={t.featured ? "hero" : "glass"} className="w-full mb-8">
                {t.name === "Enterprise" ? "Contact sales" : "Get started"} <ArrowRight className="size-4" />
              </Button>
              <ul className="space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-mint mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
