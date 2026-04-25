import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import logoMark from "@/assets/logo-mark.png";

export function Footer() {
  return (
    <footer className="relative border-t border-border/30 mt-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px hairline" />
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative size-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg gradient-primary blur-lg opacity-40" />
              <img
                src={logoMark}
                alt="Streamline logo"
                width={36}
                height={36}
                loading="lazy"
                className="relative size-9 object-contain"
              />
            </div>
            <span className="font-semibold text-lg tracking-tight">Streamline</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Cross-border payments powered by stablecoins on Solana. Pay anyone, anywhere, in seconds.
          </p>
          <div className="flex items-center gap-2 mt-5">
            <a href="#" className="size-8 glass rounded-lg flex items-center justify-center hover:border-primary/40 transition-colors">
              <Github className="size-3.5" />
            </a>
            <a href="#" className="size-8 glass rounded-lg flex items-center justify-center hover:border-primary/40 transition-colors">
              <Twitter className="size-3.5" />
            </a>
          </div>
        </div>

        <FooterCol title="Product" items={[
          { label: "Features", to: "/features" },
          { label: "Pricing", to: "/pricing" },
          { label: "API Docs", to: "/docs" },
          { label: "Dashboard", to: "/dashboard" },
        ]} />

        <FooterCol title="Company" items={[
          { label: "About", href: "#" },
          { label: "Compliance", href: "#" },
          { label: "Security", href: "#" },
          { label: "Contact", to: "/contact" },
        ]} />

        <FooterCol title="Resources" items={[
          { label: "Status", href: "#" },
          { label: "Changelog", href: "#" },
          { label: "Webhooks", to: "/docs" },
          { label: "Solana explorer", href: "https://solscan.io" },
        ]} />
      </div>
      <div className="border-t border-border/30 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Streamline Finance. Built on Solana. Powered by Dodo Payments.
      </div>
    </footer>
  );
}

type Item = { label: string; to?: "/features" | "/pricing" | "/docs" | "/dashboard" | "/contact"; href?: string };

function FooterCol({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <Link to={it.to} className="hover:text-foreground transition-colors">{it.label}</Link>
            ) : (
              <a href={it.href} className="hover:text-foreground transition-colors">{it.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
