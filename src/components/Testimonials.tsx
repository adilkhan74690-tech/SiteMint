import { motion } from "motion/react";
import LucideIcon from "./LucideIcon";

const indianReviews = [
  { id: "rev-1", name: "Amit Kumar", initials: "AK", business: "Kalyan Fitness", text: "Website was live in under 15 minutes." },
  { id: "rev-2", name: "Rohini Patel", initials: "RP", business: "Spice Garden", text: "Managing bookings is much easier now." },
  { id: "rev-3", name: "Ananya Sharma", initials: "AS", business: "Lotus Salon & Spa", text: "My customers love the new website." },
  { id: "rev-4", name: "Naman Gupta", initials: "NG", business: "Gupta Associates", text: "The dashboard is simple and clean." },
  { id: "rev-5", name: "Siddharth Khurana", initials: "SK", business: "Apex Gym", text: "We replaced WhatsApp bookings completely." },
  { id: "rev-6", name: "Pooja Joshi", initials: "PJ", business: "Nirvana Yoga", text: "Client scheduling feels incredibly robust and fast." },
  { id: "rev-7", name: "Vikram Mehta", initials: "VM", business: "Mehta Pharmacy", text: "The setup process was straightforward and fast." },
  { id: "rev-8", name: "Divya Nair", initials: "DN", business: "Clay Boutique", text: "Stripe connection worked flawlessly on the first try." },
  { id: "rev-9", name: "Rahul Roy", initials: "RR", business: "Roy Patisserie", text: "No-code setup that actually looks professional." },
  { id: "rev-10", name: "Sneha Iyer", initials: "SI", business: "Iyer Academy", text: "The mobile booking interface is extremely responsive." }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#09090B] border-t border-zinc-900/60 relative overflow-hidden" id="testimonials">
      {/* Scope-isolated Marquee Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Group */}
        <div className="text-center max-w-2xl mx-auto mb-16" id="testimonials-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            Client Reviews
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mb-4">
            Trusted by independent operators.
          </h3>
          <p className="text-sm text-zinc-400">
            Real feedback from local business owners who moved their booking systems, checkouts, and client intake online with SiteMint.
          </p>
        </div>

        {/* Desktop View: Infinite Marquee */}
        <div className="hidden md:block relative w-full overflow-hidden" id="desktop-marquee-container">
          {/* Gradient fade masks for a polished edge transition */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#09090B] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#09090B] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="flex gap-6 w-max animate-marquee-track py-2">
            {/* First Set of Cards */}
            {indianReviews.map((rev) => (
              <div
                key={`${rev.id}-first`}
                className="w-[310px] shrink-0 p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300"
                id={`marquee-card-${rev.id}-1`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-emerald-500/90" id={`stars-1-${rev.id}`}>
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed font-normal">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-900/80 mt-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                    {rev.initials}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-white font-display">{rev.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">{rev.business}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Duplicated Set of Cards for Seamless Loop */}
            {indianReviews.map((rev) => (
              <div
                key={`${rev.id}-second`}
                className="w-[310px] shrink-0 p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300"
                id={`marquee-card-${rev.id}-2`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-emerald-500/90" id={`stars-2-${rev.id}`}>
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                    <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed font-normal">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-900/80 mt-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                    {rev.initials}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-semibold text-white font-display">{rev.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">{rev.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View: Horizontal Swipe Cards */}
        <div 
          className="md:hidden flex overflow-x-auto gap-4 px-2 pb-6 snap-x snap-mandatory scrollbar-none scroll-smooth touch-pan-x" 
          id="mobile-swipe-container"
        >
          {indianReviews.map((rev) => (
            <div
              key={`${rev.id}-mobile`}
              className="w-[280px] shrink-0 p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm flex flex-col justify-between snap-center"
              id={`mobile-card-${rev.id}`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-emerald-500/90" id={`mobile-stars-${rev.id}`}>
                  <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                  <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                  <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                  <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                  <LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" />
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-900/80 mt-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                  {rev.initials}
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-white font-display">{rev.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">{rev.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
