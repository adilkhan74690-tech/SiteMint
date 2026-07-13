import { motion } from "motion/react";
import LucideIcon from "./LucideIcon";

export default function WhySiteMint() {
  const points = [
    {
      title: "Tailored Layouts",
      desc: "Get clean, responsive layouts designed specifically for local service businesses like gyms, salons, and restaurants.",
      icon: "Cpu",
    },
    {
      title: "Integrated Scheduling",
      desc: "No separate plugins required. Embed calendars, appointment blocks, and staff availability directly into your site.",
      icon: "CalendarRange",
    },
    {
      title: "Direct Payments",
      desc: "Connect your Stripe account to accept deposits, subscriptions, and card payments directly with no extra commissions.",
      icon: "CreditCard",
    },
    {
      title: "Fast Page Speeds",
      desc: "Optimized, lightweight pages load instantly on mobile, helping you rank better in local search results.",
      icon: "Zap",
    },
  ];

  const comparisonRows = [
    { Feature: "Setup duration", Legacy: "2 to 4 weeks development", SiteMint: "Less than 5 minutes" },
    { Feature: "Lighthouse mobile score", Legacy: "60 - 80 (Average performance)", SiteMint: "99 (Fully optimized)" },
    { Feature: "Scheduling framework", Legacy: "Requires third-party monthly add-ons", SiteMint: "Natively integrated" },
    { Feature: "Platform transaction fees", Legacy: "1% to 3% platform commission", SiteMint: "0% (Stripe direct connection)" },
    { Feature: "Infrastructure & SSL", Legacy: "Manual renewal & server configuration", SiteMint: "Automated Let's Encrypt certificates" },
  ];

  return (
    <section className="py-24 bg-[#111111] border-t border-zinc-900 relative overflow-hidden" id="why-sitemint">
      {/* Background Lights */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-center">
          <div className="lg:col-span-6" id="why-header-left">
            <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
              The SiteMint Standard
            </h2>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display mb-4">
              Designed for speed. <br />Built for conversion.
            </h3>
          </div>
          <div className="lg:col-span-6" id="why-header-right">
            <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
              Traditional website builders often produce bloated templates that are slow to load and difficult to customize. SiteMint takes a direct, lightweight approach to generate clean layouts tailored specifically for service-based businesses.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20" id="why-points-grid">
          {points.map((pt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-[#18181B] border border-zinc-800/50 hover:border-zinc-700 transition-all"
              id={`why-point-card-${idx}`}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-mint flex items-center justify-center mb-5 shadow-inner">
                <LucideIcon name={pt.icon} className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white font-display mb-2">{pt.title}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{pt.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison Matrix Table */}
        <div className="rounded-2xl border border-zinc-800 bg-[#18181B] overflow-hidden shadow-2xl" id="comparison-box">
          <div className="p-6 md:p-8 border-b border-zinc-800 bg-zinc-900/40">
            <h4 className="text-xl font-bold text-white font-display mb-1">Traditional Builders vs. SiteMint</h4>
            <p className="text-sm text-zinc-400">A side-by-side comparison of features and performance.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="comparison-table">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold tracking-wider text-zinc-500 uppercase bg-zinc-950/40">
                  <th className="p-4 md:p-5">Feature</th>
                  <th className="p-4 md:p-5">Traditional Builders</th>
                  <th className="p-4 md:p-5 text-mint">SiteMint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 md:p-5 font-medium text-zinc-300">{row.Feature}</td>
                    <td className="p-4 md:p-5 text-zinc-500 flex items-center gap-2">
                      <LucideIcon name="X" className="w-4 h-4 text-red-500 shrink-0" />
                      {row.Legacy}
                    </td>
                    <td className="p-4 md:p-5 text-emerald-400 font-semibold" id={`comparison-sitemint-col-${idx}`}>
                      <div className="flex items-center gap-2">
                        <LucideIcon name="Check" className="w-4 h-4 text-emerald-400 shrink-0" />
                        {row.SiteMint}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
