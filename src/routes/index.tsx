import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-network.jpg";
import {
  ArrowRight,
  Wallet,
  Globe2,
  Shield,
  Zap,
  Repeat,
  LineChart,
  Users,
  Building2,
  Sparkles,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Streamline — Stablecoin payments for global teams" },
      {
        name: "description",
        content:
          "Pay contractors, freelancers, and vendors in 150+ countries with USDC on Solana. Powered by Dodo Payments for fiat on/off-ramp, compliance, and global payouts.",
      },
      { property: "og:title", content: "Streamline — Stablecoin payments for global teams" },
      {
        property: "og:description",
        content: "Cross-border payments powered by stablecoins on Solana.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Countries supported", value: "150+" },
  { label: "Settlement time", value: "<3s" },
  { label: "Avg. fee saved", value: "94%" },
  { label: "Uptime SLA", value: "99.99%" },
];

const features = [
  {
    icon: Wallet,
    title: "Wallet-based payouts",
    desc: "Send USDC to any Solana wallet or convert instantly to local currency via Dodo Payments.",
  },
  {
    icon: Repeat,
    title: "Automated payroll",
    desc: "Schedule recurring payouts for global teams. CSV upload, approvals, and one-click execution.",
  },
  {
    icon: Globe2,
    title: "150+ countries",
    desc: "Off-ramp to local bank accounts, mobile money, and cards across 40+ currencies.",
  },
  {
    icon: LineChart,
    title: "Real-time tracking",
    desc: "Every transaction settled on-chain. Live dashboards, webhooks, and audit trails.",
  },
  {
    icon: Shield,
    title: "Compliance built-in",
    desc: "KYB, KYC, sanctions screening, and tax forms — handled by our regulated partners.",
  },
  {
    icon: CircleDollarSign,
    title: "Stablecoin treasury",
    desc: "Hold USDC, USDT, or PYUSD. Earn yield on idle balances. No banking partner required.",
  },
];

const useCases = [
  {
    icon: Building2,
    tag: "SaaS platforms",
    title: "Pay your global creator economy",
    desc: "Marketplace payouts to creators and sellers in any country, settled in seconds.",
  },
  {
    icon: Sparkles,
    tag: "AI startups",
    title: "Compensate distributed contributors",
    desc: "Pay data labelers, prompt engineers, and remote ML talent without wire delays.",
  },
  {
    icon: Users,
    tag: "Global teams",
    title: "Run cross-border payroll",
    desc: "Replace Wise, Deel, and PayPal with a single stablecoin-native rails layer.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
        <div className="absolute inset-0 [background:var(--gradient-hero)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8">
              <span className="size-1.5 rounded-full bg-mint animate-pulse-glow" />
              Built on Solana · Powered by Dodo Payments
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Pay anyone, anywhere,<br />
              <span className="gradient-text">in seconds.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Stablecoin-native cross-border payments for SaaS platforms, AI startups, and global
              teams. Skip the wires, the fees, and the waiting.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="xl" asChild>
                <a href="#">
                  Start sending payouts <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/features">See how it works</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-mint" /> No banking partner needed</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-mint" /> SOC 2 compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-mint" /> Settle in &lt;3 seconds</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mt-20 mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-[image:var(--gradient-primary)] opacity-20 blur-3xl rounded-3xl" />
            <div className="relative glass-strong rounded-3xl p-2 shadow-[var(--shadow-elegant)]">
              <img
                src={heroImg}
                alt="Global stablecoin payment network visualization"
                width={1600}
                height={1024}
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden glass">
            {stats.map((s) => (
              <div key={s.label} className="p-8 text-center bg-card/30">
                <div className="text-4xl sm:text-5xl font-bold gradient-text">{s.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-16">
            <div className="text-sm text-primary font-medium mb-3">Platform</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Everything you need to move money globally.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              On-chain rails for instant settlement. Off-chain rails for compliance and last-mile
              delivery. One API.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group glass rounded-2xl p-7 hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="size-11 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-all">
                  <f.icon className="size-5 text-primary-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-sm text-primary font-medium mb-3">How it works</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              From dollars to wallet in three steps.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 relative">
            {[
              {
                step: "01",
                title: "Fund in fiat",
                desc: "Wire USD, EUR, or 40+ currencies. Dodo Payments converts to USDC on Solana automatically.",
              },
              {
                step: "02",
                title: "Schedule payouts",
                desc: "Add recipients via dashboard or API. Approve in batches with multi-sig controls.",
              },
              {
                step: "03",
                title: "Recipients get paid",
                desc: "Wallet, bank, mobile money — they choose. Settled on-chain, delivered locally.",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative glass-strong rounded-2xl p-8">
                <div className="text-xs font-mono text-primary mb-4">STEP {s.step}</div>
                <h3 className="text-2xl font-semibold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 size-5 text-primary/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-16">
            <div className="text-sm text-primary font-medium mb-3">Built for</div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Teams that pay across borders.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {useCases.map((u) => (
              <div
                key={u.title}
                className="relative overflow-hidden glass rounded-2xl p-8 hover:border-mint/40 transition-all"
              >
                <div className="absolute -top-12 -right-12 size-32 rounded-full bg-mint/10 blur-3xl" />
                <u.icon className="size-7 text-mint mb-5" strokeWidth={1.75} />
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {u.tag}
                </div>
                <h3 className="text-xl font-semibold mb-3">{u.title}</h3>
                <p className="text-sm text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden glass-strong rounded-3xl p-12 sm:p-16 text-center">
            <div className="absolute inset-0 [background:var(--gradient-hero)] opacity-80" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="relative">
              <Zap className="size-10 text-primary mx-auto mb-6 animate-float" strokeWidth={1.5} />
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
                Ready to ditch wire transfers?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Start sending stablecoin payouts in minutes. No banking partner. No 3-day waits.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" size="xl">
                  Get started free <ArrowRight className="size-4" />
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <Link to="/contact">Talk to sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
