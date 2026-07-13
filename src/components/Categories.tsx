import { motion } from "motion/react";
import { categories } from "../data";
import LucideIcon from "./LucideIcon";

interface CategoriesProps {
  onSelectCategory?: (categoryId: string) => void;
}

export default function Categories({ onSelectCategory }: CategoriesProps) {
  // Staggered motion presets for animation entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-24 bg-[#09090B] border-t border-zinc-900 relative overflow-hidden" id="categories">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="categories-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            Supported Industries
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display mb-4">
            Tailored for your business.
          </h3>
          <p className="text-base text-zinc-400">
            Explore ready-to-use layouts engineered for your specific industry. Every framework is pre-configured, lightning-fast, and built for client conversions.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          id="categories-grid"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              onClick={() => onSelectCategory?.(category.id)}
              className="group relative rounded-2xl bg-[#111111] hover:bg-[#18181B] border border-zinc-800/60 p-6 cursor-pointer transition-all duration-300 hover:border-zinc-700 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between"
              id={`category-card-${category.id}`}
            >
              {/* Outer colored ambient glow of the card on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl -z-10"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${category.accentColor}12, transparent 50%)`,
                }}
              />

              <div className="space-y-4" id={`category-card-top-${category.id}`}>
                {/* Icon wrapper with subtle background colored shape */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${category.accentColor}10`,
                    borderColor: `${category.accentColor}30`,
                    color: category.accentColor,
                  }}
                  id={`category-icon-wrapper-${category.id}`}
                >
                  <LucideIcon name={category.iconName} className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-white font-display group-hover:text-white transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-xs font-semibold tracking-wide uppercase font-mono" style={{ color: category.accentColor }}>
                    {category.tagline}
                  </p>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Action Button inside card */}
              <div className="pt-6 border-t border-zinc-900 mt-4 flex items-center justify-between" id={`category-card-bottom-${category.id}`}>
                <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  Explore Template
                </span>
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:border-zinc-600 transition-all"
                  style={{ groupHover: { borderColor: category.accentColor } }}
                >
                  <LucideIcon name="ArrowRight" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
