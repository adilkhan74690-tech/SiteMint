import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { templates } from "../data";
import LucideIcon from "./LucideIcon";

interface TemplateShowcaseProps {
  onOpenCheckout: (planId?: string) => void;
  onNavigateToDemo?: (demoId: string) => void;
}

interface BusinessDetails {
  tagline: string;
  description: string;
  cta: string;
  features: string[];
}

const getCategoryTemplateLabel = (catId: string) => {
  switch (catId.toLowerCase()) {
    case "gym":
      return "Gym Template";
    case "restaurant":
      return "Restaurant Template";
    case "salon":
      return "Salon Template";
    case "cafe":
      return "Cafe Template";
    case "clothing":
    case "fashion":
      return "Fashion Template";
    default:
      return `${catId.charAt(0).toUpperCase() + catId.slice(1)} Template`;
  }
};

const getMockNavLinks = (catId: string) => {
  switch (catId.toLowerCase()) {
    case "gym":
      return ["Classes", "Trainers", "Join"];
    case "restaurant":
      return ["Menu", "Book Table", "Order"];
    case "salon":
      return ["Services", "Stylists", "Book"];
    case "cafe":
      return ["Order Ahead", "Coffee Subs", "Visit"];
    case "clothing":
    case "fashion":
      return ["Shop", "Lookbook", "Collections"];
    default:
      return ["Services", "About", "Contact"];
  }
};

const getTemplateBusinessDetails = (id: string, categoryId: string): BusinessDetails => {
  switch (id) {
    case "pulse-gym":
      return {
        tagline: "Train smarter. Book sessions online. Manage memberships with ease.",
        description: "We build high-performance websites for independent gyms, martial arts centers, and fitness coaches. Keep your calendars synced and collect membership fees automatically.",
        cta: "Book Session",
        features: ["Class scheduling", "Trainer directory", "Membership tiers", "Automatic billing"]
      };
    case "forge-fitness":
      return {
        tagline: "Heavy lifting, zero friction. Schedule slots instantly.",
        description: "A premium digital experience built for powerlifting clubs, CrossFit boxes, and strength studios. Let members book open gym slots and hire coaches online.",
        cta: "Schedule Slot",
        features: ["Open gym booking", "Personal training hooks", "Simple intake forms", "Secure card payments"]
      };
    case "michelin-bistro":
      return {
        tagline: "Browse our menu. Book a table. Order takeout online.",
        description: "A gorgeous digital front for cafes and fine dining. Showcase daily specials, let diners secure tables, and accept zero-commission online food orders directly.",
        cta: "Order Takeout",
        features: ["Digital menus", "Table reservations", "Takeout pre-ordering", "Direct card payments"]
      };
    case "luna-salon":
      return {
        tagline: "Choose your stylist. Book appointments. Send SMS reminders.",
        description: "Simplify booking for beauty salons, barbers, and spas. Show your service catalog, let clients pick their favorite stylist, and automate appointment reminders.",
        cta: "Book Appointment",
        features: ["Stylist selector", "Service catalog", "Online deposits", "Synced calendar"]
      };
    case "roastery-hub":
      return {
        tagline: "Order fresh brews. Skip the line. Join our reward club.",
        description: "Perfect for local roasters and neighborhood coffee shops. Allow customers to order ahead, manage recurring subscriptions, and post announcements.",
        cta: "Order Ahead",
        features: ["Order ahead queue", "Bean subscriptions", "Digital loyalty cards", "Menu builder"]
      };
    case "nordic-threads":
      return {
        tagline: "Explore lookbooks. Shop collections. Checkout securely.",
        description: "Designed for boutique clothing and retail shops. Present your latest design lookbooks, let customers select sizes, and check out securely in seconds.",
        cta: "Shop Collection",
        features: ["Visual lookbook", "Sizing selectors", "Stripe shopping cart", "Inventory manager"]
      };
    default:
      switch (categoryId.toLowerCase()) {
        case "gym":
          return {
            tagline: "Train smarter. Book sessions online.",
            description: "Keep your calendars synced and collect membership fees automatically in one clean dashboard.",
            cta: "Book Session",
            features: ["Class scheduling", "Trainer directory", "Membership plans", "Clean billing"]
          };
        case "restaurant":
          return {
            tagline: "Browse our menu. Book a table.",
            description: "Showcase daily specials, let diners secure tables, and accept zero-commission online food orders directly.",
            cta: "Order Takeout",
            features: ["Digital menus", "Table reservations", "Takeout pre-ordering", "Direct card payments"]
          };
        default:
          return {
            tagline: "A clean online home for your local shop.",
            description: "Launch direct scheduling, accept secure card payments, and connect your own domain name in under five minutes with no technical experience required.",
            cta: "Get Started",
            features: ["Secure payments", "Direct schedules", "Customer support desk", "Mobile first layout"]
          };
      }
  }
};

export default function TemplateShowcase({ onOpenCheckout, onNavigateToDemo }: TemplateShowcaseProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedAccentColor, setSelectedAccentColor] = useState(templates[0].accentColor);

  const handleTemplateChange = (tmpl: typeof templates[0]) => {
    setSelectedTemplate(tmpl);
    setSelectedAccentColor(tmpl.accentColor);
  };

  const details = getTemplateBusinessDetails(selectedTemplate.id, selectedTemplate.categoryId);
  const navLinks = getMockNavLinks(selectedTemplate.categoryId);

  return (
    <section className="py-24 bg-[#09090B] border-t border-zinc-900 relative overflow-hidden" id="templates">
      {/* Background Decorators */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="templates-header">
          <h2 className="text-sm font-semibold tracking-widest text-mint uppercase mb-3 font-mono">
            Business Templates
          </h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display mb-4">
            Choose a Template.
          </h3>
          <p className="text-base text-zinc-400">
            Select a layout, test custom colors, and see how your website will look on desktop and mobile viewports.
          </p>
        </div>

        {/* Showcase Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch" id="templates-interface">
          
          {/* Left Panel: Sidebar Selection (Col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6" id="templates-sidebar">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Business Templates</span>
              
              {/* Responsive container: row scroll on mobile, vertical list on desktop */}
              <div 
                className="flex flex-row overflow-x-auto pb-4 gap-3 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-none snap-x snap-mandatory" 
                id="templates-list"
              >
                {templates.map((tmpl) => {
                  const isActive = tmpl.id === selectedTemplate.id;
                  const isLive = ["pulse-gym", "michelin-bistro", "luna-salon", "nordic-threads"].includes(tmpl.id);
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl)}
                      className={`snap-center min-w-[260px] sm:min-w-[300px] lg:min-w-0 lg:w-full text-left p-4 rounded-xl border transition-all relative flex items-center justify-between group cursor-pointer duration-200 ${
                        isActive
                          ? "bg-[#18181B] border-zinc-700 shadow-md"
                          : "bg-[#111111] border-zinc-800/60 hover:border-zinc-800 hover:bg-[#151518]"
                      }`}
                      id={`btn-select-template-${tmpl.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white font-display">{tmpl.name}</p>
                          {!isLive && (
                            <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">
                          {getCategoryTemplateLabel(tmpl.categoryId)}
                        </p>
                      </div>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: tmpl.accentColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Colors Customizer Widget */}
            <div className="p-5 rounded-xl bg-[#111111] border border-zinc-800/80 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-1">Brand Colors</p>
                <p className="text-xs text-zinc-500">Choose your primary website color</p>
              </div>

              <div className="flex items-center gap-3 animate-fade-in" id="color-palette-options">
                {["#10B981", "#EC4899", "#06B6D4", "#F59E0B", "#8B5CF6", "#F97316"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedAccentColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                      selectedAccentColor === color ? "border-white scale-105" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select accent color ${color}`}
                    id={`btn-color-${color.replace("#", "")}`}
                  />
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono font-medium">Built with:</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <LucideIcon name="Shield" className="w-3.5 h-3.5" />
                  Clean, fast code
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Immersive Browser Preview (Col-span-8) */}
          <div className="lg:col-span-8 flex flex-col justify-between" id="templates-preview-frame">
            {/* Viewport Toggles and Controls */}
            <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-zinc-400 font-mono ml-3 font-bold truncate max-w-[150px] sm:max-w-none">
                  {window.location.host}/site/{selectedTemplate.name.toLowerCase().replace(/\s+/g, "-")}
                </span>
              </div>

              <div className="flex items-center gap-2" id="device-view-toggles">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  id="btn-showcase-desktop"
                >
                  <LucideIcon name="Monitor" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === "mobile" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  id="btn-showcase-mobile"
                >
                  <LucideIcon name="Smartphone" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Immersive Preview Visual Window Container */}
            <div className="flex-grow flex items-center justify-center p-0 rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden relative shadow-2xl min-h-[500px]">
              
              {/* Dynamic Mock Site Frame */}
              <div
                className={`w-full h-full flex flex-col bg-[#09090B] transition-all duration-500 ease-out ${
                  previewDevice === "mobile" ? "max-w-[340px] border-x border-zinc-800/80 my-4 h-[440px] shadow-2xl rounded-2xl" : "max-w-full h-full min-h-[500px]"
                }`}
                id="template-canvas"
              >
                {/* Header of dynamic mock site */}
                <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-display">
                    {selectedTemplate.name}
                  </span>
                  <div className="flex gap-4">
                    {navLinks.map((link, idx) => (
                      <span key={idx} className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer font-medium">
                        {link}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Animated Inner Container */}
                <div className="flex-grow overflow-y-auto relative min-h-[380px] flex flex-col">
                  {!(selectedTemplate.id === "pulse-gym" || selectedTemplate.id === "michelin-bistro" || selectedTemplate.id === "luna-salon" || selectedTemplate.id === "nordic-threads") ? (
                    <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-xl">
                        <LucideIcon name="Lock" className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="space-y-2">
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-widest font-mono">
                          Coming Soon
                        </span>
                        <h4 className="text-lg font-bold text-white tracking-tight">{selectedTemplate.name}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
                          We're building this template. Available in future updates.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          alert(`We've registered your interest! You'll be notified immediately when the ${selectedTemplate.name} template becomes available.`);
                        }}
                        className="bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Notify Me
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedTemplate.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="flex-grow p-6 flex flex-col justify-between gap-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div className="space-y-4 text-left">
                            <h4 className="text-xl md:text-2xl font-black text-white font-display tracking-tight leading-tight">
                              {details.tagline}
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {details.description}
                            </p>
                          </div>

                          <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-900 shadow-xl group">
                            <img
                              src={selectedTemplate.heroImage}
                              alt={selectedTemplate.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent" />
                          </div>
                        </div>

                        {/* Features / Services inside mock site */}
                        <div className="border-t border-zinc-900/60 pt-4">
                          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 text-left">
                            Built-in features
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {details.features.map((feat, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-900/40 border border-zinc-800 p-2.5 rounded-lg text-left"
                              >
                                <LucideIcon name="Check" className="w-3.5 h-3.5 mb-1" style={{ color: selectedAccentColor }} />
                                <p className="text-[10px] font-bold text-zinc-200 leading-tight">{feat}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Button */}
                        <div className="flex items-center justify-end border-t border-zinc-900/60 pt-4 mt-2 gap-3">
                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            {onNavigateToDemo && (
                              <button
                                disabled={!["pulse-gym", "michelin-bistro", "luna-salon", "nordic-threads"].includes(selectedTemplate.id)}
                                onClick={() => {
                                  const cat = selectedTemplate.categoryId;
                                  if (cat === "gym" || cat === "restaurant" || cat === "salon" || cat === "clothing") {
                                    onNavigateToDemo(`preview-${cat}` as any);
                                  } else {
                                    onNavigateToDemo(`preview-gym`);
                                  }
                                }}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white hover:border-zinc-750 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                id="btn-showcase-preview-demo"
                              >
                                <LucideIcon name="ExternalLink" className="w-3.5 h-3.5" />
                                Preview Demo
                              </button>
                            )}
                            <button
                              disabled={!["pulse-gym", "michelin-bistro", "luna-salon", "nordic-threads"].includes(selectedTemplate.id)}
                              onClick={() => onOpenCheckout("pro")}
                              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(0,245,160,0.15)] disabled:opacity-40 disabled:pointer-events-none"
                              style={{
                                background: ["pulse-gym", "michelin-bistro", "luna-salon", "nordic-threads"].includes(selectedTemplate.id)
                                  ? "linear-gradient(135deg, #00F5A0, #00D185)"
                                  : "#27272a"
                              }}
                              id="btn-showcase-start-minting"
                            >
                              <LucideIcon name={["pulse-gym", "michelin-bistro", "luna-salon", "nordic-threads"].includes(selectedTemplate.id) ? "Zap" : "Lock"} className="w-3.5 h-3.5" />
                              {["pulse-gym", "michelin-bistro", "luna-salon", "nordic-threads"].includes(selectedTemplate.id) ? "Start Minting" : "Coming Soon"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
