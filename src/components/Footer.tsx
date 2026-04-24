import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="size-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg">Streamline</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Cross-border payments powered by stablecoins on Solana. Pay anyone, anywhere, in seconds.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">About</a></li>
            <li><a href="#" className="hover:text-foreground">Compliance</a></li>
            <li><a href="#" className="hover:text-foreground">Security</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Streamline Finance. Built on Solana. Powered by Dodo Payments.
      </div>
    </footer>
  );
}
