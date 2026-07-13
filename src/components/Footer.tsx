import Logo from "./Logo";
import LucideIcon from "./LucideIcon";

export default function Footer() {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: "Solutions",
      links: [
        { name: "Gyms & Athletics", href: "#categories" },
        { name: "Restaurants & Cafes", href: "#categories" },
        { name: "Salons & Spas", href: "#categories" },
        { name: "Clothing & Retail", href: "#categories" },
        { name: "Local Pharmacies", href: "#categories" },
      ],
    },
    {
      title: "Platform",
      links: [
        { name: "Onboarding Engine", href: "#features" },
        { name: "Native Calendars", href: "#features" },
        { name: "Stripe Connections", href: "#features" },
        { name: "Lighthouse Scoring", href: "#features" },
        { name: "Subscription Tiers", href: "#pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#faq" },
        { name: "Developer SDKs", href: "#faq" },
        { name: "Performance Benchmarks", href: "#faq" },
        { name: "Support Desk", href: "#faq" },
        { name: "FAQ Desk", href: "#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About SiteMint", href: "#why-sitemint" },
        { name: "Brand Assets", href: "#why-sitemint" },
        { name: "Privacy Protocol", href: "#why-sitemint" },
        { name: "Contact Desk", href: "#why-sitemint" },
      ],
    },
  ];

  return (
    <footer className="bg-[#09090B] border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden" id="sitemint-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16" id="footer-main-grid">
          
          {/* Logo Column */}
          <div className="lg:col-span-2 space-y-6 text-left" id="footer-branding">
            <Logo className="h-7" variant="full" showText={false} />
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              High-performance websites with native appointment scheduling and direct payments. Built for independent service operators.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4" id="footer-social-links">
              {["Twitter", "Github", "Linkedin", "Youtube"].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-[#111111] border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-mint hover:border-zinc-700 transition-colors"
                  aria-label={`Visit SiteMint on ${social}`}
                  id={`footer-social-${social.toLowerCase()}`}
                >
                  <LucideIcon name={social === "Twitter" ? "Globe" : social} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-4 text-left" id={`footer-col-${col.title.toLowerCase()}`}>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="text-zinc-400 hover:text-white transition-colors"
                      id={`footer-link-${col.title.toLowerCase()}-${lIdx}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright section */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4" id="footer-copyright-row">
          <p className="text-xs text-zinc-500 font-mono">
            © {year} SiteMint Inc. All rights reserved. Built with pride under high-end web container guidelines.
          </p>

          <div className="flex gap-6 text-xs text-zinc-500 font-mono" id="footer-legal-links">
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">SLA Agreement</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
