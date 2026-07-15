import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { pricingPlans } from "../data";
import LucideIcon from "./LucideIcon";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId: string;
}

const COMPILATION_STEPS = [
  "Scaffolding React + Tailwind container on Cloud CDN...",
  "Injecting custom CSS variables and custom brand tokens...",
  "Embedding database-driven calendar and slot mechanics...",
  "Provisioning secure SSL domain mapping & firewall layers...",
  "Running production esbuild bundle compiler (100/100 performance checked)...",
  "Site minted successfully! Broad-casting to edge nodes globally."
];

export default function CheckoutModal({ isOpen, onClose, selectedPlanId }: CheckoutModalProps) {
  const [activeTab, setActiveTab] = useState<"configure" | "payment">("configure");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("gym");
  const [domainName, setDomainName] = useState("");
  
  // Custom modules to toggle with price influence
  const [enableBooking, setEnableBooking] = useState(true);
  const [enableAlerts, setEnableAlerts] = useState(false);
  const [enableAnalytics, setEnableAnalytics] = useState(true);

  // Minting engine progress state
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState(0);
  const [mintDone, setMintDone] = useState(false);

  const selectedPlan = pricingPlans.find((p) => p.id === selectedPlanId) || pricingPlans[1];

  // Auto-generate domain based on business name
  useEffect(() => {
    if (businessName) {
      const sanitized = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
      setDomainName(`${window.location.host}/site/${sanitized}`);
    } else {
      setDomainName(`${window.location.host}/site/yourbrand`);
    }
  }, [businessName]);

  // Handle compilation simulation timer
  useEffect(() => {
    let interval: any;
    if (isMinting) {
      interval = setInterval(() => {
        setMintStep((prev) => {
          if (prev < COMPILATION_STEPS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsMinting(false);
            setMintDone(true);
            return prev;
          }
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isMinting]);

  const handleStartMinting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      alert("Please enter a business name first!");
      return;
    }
    setMintStep(0);
    setMintDone(false);
    setIsMinting(true);
  };

  const handleReset = () => {
    setBusinessName("");
    setIndustry("gym");
    setEnableBooking(true);
    setEnableAlerts(false);
    setEnableAnalytics(true);
    setIsMinting(false);
    setMintStep(0);
    setMintDone(false);
    setActiveTab("configure");
    onClose();
  };

  // Live total price calculation
  const basePrice = selectedPlan.priceYearly;
  const addonPrice = (enableAlerts ? 5 : 0) + (enableAnalytics ? 4 : 0);
  const totalPrice = basePrice + addonPrice;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end" id="checkout-modal-root">
        {/* Backdrop glass cover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          id="checkout-backdrop"
        />

        {/* Drawer Slide-in body */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative w-full max-w-lg h-full bg-[#09090B] border-l border-zinc-800 shadow-2xl flex flex-col z-10 overflow-hidden"
          id="checkout-drawer"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40" id="checkout-header">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
                Configure Site: {selectedPlan.name}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">Custom Sandbox Setup</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white transition-all flex items-center justify-center"
              id="btn-close-checkout"
            >
              <LucideIcon name="X" className="w-4 h-4" />
            </button>
          </div>

          {/* Compilation Loader Screen (Trumps normal view when compile is active) */}
          {(isMinting || mintDone) ? (
            <div className="flex-grow p-6 md:p-8 flex flex-col justify-between overflow-y-auto" id="checkout-compiling-panel">
              <div className="space-y-8 flex-grow flex flex-col justify-center text-center">
                
                {/* Visual Status Indicator */}
                <div className="flex justify-center">
                  <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {isMinting ? (
                      <LucideIcon name="RefreshCw" className="w-10 h-10 text-mint animate-spin" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center glow-mint animate-bounce">
                        <LucideIcon name="Check" className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 border border-mint/20 rounded-2xl animate-pulse" />
                  </div>
                </div>

                {/* Live Output Steps Terminal */}
                <div className="space-y-4 max-w-md mx-auto">
                  <h4 className="text-xl font-bold text-white font-display">
                    {isMinting ? "Minting Machine Operating..." : "Compilation Succeeded!"}
                  </h4>
                  <p className="text-sm text-zinc-400">
                    SiteMint's automated CI/CD pipeline is generating your custom codebase.
                  </p>

                  {/* Terminal Logger */}
                  <div className="rounded-xl border border-zinc-800/80 bg-[#111111] p-5 text-left font-mono text-[11px] leading-relaxed text-zinc-400 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>Console Logs</span>
                    </div>
                    <div className="space-y-2">
                      {COMPILATION_STEPS.slice(0, mintStep + 1).map((step, sIdx) => {
                        const isCurrent = sIdx === mintStep;
                        return (
                          <div
                            key={sIdx}
                            className={`flex gap-2 transition-all ${
                              isCurrent ? "text-mint font-semibold animate-pulse" : "text-zinc-500"
                            }`}
                          >
                            <span className="shrink-0">{isCurrent ? "▶" : "✔"}</span>
                            <span>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons at Compilation Finish */}
              {mintDone && (
                <div className="space-y-3 pt-6 border-t border-zinc-900" id="minted-complete-actions">
                  <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-center">
                    <p className="text-xs font-semibold text-emerald-400 font-mono">Live Sandbox Domain Mapping Completed:</p>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-sm font-bold text-white hover:underline block mt-1 flex items-center justify-center gap-1.5"
                    >
                      <LucideIcon name="Globe" className="w-4 h-4 text-emerald-400" />
                      https://{domainName}
                    </a>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full bg-mint text-black font-semibold rounded-xl py-3.5 hover:bg-[#00D185] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_25px_rgba(16,185,129,0.3)]"
                    id="btn-close-checkout-success"
                  >
                    Go to Your Sandbox Dashboard
                    <LucideIcon name="ArrowRight" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Form Configuration Mode
            <form onSubmit={handleStartMinting} className="flex-grow flex flex-col justify-between overflow-y-auto" id="checkout-form-container">
              
              <div className="p-6 md:p-8 space-y-8 flex-grow">
                {/* Configuration Fields */}
                <div className="space-y-5" id="form-brand-details">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">01. Brand Information</h4>
                  
                  {/* Business Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300" htmlFor="checkout-input-business-name">Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Paramount Pilates"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 focus:outline-none focus:border-mint text-sm font-medium"
                      maxLength={25}
                      id="checkout-input-business-name"
                    />
                  </div>

                  {/* Industry Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300" htmlFor="checkout-select-industry">Sector Core Layout</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-mint text-sm font-medium"
                      id="checkout-select-industry"
                    >
                      <option value="gym">Gym & Athletics</option>
                      <option value="restaurant">Restaurant & Fine Dining</option>
                      <option value="salon">Salon & Spa</option>
                      <option value="clothing">Clothing & Apparel</option>
                      <option value="cafe">Cafe & Coffee</option>
                      <option value="jewellery">Jewellery & Luxury Goods</option>
                    </select>
                  </div>

                  {/* URL subdomain display */}
                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-mono">Subdomain mapping:</span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono select-all">
                      {domainName}
                    </span>
                  </div>
                </div>

                {/* Modules Toggle Selection */}
                <div className="space-y-5" id="form-module-selection">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">02. Toggle Interactive Modules</h4>
                  
                  <div className="space-y-3">
                    
                    {/* Booking Module */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-start gap-3">
                        <LucideIcon name="CalendarRange" className="w-5 h-5 text-mint mt-0.5" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">Interactive Booking Engine</p>
                          <p className="text-[10px] text-zinc-500">Reservations, calendar, automated stylist selectors.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableBooking}
                        onChange={(e) => setEnableBooking(e.target.checked)}
                        className="w-4 h-4 accent-mint bg-zinc-900 border-zinc-800"
                        id="toggle-booking"
                      />
                    </div>

                    {/* Email Alerts Module */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-start gap-3">
                        <LucideIcon name="Zap" className="w-5 h-5 text-cyan-400 mt-0.5" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">Email & SMS Alerts (+$5/mo)</p>
                          <p className="text-[10px] text-zinc-500">Automated slot confirm, stylists reminder triggers.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableAlerts}
                        onChange={(e) => setEnableAlerts(e.target.checked)}
                        className="w-4 h-4 accent-mint bg-zinc-900 border-zinc-800"
                        id="toggle-alerts"
                      />
                    </div>

                    {/* Analytics Module */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-start gap-3">
                        <LucideIcon name="LineChart" className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">Google SEO & Analytics (+$4/mo)</p>
                          <p className="text-[10px] text-zinc-500">Auto-tracking, sitemap, 100/100 performance board.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableAnalytics}
                        onChange={(e) => setEnableAnalytics(e.target.checked)}
                        className="w-4 h-4 accent-mint bg-zinc-900 border-zinc-800"
                        id="toggle-analytics"
                      />
                    </div>

                  </div>
                </div>

                {/* Sub Total Section */}
                <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800/80 space-y-3" id="form-subtotal">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Base Tier: {selectedPlan.name}</span>
                    <span className="text-zinc-300 font-mono">${basePrice}/mo</span>
                  </div>
                  {(enableAlerts || enableAnalytics) && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Selected Addons</span>
                      <span className="text-zinc-300 font-mono">+${addonPrice}/mo</span>
                    </div>
                  )}
                  <div className="border-t border-zinc-800/60 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Total Billing (Billed Yearly)</span>
                    <span className="text-base font-extrabold text-mint font-mono">${totalPrice} / mo</span>
                  </div>
                </div>
              </div>

              {/* Form Submission Block */}
              <div className="p-6 border-t border-zinc-800 bg-zinc-900/40 space-y-3" id="form-actions">
                <button
                  type="submit"
                  className="w-full bg-mint text-black font-semibold rounded-xl py-3.5 hover:bg-[#00D185] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_25px_rgba(16,185,129,0.3)]"
                  id="btn-complete-setup"
                >
                  <LucideIcon name="CreditCard" className="w-4 h-4" />
                  Complete Mint setup
                </button>
                <p className="text-[10px] text-zinc-500 text-center font-mono">
                  Guaranteed SSL encryption • 30-day money-back guarantee • 0% Transaction markups
                </p>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
