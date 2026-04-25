import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Motion";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-network.jpg";
import {
  ArrowRight, Wallet, Globe2, Shield, Zap, Repeat, LineChart,
  Users, Building2, Sparkles, CheckCircle2, CircleDollarSign,
  Code2, Copy, Check,
} from "lucide-react";
import { useState } from "react";

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
  { icon: Wallet, title: "Wallet-based payouts", desc: "Send USDC to any Solana wallet or convert instantly to local currency via Dodo Payments." },
  { icon: Repeat, title: "Automated payroll", desc: "Schedule recurring payouts for global teams. CSV upload, approvals, and one-click execution." },
  { icon: Globe2, title: "150+ countries", desc: "Off-ramp to local bank accounts, mobile money, and cards across 40+ currencies." },
  { icon: LineChart, title: "Real-time tracking", desc: "Every transaction settled on-chain. Live dashboards, webhooks, and audit trails." },
  { icon: Shield, title: "Compliance built-in", desc: "KYB, KYC, sanctions screening, and tax forms — handled by our regulated partners." },
  { icon: CircleDollarSign, title: "Stablecoin treasury", desc: "Hold USDC, USDT, or PYUSD. Earn yield on idle balances. No banking partner required." },
];

const useCases = [
  { icon: Building2, tag: "SaaS platforms", title: "Pay your global creator economy", desc: "Marketplace payouts to creators and sellers in any country, settled in seconds." },
  { icon: Sparkles, tag: "AI startups", title: "Compensate distributed contributors", desc: "Pay data labelers, prompt engineers, and remote ML talent without wire delays." },
  { icon: Users, tag: "Global teams", title: "Run cross-border payroll", desc: "Replace Wise, Deel, and PayPal with a single stablecoin-native rails layer." },
];

const codeSnippet = `await streamline.payouts.create({
  recipient_id: "rec_8f3d…",
  amount: 250,
  currency: "USDC",
  rail: "auto",
  memo: "Invoice #1042",
});`;

function Index() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-36 pb-24">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
        <div className="absolute inset-0 [background:var(--gradient-hero)] pointer-events-none" />
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] orb pointer-events-none"
        />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Reveal>
              <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11.5px] text-muted-foreground mb-7">
                <span className="size-1.5 rounded-full bg-mint animate-pulse-glow" />
                Built on Solana · Powered by Dodo Payments
                <ArrowRight className="size-3" />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]">
                Pay anyone, anywhere,<br />
                <span className="gradient-text-aurora">in seconds.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Stablecoin-native cross-border payments for SaaS platforms, AI startups, and
                global teams. Skip the wires, the fees, and the waiting.
              </p>
            </Reveal>

            <Reveal delay={0.3} className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth">
                  Start sending payouts <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/docs">
                  <Code2 className="size-4" /> Read the docs
                </Link>
              </Button>
            </Reveal>

            <Reveal delay={0.4} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-mint" /> No banking partner needed</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-mint" /> SOC 2 compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-mint" /> Settle in &lt;3 seconds</span>
            </Reveal>
          </div>

          {/* Hero visual: image + floating code panel */}
          <Reveal delay={0.5} y={40} className="relative mt-20 mx-auto max-w-5xl">
            <div className="absolute -inset-8 bg-[image:var(--gradient-aurora)] opacity-20 blur-3xl rounded-3xl" />
            <motion.div
              initial={{ rotateX: 8, opacity: 0 }}
              whileInView={{ rotateX: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 1200 }}
              className="relative glass-strong rounded-3xl p-2 shadow-[var(--shadow-elegant)]"
            >
              <img
                src={heroImg}
                alt="Global stablecoin payment network visualization"
                width={1600}
                height={1024}
                className="w-full h-auto rounded-2xl"
              />
            </motion.div>

            {/* Floating code card */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block absolute -right-4 -bottom-10 w-[400px] glass-strong rounded-2xl shadow-[var(--shadow-elegant)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/70" />
                  <span className="size-2.5 rounded-full bg-amber-500/70" />
                  <span className="size-2.5 rounded-full bg-mint/70" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">payouts.ts</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeSnippet);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="size-3 text-mint" /> : <Copy className="size-3" />}
                </button>
              </div>
              <pre className="text-[11.5px] leading-relaxed font-mono p-4 text-foreground/90">
{codeSnippet}
              </pre>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* LOGO STRIP */}
      <Reveal className="relative py-12 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center mb-6">
            Trusted by modern finance teams
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
            {["Linear", "Vercel", "Anthropic", "Replicate", "Resend", "Cursor"].map((n) => (
              <div key={n} className="text-base sm:text-lg font-semibold tracking-tight text-muted-foreground">
                {n}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* STATS */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden glass">
            {stats.map((s) => (
              <StaggerItem key={s.label} className="p-8 text-center bg-card/40">
                <div className="text-4xl sm:text-5xl font-semibold gradient-text">{s.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="max-w-2xl mb-14">
            <div className="text-sm text-primary font-medium mb-3">Platform</div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Everything you need to move money globally.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              On-chain rails for instant settlement. Off-chain rails for compliance and last-mile
              delivery. One API.
            </p>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative glass rounded-2xl p-7 h-full hover:border-primary/40 transition-colors"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  <div className="relative size-11 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-all">
                    <f.icon className="size-5 text-primary-foreground" strokeWidth={2} />
                  </div>
                  <h3 className="relative text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="relative text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-sm text-primary font-medium mb-3">How it works</div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              From dollars to wallet in three steps.
            </h2>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-3 gap-4 relative">
            {[
              { step: "01", title: "Fund in fiat", desc: "Wire USD, EUR, or 40+ currencies. Dodo Payments converts to USDC on Solana automatically." },
              { step: "02", title: "Schedule payouts", desc: "Add recipients via dashboard or API. Approve in batches with multi-sig controls." },
              { step: "03", title: "Recipients get paid", desc: "Wallet, bank, mobile money — they choose. Settled on-chain, delivered locally." },
            ].map((s, i) => (
              <StaggerItem key={s.step}>
                <div className="relative glass-strong rounded-2xl p-8 h-full">
                  <div className="text-xs font-mono text-primary mb-4">STEP {s.step}</div>
                  <h3 className="text-2xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                  {i < 2 && (
                    <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 size-5 text-primary/60" />
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* USE CASES */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="max-w-2xl mb-14">
            <div className="text-sm text-primary font-medium mb-3">Built for</div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Teams that pay across borders.
            </h2>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-3 gap-4">
            {useCases.map((u) => (
              <StaggerItem key={u.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden glass rounded-2xl p-8 h-full hover:border-mint/40 transition-colors"
                >
                  <div className="absolute -top-12 -right-12 size-32 rounded-full bg-mint/10 blur-3xl" />
                  <u.icon className="size-7 text-mint mb-5" strokeWidth={1.75} />
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{u.tag}</div>
                  <h3 className="text-xl font-semibold mb-3">{u.title}</h3>
                  <p className="text-sm text-muted-foreground">{u.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* DEVELOPER STRIP */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="text-sm text-primary font-medium mb-3">Developers</div>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                A payments API your team will actually enjoy.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Idempotent endpoints, signed webhooks, type-safe SDKs in TypeScript, Python, Go,
                and Ruby. Sandbox included.
              </p>
              <div className="mt-8 flex gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/docs">View API docs <ArrowRight className="size-4" /></Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link to="/auth">Get API key</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative">
                <div className="absolute -inset-6 bg-[image:var(--gradient-aurora)] opacity-20 blur-3xl rounded-3xl" />
                <div className="relative glass-strong rounded-2xl shadow-[var(--shadow-elegant)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-destructive/70" />
                      <span className="size-2.5 rounded-full bg-amber-500/70" />
                      <span className="size-2.5 rounded-full bg-mint/70" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">streamline.ts</span>
                    <span />
                  </div>
                  <pre className="text-[12px] leading-relaxed font-mono p-5 text-foreground/90 overflow-x-auto">
{`import { Streamline } from "@streamline/sdk";

const streamline = new Streamline({
  apiKey: process.env.STREAMLINE_KEY,
});

// Send USDC payout to a contractor
const payout = await streamline.payouts.create({
  recipient_id: "rec_8f3d…",
  amount: 1250,
  currency: "USDC",
  rail: "auto",       // solana → fallback to fiat
  memo: "March retainer",
});

console.log(payout.tx_signature);
// → 5jKxw8…d2Q (settled in 1.7s)`}
                  </pre>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="relative overflow-hidden glass-strong rounded-3xl p-12 sm:p-16 text-center">
              <div className="absolute inset-0 [background:var(--gradient-hero)] opacity-80" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px hairline" />
              <motion.div
                aria-hidden
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute -bottom-32 left-1/2 -translate-x-1/2 size-[500px] orb"
              />

              <div className="relative">
                <Zap className="size-10 text-primary mx-auto mb-6 animate-float" strokeWidth={1.5} />
                <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-2xl mx-auto">
                  Ready to ditch wire transfers?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                  Start sending stablecoin payouts in minutes. No banking partner. No 3-day waits.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/auth">
                      Get started free <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="glass" size="xl" asChild>
                    <Link to="/contact">Talk to sales</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
