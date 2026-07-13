import { motion } from "motion/react";
import LucideIcon from "./LucideIcon";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Choose Your Industry",
      desc: "Select Gym, Restaurant, or Salon. Enter your operating details and business name to begin.",
      icon: "SlidersHorizontal",
      accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      num: "02",
      title: "Configure Services",
      desc: "Add your custom schedules, appointments, menu items, or pricing plans with simple toggles.",
      icon: "CalendarRange",
      accent: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    },
    {
      num: "03",
      title: "Launch Website",
      desc: "Publish your live site. We automatically handle hosting, SSL setup, and connect your Stripe account.",
      icon: "Zap",
      accent: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    },
  ];

  return (
    <section className="py-24 bg-[#111111] border-t border-zinc-900 relative overflow-hidden" id="how-it-works">
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Group */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="how-it-works-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            How it works
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display mb-4">
            Simple 3-step setup.
          </h3>
          <p className="text-base text-zinc-400">
            No complex web builders, servers, or clunky plugins. SiteMint configures everything under your own domain name.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative" id="how-it-works-steps">
          
          {/* Connecting line for desktop screens */}
          <div className="hidden lg:block absolute top-[45px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-rose-500/20 z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative rounded-2xl bg-[#18181B] border border-zinc-800/80 p-8 flex flex-col justify-between hover:border-zinc-700 transition-all z-10"
              id={`how-it-works-card-${idx}`}
            >
              <div className="space-y-6">
                {/* Step Icon and Number */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.accent}`} id={`step-icon-wrapper-${idx}`}>
                    <LucideIcon name={step.icon} className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-black font-display text-zinc-800 tracking-tight select-none">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white font-display">{step.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              {/* Progress tag */}
              <div className="pt-6 border-t border-zinc-900 mt-6 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                <LucideIcon name="Check" className="w-3.5 h-3.5 text-zinc-700" />
                <span>Ready to publish</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
