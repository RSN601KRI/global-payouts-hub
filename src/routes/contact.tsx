import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Streamline" },
      { name: "description", content: "Talk to our team about global stablecoin payouts." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent. We'll be in touch within 24 hours.");
    }, 800);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Toaster />

      <section className="pt-36 pb-20">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="text-sm text-primary font-medium mb-4">Contact</div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Let's <span className="gradient-text">talk.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Whether you're paying 10 contractors or 10,000, we'll help you find the right setup.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Mail, title: "Email", value: "hello@streamline.fi" },
                { icon: MessageCircle, title: "Live chat", value: "Available 24/7 in-app" },
                { icon: Calendar, title: "Book a demo", value: "30-minute walkthrough" },
              ].map((c) => (
                <div key={c.title} className="glass rounded-xl p-5 flex items-center gap-4">
                  <div className="size-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <c.icon className="size-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="text-sm text-muted-foreground">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" name="firstName" required />
              <Field label="Last name" name="lastName" required />
            </div>
            <Field label="Work email" name="email" type="email" required />
            <Field label="Company" name="company" required />
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Monthly payout volume</label>
              <select
                name="volume"
                required
                className="w-full h-11 rounded-lg bg-background/50 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select range</option>
                <option>Under $50k</option>
                <option>$50k – $500k</option>
                <option>$500k – $5M</option>
                <option>$5M+</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">How can we help?</label>
              <textarea
                name="message"
                rows={4}
                required
                className="w-full rounded-lg bg-background/50 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : <>Send message <ArrowRight className="size-4" /></>}
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({
  label, name, type = "text", required,
}: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full h-11 rounded-lg bg-background/50 border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
