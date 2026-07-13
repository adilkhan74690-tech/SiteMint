import { motion } from "motion/react";
import { features } from "../data";
import LucideIcon from "./LucideIcon";

export default function Features() {
  return (
    <section className="py-24 bg-[#09090B] border-t border-zinc-900 relative overflow-hidden" id="features">
      {/* Decorative ambient background glow */}
      <div className="absolute top-[30%] right-[-15%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title block */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="features-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            Core Features
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display mb-4">
            Engineered to perform.
          </h3>
          <p className="text-base text-zinc-400">
            SiteMint builds high-end capabilities directly into your website. Take subscriptions, coordinate schedules, and scale your business without configuring third-party services.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="features-grid">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group relative rounded-2xl bg-[#111111] border border-zinc-800/60 p-6 flex flex-col justify-between hover:border-zinc-700 hover:bg-[#151518] transition-all duration-300"
              id={`feature-card-${feat.id}`}
            >
              {/* Feature Body */}
              <div className="space-y-4">
                {/* Header: Icon & Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/80 text-mint flex items-center justify-center transition-colors group-hover:border-zinc-700">
                    <LucideIcon name={feat.iconName} className="w-5 h-5" />
                  </div>
                  {feat.badge && (
                    <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {feat.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-white font-display group-hover:text-emerald-400 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>

              {/* Decorative line on hover */}
              <div className="pt-5 mt-5 border-t border-zinc-900/60 flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                <span className="w-1 h-1 rounded-full bg-mint" />
                <span>Active Integration</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
