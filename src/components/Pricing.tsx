import { motion } from "motion/react";
import { pricingPlans } from "../data";
import LucideIcon from "./LucideIcon";

interface PricingProps {
  onOpenCheckout: (planId?: string) => void;
}

export default function Pricing({ onOpenCheckout }: PricingProps) {
  return (
    <section className="py-24 bg-[#09090B] border-t border-zinc-900 relative overflow-hidden" id="pricing">
      {/* Background Ornaments */}
      <div className="absolute top-[30%] left-[-15%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Group */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="pricing-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            Pricing Plans
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display mb-4">
            Simple, transparent pricing.
          </h3>
          <p className="text-base text-zinc-400">
            Transparent, simple plans designed to scale with your business in India. GST invoices available.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch" id="pricing-grid">
          {pricingPlans.map((plan) => {
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative rounded-2xl p-8 flex flex-col justify-between border ${
                  plan.isPopular
                    ? "bg-[#18181B] border-mint/40 glow-mint shadow-2xl scale-[1.03]"
                    : "bg-[#111111] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#151518]"
                }`}
                id={`pricing-card-${plan.id}`}
              >
                {/* Popular Ribbon/Badge */}
                {plan.isPopular && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold font-mono uppercase tracking-wider px-3 py-1 rounded bg-mint/10 border border-mint/20 text-mint">
                    MOST POPULAR
                  </span>
                )}

                {/* Plan Content */}
                <div className="space-y-6">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xl font-bold text-white font-display">{plan.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
                      {plan.id} Tier
                    </p>
                  </div>

                  <p className="text-sm text-zinc-450 leading-relaxed min-h-[48px] text-left">
                    {plan.description}
                  </p>

                  {/* Pricing Display */}
                  <div className="flex items-baseline gap-1" id={`price-display-${plan.id}`}>
                    <span className="text-4xl font-extrabold text-white font-display">₹</span>
                    <span className="text-5xl font-black text-white font-display tracking-tight">
                      {plan.priceMonthly}
                    </span>
                    {plan.priceMonthly > 0 ? (
                      <span className="text-sm text-zinc-500 font-mono ml-1">/ month</span>
                    ) : (
                      <span className="text-sm text-mint font-mono ml-1.5 font-bold">Free Trial</span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="border-t border-zinc-900 pt-6 space-y-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono text-left">Features Included:</p>
                    <ul className="space-y-3 text-sm text-zinc-300 text-left" id={`pricing-features-list-${plan.id}`}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <LucideIcon name="Check" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Call to Action Button */}
                <button
                  onClick={() => onOpenCheckout(plan.id)}
                  className={`w-full mt-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    plan.isPopular
                      ? "bg-mint text-black hover:bg-[#00D185] shadow-[0_4px_25px_rgba(16,185,129,0.35)]"
                      : "bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-650 hover:bg-zinc-850"
                  }`}
                  id={`btn-pricing-cta-${plan.id}`}
                >
                  {plan.ctaText}
                  <LucideIcon name="ArrowRight" className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Indian Business Trust Section */}
        <div className="mt-20 p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto" id="pricing-trust-seals">
          <div className="flex items-center gap-2.5 justify-center text-xs text-zinc-300">
            <LucideIcon name="ShieldCheck" className="w-5 h-5 text-mint" />
            <span className="font-semibold">Secure payments with Razorpay</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center text-xs text-zinc-300">
            <LucideIcon name="CalendarCheck" className="w-5 h-5 text-mint" />
            <span className="font-semibold">30-Day Free Trial</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center text-xs text-zinc-300">
            <LucideIcon name="FileText" className="w-5 h-5 text-mint" />
            <span className="font-semibold">GST Invoice Available</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center text-xs text-zinc-300">
            <LucideIcon name="XCircle" className="w-5 h-5 text-mint" />
            <span className="font-semibold">Cancel Anytime</span>
          </div>
        </div>

      </div>
    </section>
  );
}
