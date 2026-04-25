import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/Motion";
import {
  Book, Code2, Webhook, KeyRound, Send, Wallet, Calendar,
  Search, ArrowRight, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — Streamline" },
      {
        name: "description",
        content:
          "Stablecoin-native payments API. REST endpoints for payouts, recipients, wallets, and webhooks. Built on Solana, integrated with Dodo Payments.",
      },
      { property: "og:title", content: "Streamline API Docs" },
      {
        property: "og:description",
        content: "Developer-first stablecoin payments API.",
      },
    ],
  }),
  component: DocsPage,
});

const sections = [
  {
    title: "Getting started",
    items: [
      { id: "intro", label: "Introduction", icon: Book },
      { id: "auth", label: "Authentication", icon: KeyRound },
      { id: "errors", label: "Errors & retries", icon: Code2 },
    ],
  },
  {
    title: "Core resources",
    items: [
      { id: "payouts", label: "Payouts", icon: Send },
      { id: "recipients", label: "Recipients", icon: Wallet },
      { id: "schedules", label: "Schedules", icon: Calendar },
    ],
  },
  {
    title: "Realtime",
    items: [
      { id: "webhooks", label: "Webhooks", icon: Webhook },
    ],
  },
];

function DocsPage() {
  const [active, setActive] = useState("intro");

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-12 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_50%_40%_at_50%_20%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[500px] orb pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[11px] text-muted-foreground mb-6">
              <Code2 className="size-3" /> v1.0 · REST API
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Build stablecoin payments<br />
              <span className="gradient-text-aurora">in minutes.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete REST API for cross-border payouts. Idempotent, signed webhooks,
              type-safe SDKs.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search the docs…"
                className="w-full glass-strong rounded-xl pl-11 pr-20 py-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] glass px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Two-pane layout */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-[220px_1fr_360px] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
            <nav className="space-y-6">
              {sections.map((s) => (
                <div key={s.title}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 px-2">
                    {s.title}
                  </div>
                  <div className="space-y-0.5">
                    {s.items.map((it) => (
                      <button
                        key={it.id}
                        onClick={() => {
                          setActive(it.id);
                          document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`w-full flex items-center gap-2 text-left text-sm rounded-md px-2 py-1.5 transition-colors ${
                          active === it.id
                            ? "bg-primary/10 text-foreground border-l-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        <it.icon className="size-3.5" />
                        {it.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 space-y-16">
            <Section id="intro" title="Introduction" eyebrow="Overview">
              <p>
                The Streamline API is organized around <strong>REST</strong>. It uses
                resource-oriented URLs, accepts JSON request bodies, returns JSON-encoded
                responses, and uses standard HTTP response codes, authentication, and verbs.
              </p>
              <Endpoint method="POST" path="/api/public/v1/payouts" desc="Create a stablecoin payout" />
              <p className="text-muted-foreground">
                All requests must be made over HTTPS. The base URL is{" "}
                <code className="font-mono text-xs glass px-1.5 py-0.5 rounded">https://api.streamline.dev</code>.
              </p>
            </Section>

            <Section id="auth" title="Authentication" eyebrow="Security">
              <p>
                Authenticate requests using API keys. Generate keys from your{" "}
                <Link to="/dashboard/api-keys" className="text-primary hover:underline">dashboard</Link>.
                Include your secret key in the <code className="font-mono text-xs glass px-1.5 py-0.5 rounded">Authorization</code> header
                with the <code className="font-mono text-xs glass px-1.5 py-0.5 rounded">Bearer</code> scheme.
              </p>
              <Callout title="Keep your keys safe">
                Never commit secret keys to source control or expose them in client-side code.
                Use environment variables and rotate compromised keys immediately.
              </Callout>
            </Section>

            <Section id="errors" title="Errors & retries" eyebrow="Reliability">
              <p>
                Streamline uses conventional HTTP response codes. Codes in the 2xx range
                indicate success, 4xx indicate a client error, 5xx indicate a server error.
              </p>
              <ErrorTable />
              <p className="text-muted-foreground">
                All POST requests support <strong>idempotency keys</strong> via the{" "}
                <code className="font-mono text-xs glass px-1.5 py-0.5 rounded">Idempotency-Key</code> header.
                Retries with the same key return the cached response.
              </p>
            </Section>

            <Section id="payouts" title="Payouts" eyebrow="Resource">
              <p>
                Send a stablecoin payout to a recipient. The rail router automatically picks
                Solana for crypto-enabled recipients, falling back to Dodo Payments fiat
                rails when needed.
              </p>
              <ParamTable
                rows={[
                  ["recipient_id", "string", "ID of the recipient to pay"],
                  ["amount", "number", "Amount in the specified currency"],
                  ["currency", "enum", "USDC, USDT, USD, EUR, …"],
                  ["rail", "enum", "auto · solana · dodo"],
                  ["memo", "string?", "Optional memo on the payout"],
                ]}
              />
            </Section>

            <Section id="recipients" title="Recipients" eyebrow="Resource">
              <p>
                Recipients are people or businesses you pay. Each recipient can hold a
                Solana wallet address, bank details, or both.
              </p>
              <Endpoint method="POST" path="/api/public/v1/recipients" desc="Create a recipient" />
              <Endpoint method="GET" path="/api/public/v1/recipients" desc="List recipients" />
            </Section>

            <Section id="schedules" title="Schedules" eyebrow="Resource">
              <p>
                Recurring payout schedules let you automate payroll, retainers, and
                subscriptions. Schedules run on cron expressions in your timezone.
              </p>
              <Endpoint method="POST" path="/api/public/v1/schedules" desc="Create a recurring schedule" />
            </Section>

            <Section id="webhooks" title="Webhooks" eyebrow="Realtime">
              <p>
                Subscribe to events to receive real-time updates when payout state changes.
                All webhooks are HMAC-SHA256 signed via the{" "}
                <code className="font-mono text-xs glass px-1.5 py-0.5 rounded">X-Streamline-Signature</code> header.
              </p>
              <ParamTable
                rows={[
                  ["payout.created", "event", "Payout was created and queued"],
                  ["payout.processing", "event", "On-chain transaction submitted"],
                  ["payout.completed", "event", "Payout settled successfully"],
                  ["payout.failed", "event", "Payout failed; no funds moved"],
                ]}
              />
            </Section>

            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold mb-2">Ready to start building?</h3>
              <p className="text-muted-foreground mb-6">
                Grab an API key and send your first payout in under 5 minutes.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="lg">
                  Get an API key <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Code panel */}
          <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto space-y-4">
            <CodeBlock
              label="Send a payout"
              lang="bash"
              code={`curl -X POST https://api.streamline.dev/api/public/v1/payouts \\
  -H "Authorization: Bearer sk_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient_id": "rec_8f3d…",
    "amount": 250,
    "currency": "USDC",
    "rail": "auto",
    "memo": "Invoice #1042"
  }'`}
            />
            <CodeBlock
              label="Response"
              lang="json"
              code={`{
  "id": "po_4f2a8c…",
  "status": "processing",
  "rail": "solana",
  "amount": 250,
  "currency": "USDC",
  "tx_signature": "5jKx…d2Q",
  "created_at": "2025-04-25T10:42:13Z"
}`}
            />
            <CodeBlock
              label="Verify webhook"
              lang="ts"
              code={`import { createHmac } from "crypto";

const sig = req.headers["x-streamline-signature"];
const expected = createHmac("sha256", SECRET)
  .update(rawBody)
  .digest("hex");

if (sig !== expected) return res.status(401);`}
            />
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-28"
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-2">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight mb-5">{title}</h2>
      <div className="prose prose-invert prose-sm max-w-none text-foreground/90 leading-relaxed space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const colors: Record<string, string> = {
    GET: "text-iris bg-iris/10",
    POST: "text-mint bg-mint/10",
    DELETE: "text-destructive bg-destructive/10",
    PUT: "text-primary bg-primary/10",
  };
  return (
    <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5 not-prose">
      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded ${colors[method]}`}>
        {method}
      </span>
      <code className="text-xs font-mono flex-1 truncate">{path}</code>
      <span className="text-xs text-muted-foreground hidden sm:inline">{desc}</span>
    </div>
  );
}

function ParamTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="not-prose glass rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_2fr] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-4 py-2 border-b border-border/50 bg-muted/30">
        <div>Parameter</div>
        <div>Type</div>
        <div>Description</div>
      </div>
      {rows.map(([n, t, d]) => (
        <div key={n} className="grid grid-cols-[1fr_100px_2fr] px-4 py-2.5 text-sm border-b border-border/30 last:border-0">
          <code className="font-mono text-xs text-primary">{n}</code>
          <code className="font-mono text-xs text-muted-foreground">{t}</code>
          <div className="text-xs text-muted-foreground">{d}</div>
        </div>
      ))}
    </div>
  );
}

function ErrorTable() {
  return (
    <div className="not-prose glass rounded-xl overflow-hidden">
      {[
        ["200", "OK — request succeeded"],
        ["400", "Bad request — validation failed"],
        ["401", "Unauthorized — invalid API key"],
        ["402", "Insufficient balance"],
        ["404", "Not found"],
        ["429", "Too many requests — back off and retry"],
        ["5xx", "Server error — retry with exponential backoff"],
      ].map(([code, desc]) => (
        <div key={code} className="grid grid-cols-[80px_1fr] px-4 py-2.5 text-sm border-b border-border/30 last:border-0">
          <code className="font-mono text-xs text-primary">{code}</code>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      ))}
    </div>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="not-prose glass rounded-xl p-4 border-l-2 border-primary">
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function CodeBlock({ label, lang, code }: { label: string; lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-muted-foreground/70">{lang}</span>
          <button
            onClick={onCopy}
            className="size-6 rounded flex items-center justify-center hover:bg-foreground/10 transition-colors"
            aria-label="Copy"
          >
            {copied ? <Check className="size-3 text-mint" /> : <Copy className="size-3 text-muted-foreground" />}
          </button>
        </div>
      </div>
      <pre className="text-[11.5px] leading-relaxed font-mono p-4 overflow-x-auto text-foreground/85">
        {code}
      </pre>
    </div>
  );
}
