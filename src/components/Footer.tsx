"use client";

import { motion } from "framer-motion";

const footerLinks = {
  Platform: [
    { label: "AI Pest Doctor", href: "#pest-doctor" },
    { label: "Market Intelligence", href: "#market-intelligence" },
    { label: "Smart Crop Shop", href: "#crop-shop" },
    { label: "Farming Robot", href: "#smart-robot" },
    { label: "Voice AI", href: "#voice-ai" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press Kit", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Community", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "Status", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-8 border-t border-green-glow/10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-glow/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card p-8 md:p-12 mb-16 text-center border-beam"
        >
          <h3
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif" }}
          >
            Ready to <span className="gradient-text">Transform</span> Your Farm?
          </h3>
          <p className="text-text-secondary max-w-xl mx-auto mb-8 text-sm md:text-base">
            Join the agricultural revolution. Get early access to AgriVerse AI and start
            optimizing your farm with cutting-edge artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-5 py-3.5 rounded-xl bg-green-glow/5 border border-green-glow/20 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-green-glow/50 focus:shadow-[0_0_15px_rgba(0,255,102,0.1)] transition-all duration-300"
              style={{ fontFamily: "var(--font-space), 'Space Grotesk', monospace" }}
            />
            <button className="btn-primary whitespace-nowrap !py-3.5 w-full sm:w-auto">
              Get Early Access
            </button>
          </div>
        </motion.div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#hero" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-glow/20 to-cyan-accent/10 border border-green-glow/30 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-glow">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span
                className="font-bold text-sm tracking-wider text-text-primary"
                style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif" }}
              >
                AGRI<span className="text-green-glow">VERSE</span>
              </span>
            </a>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              The next generation of AI-powered agriculture. Transforming farming with intelligence, precision, and sustainability.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {["X", "GH", "LI", "YT"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-green-glow/[0.06] border border-green-glow/10 flex items-center justify-center text-[10px] text-text-muted hover:bg-green-glow/15 hover:text-green-glow hover:border-green-glow/25 transition-all duration-300"
                  style={{ fontFamily: "var(--font-space), 'Space Grotesk', monospace" }}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4"
                style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif" }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-text-muted hover:text-green-glow transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="section-separator mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[11px] text-text-muted"
            style={{ fontFamily: "var(--font-space), 'Space Grotesk', monospace" }}
          >
            © 2026 AgriVerse AI. All rights reserved. Built with 🌱 for the future of farming.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
            <span
              className="text-[11px] text-green-glow"
              style={{ fontFamily: "var(--font-space), 'Space Grotesk', monospace" }}
            >
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
