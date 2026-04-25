import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Motion";
import { motion } from "framer-motion";
import {
  Wallet, Globe2, Shield, Repeat, LineChart, CircleDollarSign,
  Code2, Webhook, Lock, FileCheck, Network, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Streamline stablecoin payments" },
      {
        name: "description",
        content:
          "Wallet payouts, automated payroll, real-time tracking, compliance, and a developer-first API for global stablecoin payments.",
      },
      { property: "og:title", content: "Features — Streamline" },
      { property: "og:description", content: "A complete stablecoin payments stack." },
    ],
  }),
  component: FeaturesPage,
});

const groups = [
  {
    title: "Payments",
    eyebrow: "Send money",
    items: [
      { icon: Wallet, title: "Wallet & bank payouts", desc: "Send USDC to any Solana address or off-ramp to local bank accounts in 150+ countries." },
      { icon: Repeat, title: "Recurring & batch", desc: "Schedule weekly payroll, monthly retainers, or one-off batches via CSV or API." },
      { icon: Globe2, title: "40+ currencies", desc: "USD, EUR, GBP, INR, BRL, NGN, PHP, IDR, and more — auto-converted at mid-market." },
      { icon: CircleDollarSign, title: "Multi-stablecoin", desc: "USDC, USDT, PYUSD. Treasury management with optional yield on idle balances." },
    ],
  },
  {
    title: "Compliance & security",
    eyebrow: "Stay safe",
    items: [
      { icon: Shield, title: "KYB & KYC", desc: "Onboarding, sanctions screening, and ongoing monitoring handled automatically." },
      { icon: FileCheck, title: "Tax forms", desc: "1099, W-8BEN, and country-specific reporting generated and filed for you." },
      { icon: Lock, title: "Multi-sig controls", desc: "Approval workflows, spending limits, and role-based access for your finance team." },
    ],
  },
  {
    title: "Developer platform",
    eyebrow: "Build fast",
    items: [
      { icon: Code2, title: "REST + SDKs", desc: "TypeScript, Python, Go, and Ruby. Idempotent endpoints. Sandbox included." },
      { icon: Webhook, title: "Webhooks", desc: "Real-time notifications for every payout state change. Retries with exponential backoff." },
      { icon: LineChart, title: "Analytics API", desc: "Pull settlement data, fees, FX rates into your own dashboards and BI tools." },
      { icon: Network, title: "On-chain proof", desc: "Every transaction has a verifiable Solana signature. Immutable audit trail." },
    ],
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      <section className="relative pt-36 pb-16">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_50%_40%_at_50%_20%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] orb pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="text-sm text-primary font-medium mb-4">Features</div>
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
              A complete <span className="gradient-text-aurora">payments stack.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Everything from initial fiat funding to last-mile delivery — built on Solana,
              integrated with Dodo Payments, ready for production.
            </p>
          </Reveal>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.title} className="py-16">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal className="mb-10">
              <div className="text-xs uppercase tracking-wider text-primary mb-2">{g.eyebrow}</div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">{g.title}</h2>
            </Reveal>
            <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.items.map((f) => (
                <StaggerItem key={f.title}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="glass rounded-2xl p-7 h-full hover:border-primary/40 transition-colors group"
                  >
                    <div className="size-11 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-all">
                      <f.icon className="size-5 text-primary-foreground" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ))}

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 tracking-tight">See it in action</h2>
            <p className="text-muted-foreground mb-8">Get hands-on with our sandbox in under 5 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth">Start building <ArrowRight className="size-4" /></Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/docs">Read the docs</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
