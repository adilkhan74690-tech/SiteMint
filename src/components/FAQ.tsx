import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { faqs } from "../data";
import LucideIcon from "./LucideIcon";

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <section className="py-24 bg-[#111111] border-t border-zinc-900 relative overflow-hidden" id="faq">
      {/* Decorative background visual lights */}
      <div className="absolute top-[40%] right-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center mb-16" id="faq-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            Common Questions
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mb-4">
            Frequently Asked.
          </h3>
          <p className="text-base text-zinc-400">
            Learn more about SiteMint's setup process, Stripe checkout connections, and custom code export parameters.
          </p>
        </div>

        {/* FAQs Accordion Container */}
        <div className="space-y-4" id="faq-accordions-wrapper">
          {faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-zinc-800 bg-[#18181B] overflow-hidden transition-all duration-300 hover:border-zinc-700"
                id={`faq-accordion-item-${faq.id}`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4 font-semibold text-white focus:outline-none"
                  aria-expanded={isExpanded}
                  id={`btn-toggle-faq-${faq.id}`}
                >
                  <span className="text-base font-bold font-display text-zinc-100 pr-4">
                    {faq.question}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-mint border-mint/20" : ""
                    }`}
                    id={`faq-chevron-wrapper-${faq.id}`}
                  >
                    <LucideIcon name="ChevronDown" className="w-4 h-4" />
                  </span>
                </button>

                {/* Accordion Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      id={`faq-accordion-content-${faq.id}`}
                    >
                      <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0 border-t border-zinc-900 text-sm text-zinc-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
