import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "./LucideIcon";

// Define preset sectors for the quick interactive previewer inside the hero
const PRESET_SECTORS = [
  {
    id: "gym",
    label: "Athletics & Gym",
    name: "Apex Gym & Fitness",
    tagline: "Forge your strength. Define your future.",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    accentHex: "#00F5A0",
    buttonClass: "bg-emerald-400 text-black hover:bg-emerald-300",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    features: ["⚡ Instant Scheduling", "🏋️ Certified Trainers", "🏆 High-End Facility"],
    items: ["1-Month Gold Membership", "Personal Trainer Hour", "Elite Nutrition Audit"]
  },
  {
    id: "restaurant",
    label: "Fine Dining",
    name: "Saffron & Vine",
    tagline: "Artisan plates, local grapes, timeless taste.",
    accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    accentHex: "#EC4899",
    buttonClass: "bg-rose-500 text-white hover:bg-rose-400",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    features: ["🍷 Curated Wine Pairings", "🔥 Wood-fired Cuisine", "⭐ Michelin-inspired"],
    items: ["Chef's 5-Course Tasting", "Roasted Wagyu Ribeye", "Artisanal Soufflé Duo"]
  },
  {
    id: "salon",
    label: "Salon & Spa",
    name: "Luxe Cut & Color",
    tagline: "Premium aesthetics tailored for your confidence.",
    accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    accentHex: "#06B6D4",
    buttonClass: "bg-cyan-500 text-black hover:bg-cyan-400",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    features: ["💇 Custom Color Specialists", "🧴 Vegan Premium Care", "📅 Online Bookings"],
    items: ["Balayage & Couture Cut", "Hydrating Keratin Glaze", "Restorative Scalp Ritual"]
  },
  {
    id: "cafe",
    label: "Cafe & Coffee",
    name: "Roast & Rumble",
    tagline: "Small-batch coffee brewed with absolute precision.",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accentHex: "#F59E0B",
    buttonClass: "bg-amber-500 text-black hover:bg-amber-400",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    features: ["☕ Organic Single Origin", "🥐 Fresh Daily Bakeries", "🚀 3-Minute Pickup"],
    items: ["Cold Brew Nitro Growler", "Pistachio Almond Croissant", "V60 Ethiopian Pour-over"]
  }
];

interface HeroProps {
  onOpenCheckout: (planId?: string) => void;
}

export default function Hero({ onOpenCheckout }: HeroProps) {
  const [businessName, setBusinessName] = useState("Vanguard Wellness");
  const [selectedSector, setSelectedSector] = useState(PRESET_SECTORS[0]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isMinting, setIsMinting] = useState(false);
  const [mintedSuccess, setMintedSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [compileStep, setCompileStep] = useState(1);

  const handleSectorSelect = (sector: typeof PRESET_SECTORS[0]) => {
    if (isMinting) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedSector(sector);
      setBusinessName(sector.name);
      setIsTransitioning(false);
    }, 350);
  };

  const triggerMint = () => {
    if (isMinting) return;
    setIsMinting(true);
    setCompileStep(1);
    
    const t1 = setTimeout(() => setCompileStep(2), 600);
    const t2 = setTimeout(() => setCompileStep(3), 1300);
    const t3 = setTimeout(() => {
      setIsMinting(false);
      setMintedSuccess(true);
      setTimeout(() => {
        setMintedSuccess(false);
      }, 4000);
    }, 2000);
  };

  return (
    <section className="relative min-h-screen pt-32 pb-24 flex items-center bg-[#09090B] bg-dot-grid overflow-hidden" id="hero">
      {/* Absolute Radial Mesh Gradient and Animated Morphing Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Mesh Orb 1 */}
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -70, 50, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[130px] opacity-[0.06]"
          style={{ backgroundColor: "#10b981" }}
        />

        {/* Animated Mesh Orb 2 */}
        <motion.div
          animate={{
            x: [0, -50, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[10%] right-[-10%] w-[650px] h-[650px] rounded-full blur-[150px] opacity-[0.05]"
          style={{ backgroundColor: "#0284c7" }}
        />

        {/* Animated Mesh Orb 3 (Secondary glow) */}
        <motion.div
          animate={{
            x: [-30, 30, -30],
            y: [40, -40, 40],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[40%] left-[40%] w-[350px] h-[350px] rounded-full blur-[140px] opacity-[0.03]"
          style={{ backgroundColor: "#7c3aed" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center" id="hero-grid">
          
          {/* Left Column - Core Copy */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left" id="hero-copy-column">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs font-medium text-zinc-400 w-fit mb-6 font-mono"
              id="hero-badge"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Built for Independent Operators</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display leading-[1.08] mb-6"
              id="hero-headline"
            >
              The web engine <br />
              for <span className="text-gradient-mint font-semibold">local business.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base text-zinc-400 leading-relaxed mb-8 max-w-xl"
              id="hero-subheadline"
            >
              Launch modular, ultra-fast websites with native calendar scheduling, custom client intake, and direct Stripe checkout. Zero commissions or complex plug-in configurations.
            </motion.p>

            {/* Quick Input Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch gap-3 mb-8 w-full max-w-lg"
              id="hero-input-form"
            >
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name..."
                  className="w-full bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/80 text-white placeholder-zinc-500 rounded-xl px-4 py-4 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all text-sm font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                  maxLength={25}
                  id="hero-input-business-name"
                  aria-label="Business Name"
                />
                {businessName && (
                  <button
                    onClick={() => setBusinessName("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    id="hero-clear-input"
                    aria-label="Clear Business Name input"
                  >
                    <LucideIcon name="X" className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={triggerMint}
                disabled={isMinting}
                className="bg-mint hover:bg-mint-hover text-black font-semibold rounded-xl px-6 py-4 hover:shadow-[0_2px_20px_rgba(16,185,129,0.2)] active:scale-[0.97] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer duration-200"
                id="btn-trigger-mint-engine"
              >
                {isMinting ? (
                  <>
                    <LucideIcon name="RefreshCw" className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <LucideIcon name="Zap" className="w-4 h-4 fill-current" />
                    Create Website
                  </>
                )}
              </button>
            </motion.div>

            {/* Core Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-900"
              id="hero-stats"
            >
              <div>
                <p className="text-xl font-bold text-white font-display">99</p>
                <p className="text-xs text-zinc-500">Lighthouse speed</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white font-display">0%</p>
                <p className="text-xs text-zinc-500">Platform fee</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white font-display">Instant</p>
                <p className="text-xs text-zinc-500">SSL propagation</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Interactive Browser Previewer */}
          <div className="lg:col-span-7" id="hero-preview-column">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full flex flex-col"
            >
              {/* Sector Selection Badges */}
              <div className="flex flex-wrap gap-2 mb-5 items-center justify-start lg:justify-end" id="sector-badges-bar">
                <span className="text-xs text-zinc-500 mr-2 uppercase tracking-wider font-semibold font-mono">Switch Sector:</span>
                {PRESET_SECTORS.map((sector) => {
                  const isActive = selectedSector.id === sector.id;
                  return (
                    <button
                      key={sector.id}
                      onClick={() => handleSectorSelect(sector)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                        isActive
                          ? "bg-zinc-800/80 text-white border-zinc-700 shadow-[0_2px_12px_rgba(0,245,160,0.15)]"
                          : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                      }`}
                      id={`btn-badge-${sector.id}`}
                    >
                      <span className="relative z-10">{sector.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slow elegant floating animation wrapper */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-full flex flex-col"
                id="hero-preview-wrapper"
              >
                {/* The Browser Window Container */}
                <div
                  className="w-full rounded-2xl border border-white/[0.08] bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col"
                  style={{ height: "460px" }}
                  id="browser-window"
                >
                  {/* Browser Header Bar */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-900/80 border-b border-white/[0.06]" id="browser-header">
                    {/* Window Dots */}
                    <div className="flex gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                    </div>
                    {/* URL Bar */}
                    <div className="flex-grow max-w-md mx-6">
                      <div className="bg-zinc-950 rounded-lg px-4 py-1 text-[11px] text-zinc-500 text-center select-none font-mono flex items-center justify-center gap-1.5 border border-zinc-900">
                        <LucideIcon name="Shield" className="w-3 h-3 text-emerald-500" />
                        {window.location.host}/site/{businessName.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourbrand"}
                      </div>
                    </div>
                    {/* Viewport Toggles */}
                    <div className="flex gap-1.5" id="browser-view-toggles">
                      <button
                        onClick={() => setPreviewMode("desktop")}
                        className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                          previewMode === "desktop" ? "text-mint bg-zinc-800" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                        id="btn-toggle-desktop-view"
                        aria-label="Desktop Preview Mode"
                      >
                        <LucideIcon name="Monitor" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPreviewMode("mobile")}
                        className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                          previewMode === "mobile" ? "text-mint bg-zinc-800" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                        id="btn-toggle-mobile-view"
                        aria-label="Mobile Preview Mode"
                      >
                        <LucideIcon name="Smartphone" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Simulated Content Frame */}
                  <div className="flex-grow overflow-y-auto relative bg-[#09090B] p-0 flex items-center justify-center" id="browser-frame-body">
                    
                    {/* Live Minting Compilation Logs Overlay */}
                    <AnimatePresence>
                      {isMinting && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6"
                          id="minting-animation-overlay"
                        >
                          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mb-5 p-3 shadow-xl">
                            <LucideIcon name="RefreshCw" className="w-7 h-7 text-mint animate-spin" />
                            <div className="absolute inset-0 border border-mint rounded-2xl animate-ping opacity-25" />
                          </div>
                          
                          <div className="space-y-1 mb-5 text-center">
                            <h3 className="text-base font-bold text-white font-display">Generating Website</h3>
                            <p className="text-[9px] text-zinc-500 font-mono tracking-wider">PREPARING WEB PAGES</p>
                          </div>

                          {/* Interactive Compilation Step Checklist */}
                          <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3.5 text-left">
                            {/* Step 1 */}
                            <div className="flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-2">
                                {compileStep >= 2 ? (
                                  <LucideIcon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <LucideIcon name="RefreshCw" className="w-3.5 h-3.5 text-mint animate-spin" />
                                )}
                                <span className={compileStep >= 2 ? "text-zinc-500 line-through" : "text-white"}>
                                  Setting up layout templates...
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500">{compileStep >= 2 ? "Done" : "Running"}</span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-2">
                                {compileStep >= 3 ? (
                                  <LucideIcon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
                                ) : compileStep === 2 ? (
                                  <LucideIcon name="RefreshCw" className="w-3.5 h-3.5 text-mint animate-spin" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-800" />
                                )}
                                <span className={compileStep >= 3 ? "text-zinc-500 line-through" : compileStep === 2 ? "text-white" : "text-zinc-600"}>
                                  Adding direct payments and checkout...
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500">{compileStep >= 3 ? "Done" : compileStep === 2 ? "Running" : "Pending"}</span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-center justify-between text-xs font-mono">
                              <div className="flex items-center gap-2">
                                {compileStep >= 4 ? (
                                  <LucideIcon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
                                ) : compileStep === 3 ? (
                                  <LucideIcon name="RefreshCw" className="w-3.5 h-3.5 text-mint animate-spin" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-800" />
                                )}
                                <span className={compileStep >= 3 ? "text-white" : "text-zinc-600"}>
                                  Finalizing live website...
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500">{compileStep === 3 ? "Running" : "Pending"}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Minted Success Overlay */}
                      {mintedSuccess && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-[#09090B] z-30 flex flex-col items-center justify-center text-center p-8"
                          id="minted-success-overlay"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 glow-mint shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <LucideIcon name="Check" className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-white font-display mb-1">Website Created Successfully!</h3>
                          <p className="text-sm text-zinc-400 mb-6">Your website is ready and hosted under the site directory path</p>
                          <button
                            onClick={() => onOpenCheckout("pro")}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-sm font-bold text-black shadow-lg hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
                            id="btn-claim-minted-domain"
                          >
                            Claim Custom Domain
                          </button>
                        </motion.div>
                      )}

                      {/* Interactive Category-Switching Sandbox Update Overlay */}
                      {isTransitioning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-0 bg-black/60 backdrop-blur-[6px] z-20 flex flex-col items-center justify-center"
                          id="sandbox-transition-overlay"
                        >
                          <div className="flex flex-col items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-4 py-3 rounded-xl shadow-2xl">
                            <LucideIcon name="RefreshCw" className="w-4 h-4 text-mint animate-spin" />
                            <span className="text-[10px] font-mono tracking-wider text-zinc-300 font-bold uppercase">Updating Live Sandbox...</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Web Page View container */}
                    <div
                      className={`w-full h-full transition-all duration-500 flex flex-col bg-[#09090B] overflow-x-hidden ${
                        previewMode === "mobile" ? "max-w-[320px] border-x border-zinc-900 shadow-2xl h-full" : "max-w-full"
                      }`}
                      id="browser-simulated-site"
                    >
                      
                      {/* Simulated Site Header */}
                      <div className="px-4 py-2.5 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between">
                        <span className="font-semibold text-xs tracking-tight text-white font-display">
                          {businessName || "Your Brand"}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${selectedSector.accentHex}15`, color: selectedSector.accentHex }}
                        >
                          Online Hub
                        </span>
                      </div>

                      {/* Simulated Hero Grid / Stack */}
                      <div className="flex-grow p-4 md:p-6 flex flex-col justify-between gap-4 overflow-y-auto">
                        <div className={`grid gap-4 items-center ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                          <div className="text-left space-y-2">
                            <h4 className="text-base md:text-lg font-bold text-white font-display leading-tight">
                              {selectedSector.tagline}
                            </h4>
                            <p className="text-[10px] text-zinc-400">
                              Book appointments, explore custom programs, and check out securely under our new minted portal.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedSector.features.map((f, idx) => (
                                <span key={idx} className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Image section with accent border */}
                          <div className="relative group rounded-xl overflow-hidden aspect-video border border-zinc-800">
                            <img
                              src={selectedSector.image}
                              alt={businessName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                          </div>
                        </div>

                        {/* Interactive Section - Offerings List */}
                        <div className="border-t border-zinc-900 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Premium Offerings</span>
                            <span className="text-[10px] text-zinc-400">Book below</span>
                          </div>
                          <div className={`grid gap-2 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
                            {selectedSector.items.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  triggerMint();
                                }}
                                className="bg-zinc-900 border border-zinc-800/60 p-2 rounded-lg text-left flex justify-between items-center hover:border-zinc-700 cursor-pointer transition-all hover:scale-[1.02]"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-[9px] font-bold text-zinc-200">{item}</p>
                                  <p className="text-[8px] text-zinc-500">Live booking ready</p>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white">
                                  <LucideIcon name="ChevronRight" className="w-3 h-3" />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Simulated Interactive Footer / CTA button */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                          <button
                            onClick={triggerMint}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${selectedSector.buttonClass}`}
                          >
                            Book Now
                          </button>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
