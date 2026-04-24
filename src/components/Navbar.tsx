import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav className="mx-auto max-w-7xl glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-lg gradient-primary flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
            <Zap className="size-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Streamline</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          <Link
            to="/features"
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: "px-4 py-2 rounded-lg text-foreground" }}
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: "px-4 py-2 rounded-lg text-foreground" }}
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: "px-4 py-2 rounded-lg text-foreground" }}
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign in
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="sm">
              Get started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
