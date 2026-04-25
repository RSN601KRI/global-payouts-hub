import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Motion";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Streamline" },
      {
        name: "description",
        content: "Transparent, usage-based pricing for stablecoin payouts. No setup fees. No minimums.",
      },
      { property: "og:title", content: "Pricing — Streamline" },
      { property: "og:description", content: "Transparent stablecoin payout pricing." },
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

const faqs = [
  { q: "How are fees calculated?", a: "Flat percentage on each payout. No FX markup, no hidden spreads — we pass through Solana network fees at cost (~$0.00025)." },
  { q: "Do I need a banking partner?", a: "No. Streamline operates on stablecoin rails. Dodo Payments handles fiat conversion in 150+ countries on your behalf." },
  { q: "Which stablecoins are supported?", a: "USDC and USDT on Solana mainnet. PYUSD support is in private beta." },
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade whenever — billing is prorated to the second." },
];

function PricingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      <section className="relative pt-36 pb-12">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_50%_40%_at_50%_20%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] orb pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <div className="text-sm text-primary font-medium mb-4">Pricing</div>
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
              Pay only for what you <span className="gradient-text-aurora">send.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Up to 94% cheaper than wire transfers. No hidden FX markups, no banking partners.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <StaggerGroup className="grid md:grid-cols-3 gap-4">
            {tiers.map((t) => (
              <StaggerItem key={t.name}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative rounded-2xl p-8 h-full transition-all ${
                    t.featured
                      ? "glass-strong border-primary/40 shadow-[var(--shadow-glow)]"
                      : "glass hover:border-primary/30"
                  }`}
                >
                  {t.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold gradient-aurora text-primary-foreground">
                      <Sparkles className="size-3" /> Most popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">{t.desc}</p>
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-5xl font-semibold tracking-tight">{t.price}</span>
                    {t.name !== "Enterprise" && <span className="text-muted-foreground text-sm">/mo</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mb-8">{t.cadence}</div>
                  <Button variant={t.featured ? "hero" : "glass"} className="w-full mb-8" asChild>
                    <Link to="/auth">
                      {t.name === "Enterprise" ? "Contact sales" : "Get started"} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <ul className="space-y-3">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="size-4 rounded-full gradient-primary flex items-center justify-center mt-0.5 shrink-0">
                          <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
                        </div>
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Comparison strip */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="glass rounded-2xl p-8 grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Wire transfer", value: "$45 + 3% FX", color: "text-muted-foreground" },
              { label: "PayPal / Wise", value: "$8 + 2% FX", color: "text-muted-foreground" },
              { label: "Streamline", value: "$0.0003 + 0.3%", color: "gradient-text-aurora" },
            ].map((c) => (
              <div key={c.label}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">{c.label}</div>
                <div className={`text-2xl font-semibold ${c.color}`}>{c.value}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
          </Reveal>
          <StaggerGroup className="space-y-3">
            {faqs.map((f) => (
              <StaggerItem key={f.q}>
                <div className="glass rounded-xl p-5">
                  <div className="font-medium mb-1.5">{f.q}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <Footer />
    </div>
  );
}
