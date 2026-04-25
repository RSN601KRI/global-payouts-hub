import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import logoMark from "@/assets/logo-mark.png";

const links = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 16));

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 pt-4"
    >
      <nav
        className={`mx-auto max-w-6xl rounded-2xl px-4 sm:px-5 py-2.5 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-[var(--shadow-soft)] max-w-5xl"
            : "glass border-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative size-8 flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="absolute inset-0 rounded-lg gradient-primary blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
            <img
              src={logoMark}
              alt="Streamline logo"
              width={32}
              height={32}
              className="relative size-8 object-contain"
            />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Streamline</span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 text-[13px]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
              activeProps={{ className: "px-3.5 py-1.5 rounded-lg text-foreground bg-foreground/5" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-[13px] h-8">
              Sign in
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="sm" className="text-[13px] h-8 px-4">
              Get started
            </Button>
          </Link>
          <button
            className="md:hidden ml-1 size-8 rounded-lg flex items-center justify-center hover:bg-foreground/5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-auto max-w-6xl mt-2 glass-strong rounded-2xl p-3 flex flex-col gap-1"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            >
              {l.label}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
