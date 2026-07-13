import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "./LucideIcon";
import Logo from "./Logo";

interface OnboardingFlowProps {
  userEmail: string;
  onComplete: () => void;
  onNavigate: (view: "landing" | "login" | "register" | "forgot-password" | "reset-password" | "onboarding") => void;
}

// Preset Website templates for step 3
const WEB_TEMPLATES = [
  {
    id: "vanguard",
    name: "Vanguard Minimalist",
    description: "High-contrast sleek typographic layouts with massive negative space. Perfect for high-end boutique stores or modern agencies.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    tags: ["Typographic", "Clean", "Corporate"],
    accentHex: "#10B981",
  },
  {
    id: "saffron",
    name: "Saffron Editorial",
    description: "Immersive luxury layout with sophisticated font weights, beautiful image cards, and styled calendar scheduling integrations.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    tags: ["Luxury", "Booking-First", "Dark"],
    accentHex: "#EC4899",
  },
  {
    id: "ethereal",
    name: "Ethereal Aurora",
    description: "Futuristic layout using soft cyan/emerald gradients, transparent glass elements, and modern rounded card containers.",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    tags: ["Tech", "Creative", "Glassmorphism"],
    accentHex: "#06B6D4",
  },
  {
    id: "monochrome",
    name: "Industrial Brutalism",
    description: "Bold sans serif typography, thick high-contrast borders, raw mono grids, and sharp hover animations. Designed for creators.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    tags: ["Raw", "Creative", "High Contrast"],
    accentHex: "#F59E0B",
  },
];

// Preset Themes with customizable swatches for step 4
const THEME_PALETTES = [
  {
    id: "emerald-mint",
    name: "Mint Obsidian",
    primary: "#00F5A0",
    secondary: "#10B981",
    bg: "#09090B",
    glowColor: "rgba(0, 245, 160, 0.15)",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "cyberpunk",
    name: "Neon Sapphire",
    primary: "#06B6D4",
    secondary: "#3B82F6",
    bg: "#020617",
    glowColor: "rgba(6, 182, 212, 0.15)",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "violet-amethyst",
    name: "Cosmic Nebula",
    primary: "#A855F7",
    secondary: "#EC4899",
    bg: "#090514",
    glowColor: "rgba(168, 85, 247, 0.15)",
    text: "text-purple-400",
    border: "border-purple-500/20",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    id: "sunset-gold",
    name: "Copper Solstice",
    primary: "#F59E0B",
    secondary: "#EF4444",
    bg: "#0C0A09",
    glowColor: "rgba(245, 158, 11, 0.15)",
    text: "text-amber-400",
    border: "border-amber-500/20",
    gradient: "from-amber-400 to-rose-500",
  },
  {
    id: "brutalist-mono",
    name: "Industrial Carbon",
    primary: "#FFFFFF",
    secondary: "#A1A1AA",
    bg: "#09090B",
    glowColor: "rgba(255, 255, 255, 0.1)",
    text: "text-zinc-100",
    border: "border-zinc-500/20",
    gradient: "from-zinc-100 to-zinc-400",
  },
];

// Preset Categories with beautiful custom-built vectors or matching icons
const CATEGORIES = [
  { id: "salon", label: "Hair & Nail Salons", icon: "Scissors", tag: "Appts & Styling" },
  { id: "gym", label: "Fitness & Athletics", icon: "Activity", tag: "Classes & Schedules" },
  { id: "restaurant", label: "Boutique Restaurants", icon: "Utensils", tag: "Menus & Table Book" },
  { id: "spa", label: "Spas & Body Rituals", icon: "Sparkles", tag: "Luxury Bookings" },
  { id: "cafe", label: "Cafes & Roasteries", icon: "Coffee", tag: "Order & Pickups" },
  { id: "consulting", label: "Professional Services", icon: "Briefcase", tag: "Intake & Hourly" },
  { id: "clinics", label: "Boutique Medical", icon: "Heart", tag: "HIPAA & Consults" },
  { id: "creative", label: "Art & Photo Studios", icon: "Camera", tag: "Galleries & Bookings" },
];

export default function OnboardingFlow({ userEmail, onComplete, onNavigate }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Business Information state
  const [businessName, setBusinessName] = useState("Vanguard Athletic Lab");
  const [tagline, setTagline] = useState("Elite body mechanics and custom strength audits");
  const [phone, setPhone] = useState("+1 (555) 382-9216");
  const [address, setAddress] = useState("458 Innovation Way, Sector 12");
  const [description, setDescription] = useState(
    "A boutique coaching studio providing dedicated body diagnostic evaluations, high-performance athletic programming, and nutritional engineering."
  );
  
  // Custom SiteMint Onboarding Fields
  const [subdomain, setSubdomain] = useState("vanguard-athletic-lab");
  const [upiId, setUpiId] = useState("vanguard@upi");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80");

  // Keep subdomain in sync with business name until user edits it manually
  const [isSubdomainDirty, setIsSubdomainDirty] = useState(false);
  
  useEffect(() => {
    if (!isSubdomainDirty) {
      setSubdomain(businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  }, [businessName, isSubdomainDirty]);

  // Step 2: Category state
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[1]); // Default Gym

  // Step 3: Template state
  const [selectedTemplate, setSelectedTemplate] = useState(WEB_TEMPLATES[0]);

  // Step 4: Theme state
  const [selectedTheme, setSelectedTheme] = useState(THEME_PALETTES[0]);

  // Step 5: Preview state
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewInteractedItem, setPreviewInteractedItem] = useState<string | null>(null);

  // Step 6: Console Compilation logs state
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // Mock compile console logs
  const compileSteps = [
    "Starting compilation sequence on SiteMint Engine v4.2...",
    "Parsing metadata blocks for: " + businessName,
    "Selected theme layout matched: " + selectedTheme.name,
    "Validating secure subdomain mapping rules...",
    "Subdomain successfully bound: " + subdomain + ".sitemint.app",
    "Bundling React SPA package with esbuild compiler...",
    "Injecting custom styling tokens and root variables...",
    "Injecting interactive booking system module...",
    "Optimizing responsive layouts (desktop & mobile matrix)...",
    "Generating premium SVG iconography sets...",
    "Provisioning Let's Encrypt SSL/TLS certificates...",
    "Synchronizing edge server points globally (CDN Cloudflare)...",
    "Minting Complete! Deployment Live at Edge Networks.",
  ];

  // Run Compilation logs on Step 6 enter
  useEffect(() => {
    if (currentStep === 6 && !isPublished) {
      let logIndex = 0;
      setCompilationLogs([]);
      setCompilationProgress(0);

      const interval = setInterval(() => {
        if (logIndex < compileSteps.length) {
          setCompilationLogs((prev) => [...prev, compileSteps[logIndex]]);
          setCompilationProgress(Math.floor(((logIndex + 1) / compileSteps.length) * 100));
          logIndex++;
        } else {
          clearInterval(interval);
          setIsPublished(true);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Autocomplete templates info depending on category selected
  const handleCategorySelect = (category: typeof CATEGORIES[0]) => {
    setSelectedCategory(category);
    // Autofill matching dummy template data for seamless immersion
    if (category.id === "salon") {
      setBusinessName("Svelte Hair & Co");
      setTagline("Organic hair artistry and styling rituals");
      setDescription("A luxurious, eco-conscious sanctuary for hair design, organic color therapies, and bespoke style rituals.");
      setUpiId("sveltehair@upi");
    } else if (category.id === "restaurant") {
      setBusinessName("Bistro Deluxe");
      setTagline("Artisan plates, local grapes, timeless taste");
      setDescription("A warm, sophisticated neighborhood dining room showcasing seasonal local ingredients, natural wines, and classic techniques.");
      setUpiId("bistrodeluxe@upi");
    } else if (category.id === "spa") {
      setBusinessName("Solitude Wellness Spa");
      setTagline("Luxury sensory escape and hot stone restorative therapy");
      setDescription("A secluded premium spa offering custom aromatherapy bodywork, multi-step facial peels, and peaceful water therapy.");
    } else if (category.id === "cafe") {
      setBusinessName("Obsidian Brew Bar");
      setTagline("Single-origin cold drip & artisanal baking");
      setDescription("A third-wave micro-roastery featuring rare single-origins, pour-over bars, and fresh daily sourdough pastries.");
    } else if (category.id === "gym") {
      setBusinessName("Vanguard Athletic Lab");
      setTagline("Elite body mechanics and custom strength audits");
      setDescription("A boutique coaching studio providing dedicated body diagnostic evaluations, high-performance athletic programming, and nutritional engineering.");
      setUpiId("vanguard@upi");
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Step 1: Business info validate
  const isStep1Valid = businessName && tagline && phone && address && description && subdomain && upiId;

  const handleOnboardingComplete = async () => {
    const token = localStorage.getItem("sitemint_token");
    try {
      const response = await fetch("/api/businesses/onboard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: businessName,
          business_type: selectedCategory.label,
          contact_phone: phone,
          address,
          description,
          subdomain,
          upi_id: upiId,
          logo_url: logoUrl,
          template_id: selectedTemplate.id || 1,
          primary_color: selectedTheme.primary,
          secondary_color: selectedTheme.secondary,
          font_family: selectedTheme.font || "Inter"
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to onboard business.");
      }

      onComplete();
    } catch (err: any) {
      alert("Error completing onboarding: " + err.message);
    }
  };

  const stepperLabels = [
    { id: 1, label: "Info", icon: "FileText" },
    { id: 2, label: "Category", icon: "Grid" },
    { id: 3, label: "Template", icon: "Layers" },
    { id: 4, label: "Theme", icon: "Palette" },
    { id: 5, label: "Preview", icon: "Eye" },
    { id: 6, label: "Publish", icon: "Zap" },
  ];

  return (
    <div className="relative min-h-screen pt-28 pb-16 bg-[#09090B] bg-dot-grid overflow-hidden text-white px-4 sm:px-6 lg:px-8" id="onboarding-root">
      
      {/* Background Radiants */}
      <div className="absolute top-[10%] left-[25%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[25%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Step Header */}
        <div className="text-center mb-6" id="onboarding-header">
          <Logo className="h-16 mb-2 justify-center" variant="full" showText={false} />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Onboarding Workspace
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg">
            Complete the 6 credentials steps to instantly compile and deploy your business storefront on our CDN.
          </p>
        </div>

        {/* HIGH-CRAFT STEPPER MODULE */}
        <div className="w-full max-w-4xl mb-12 bg-zinc-950/40 border border-zinc-900/60 p-4 sm:p-5 rounded-2xl backdrop-blur-md" id="premium-onboarding-stepper">
          <div className="flex items-center justify-between relative" id="stepper-row">
            
            {/* Background progress bar line */}
            <div className="absolute left-[3%] right-[3%] top-[35%] h-[2px] bg-zinc-800 -z-10" />
            <div 
              className="absolute left-[3%] top-[35%] h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-400 -z-10 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / 5) * 94}%` }}
            />

            {stepperLabels.map((step) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  disabled={step.id > currentStep && !isStep1Valid}
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-2 group focus:outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  id={`stepper-node-${step.id}`}
                >
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      isActive 
                        ? "bg-zinc-900 border-mint text-mint glow-mint scale-110" 
                        : isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent text-black"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    {isCompleted ? (
                      <LucideIcon name="Check" className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <LucideIcon name={step.icon} className="w-4 h-4" />
                    )}
                  </div>
                  <span 
                    className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-colors hidden sm:block ${
                      isActive ? "text-mint font-bold" : isCompleted ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP BODY WRAPPER */}
        <div className="w-full max-w-4xl" id="onboarding-step-content-box">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            >
              
              {/* STEP 1: BUSINESS INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-6" id="step-1-business-info">
                  <div className="border-b border-zinc-900 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white font-display">Step 1: Business Identity</h3>
                    <p className="text-xs text-zinc-400">Specify details that will automatically compile onto your website header, footer, and interactive sections.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., Vanguard Wellness Lab"
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                        id="onboarding-input-name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Catchy Slogan / Tagline</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g., Artisan plates, local grapes, timeless taste."
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                        id="onboarding-input-tagline"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business Contact Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2831"
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                        id="onboarding-input-phone"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Physical Street Location</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="804 Broadway Ave, New York"
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                        id="onboarding-input-address"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business Narrative / Biography</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Provide a stunning narrative about what services your business excels at. This will compile directly on your website about column..."
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all resize-none"
                        id="onboarding-input-description"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business Slug / Subdomain</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => {
                            setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                            setIsSubdomainDirty(true);
                          }}
                          placeholder="vanguard-athletic-lab"
                          className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-4 pr-24 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all font-mono"
                          id="onboarding-input-subdomain"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                          .sitemint.app
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Business UPI ID (For Direct Payments)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g., yourname@okaxis"
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all font-mono"
                        id="onboarding-input-upi"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Brand Logo Image URL</label>
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all font-mono"
                        id="onboarding-input-logo"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CHOOSE BUSINESS CATEGORY */}
              {currentStep === 2 && (
                <div className="space-y-6" id="step-2-category">
                  <div className="border-b border-zinc-900 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white font-display">Step 2: Business Category</h3>
                    <p className="text-xs text-zinc-400">Selecting a category optimizes the functional module plugins (e.g. scheduling forms, menus, booking grids).</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="categories-onboarding-grid">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory.id === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat)}
                          className={`group relative p-5 rounded-2xl border text-center cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-zinc-900 border-mint/60 shadow-[0_4px_20px_rgba(0,245,160,0.1)]"
                              : "bg-zinc-950 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700"
                          }`}
                          id={`cat-card-${cat.id}`}
                        >
                          <div 
                            className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4 transition-colors ${
                              isSelected ? "bg-mint text-black" : "bg-zinc-900 text-zinc-400 group-hover:text-white"
                            }`}
                          >
                            <LucideIcon name={cat.icon} className="w-5 h-5" />
                          </div>
                          
                          <h4 className={`text-sm font-semibold tracking-tight transition-colors ${isSelected ? "text-white" : "text-zinc-300"}`}>
                            {cat.label}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-wider">{cat.tag}</p>

                          {/* Selected Check Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-mint text-black flex items-center justify-center scale-90">
                              <LucideIcon name="Check" className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: CHOOSE WEBSITE TEMPLATE */}
              {currentStep === 3 && (
                <div className="space-y-6" id="step-3-template">
                  <div className="border-b border-zinc-900 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white font-display">Step 3: Website Template Structure</h3>
                    <p className="text-xs text-zinc-400">Pick a professional template blueprint layout. It governs structural grid behaviors, text sizes, and margins.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left" id="templates-onboarding-grid">
                    {WEB_TEMPLATES.map((tpl) => {
                      const isSelected = selectedTemplate.id === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl)}
                          className={`group rounded-2xl border bg-zinc-950 overflow-hidden cursor-pointer transition-all duration-300 flex flex-col ${
                            isSelected
                              ? "border-mint ring-1 ring-mint shadow-[0_12px_40px_rgba(0,245,160,0.15)]"
                              : "border-zinc-800/80 hover:border-zinc-700"
                          }`}
                          id={`tpl-card-${tpl.id}`}
                        >
                          <div className="relative aspect-video w-full overflow-hidden border-b border-zinc-900 bg-zinc-900">
                            <img
                              src={tpl.image}
                              alt={tpl.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            
                            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                              {tpl.tags.map((tag, idx) => (
                                <span key={idx} className="bg-black/75 text-zinc-300 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-zinc-800/80">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {isSelected && (
                              <div className="absolute bottom-3 right-3 bg-mint text-black px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <LucideIcon name="Check" className="w-3.5 h-3.5 stroke-[3]" />
                                Active Blueprint
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="text-base font-bold text-white font-display mb-1">{tpl.name}</h4>
                              <p className="text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Framework: Pure React v19</span>
                              <span className="text-xs font-semibold text-zinc-300 group-hover:text-mint flex items-center gap-1">
                                Click to apply Layout
                                <LucideIcon name="ArrowRight" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT PALETTE THEME */}
              {currentStep === 4 && (
                <div className="space-y-6" id="step-4-theme">
                  <div className="border-b border-zinc-900 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white font-display">Step 4: Premium Color Theme</h3>
                    <p className="text-xs text-zinc-400">Instantly bind color palette schemes. Changes are compiled into layout CSS variables immediately.</p>
                  </div>

                  <div className="space-y-4" id="themes-onboarding-stack">
                    {THEME_PALETTES.map((pal) => {
                      const isSelected = selectedTheme.id === pal.id;
                      return (
                        <div
                          key={pal.id}
                          onClick={() => setSelectedTheme(pal)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                            isSelected
                              ? "bg-zinc-900 border-zinc-700 ring-1 ring-zinc-700 shadow-xl"
                              : "bg-zinc-950 border-zinc-850 hover:bg-zinc-900/40 hover:border-zinc-800"
                          }`}
                          id={`theme-card-${pal.id}`}
                        >
                          <div className="flex items-center gap-4 text-left">
                            {/* Color preview orb */}
                            <div className="flex gap-1.5 p-1 bg-zinc-950 border border-zinc-850 rounded-xl">
                              <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: pal.primary }} />
                              <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: pal.secondary }} />
                              <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: pal.bg }} />
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white font-display">{pal.name}</h4>
                              <p className="text-xs text-zinc-400">Accent elements mapped to {pal.primary}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono uppercase bg-zinc-950 border border-zinc-850 text-zinc-400 px-2 py-1 rounded">
                              HEX: {pal.primary} • {pal.secondary}
                            </span>
                            
                            <div 
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? "bg-white border-white text-black" : "border-zinc-700"
                              }`}
                            >
                              {isSelected && <LucideIcon name="Check" className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: LIVE INTERACTIVE PREVIEW */}
              {currentStep === 5 && (
                <div className="space-y-6" id="step-5-preview">
                  <div className="border-b border-zinc-900 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white font-display">Step 5: Dynamic Core Live Preview</h3>
                      <p className="text-xs text-zinc-400">Verify layout, categories, narratives, and color styling before submitting compilation orders.</p>
                    </div>

                    {/* Viewport controls */}
                    <div className="flex bg-zinc-900 p-1 rounded-xl self-start sm:self-center" id="preview-viewport-controls">
                      <button
                        onClick={() => setPreviewMode("desktop")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          previewMode === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                        id="btn-viewport-desktop"
                      >
                        <LucideIcon name="Monitor" className="w-3.5 h-3.5" />
                        Desktop View
                      </button>
                      <button
                        onClick={() => setPreviewMode("mobile")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          previewMode === "mobile" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                        id="btn-viewport-mobile"
                      >
                        <LucideIcon name="Smartphone" className="w-3.5 h-3.5" />
                        Mobile View
                      </button>
                    </div>
                  </div>

                  {/* Browser Window mockup showcasing customized state! */}
                  <div className="flex flex-col items-center w-full" id="onboarding-browser-mockup">
                    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden flex flex-col" style={{ minHeight: "440px" }}>
                      
                      {/* Browser header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-b border-zinc-850">
                        <div className="flex gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/60" />
                          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                          <span className="w-3 h-3 rounded-full bg-green-500/60" />
                        </div>
                        <div className="flex-grow max-w-md mx-6">
                          <div className="bg-zinc-950 border border-zinc-850 rounded-lg py-1 text-[11px] font-mono text-zinc-500 flex items-center justify-center gap-1.5">
                            <LucideIcon name="Shield" className="w-3.5 h-3.5 text-emerald-500" />
                            {businessName.toLowerCase().replace(/[^a-z0-9]/g, "") || "custom"}.sitemint.app
                          </div>
                        </div>
                        <div className="w-16" /> {/* Spacer */}
                      </div>

                      {/* Browser Content */}
                      <div className="flex-grow bg-[#09090B] p-0 flex items-center justify-center relative overflow-y-auto">
                        
                        {/* Interactive site container */}
                        <div 
                          className={`w-full h-full transition-all duration-500 flex flex-col bg-[#09090B] overflow-x-hidden p-6 text-left ${
                            previewMode === "mobile" ? "max-w-[340px] border-x border-zinc-900 shadow-2xl" : "max-w-full"
                          }`}
                          style={{ minHeight: "360px" }}
                        >
                          {/* Navigation */}
                          <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                            <span className="text-base font-bold tracking-tight font-display text-white">
                              {businessName || "Your Brand"}
                            </span>
                            <span 
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                              style={{ 
                                color: selectedTheme.primary, 
                                borderColor: `${selectedTheme.primary}40`,
                                backgroundColor: `${selectedTheme.primary}10` 
                              }}
                            >
                              {selectedCategory.label}
                            </span>
                          </div>

                          {/* Hero Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                              <h4 className="text-xl md:text-2xl font-extrabold text-white font-display leading-tight">
                                {tagline || "Your high impact brand statement goes right here"}
                              </h4>
                              
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                {description || "Tell clients why you stand out. This section automatically populates with your onboarding business biography."}
                              </p>

                              {/* Action Buttons mapping the chosen theme! */}
                              <div className="flex flex-wrap gap-2.5 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewInteractedItem("booking")}
                                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                                  style={{
                                    background: `linear-gradient(135deg, ${selectedTheme.primary}, ${selectedTheme.secondary})`
                                  }}
                                >
                                  Book Appointment Now
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewInteractedItem("contact")}
                                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white hover:border-zinc-750 transition-all"
                                >
                                  Inquire Info
                                </button>
                              </div>
                            </div>

                            {/* Image Showcase */}
                            <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-square border border-zinc-900 bg-zinc-950">
                              <img
                                src={selectedTemplate.image}
                                alt={selectedTemplate.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent" />
                            </div>
                          </div>

                          {/* Booking system interactive card depending on category */}
                          <div className="mt-8 pt-6 border-t border-zinc-900">
                            <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                              Interactive Interactive Portal
                            </h5>

                            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-left">
                                <LucideIcon name="Calendar" className="w-4 h-4 mb-2" style={{ color: selectedTheme.primary }} />
                                <p className="text-xs font-bold text-white">Live Calendar</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Real-time scheduling active</p>
                              </div>
                              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-left">
                                <LucideIcon name="CreditCard" className="w-4 h-4 mb-2" style={{ color: selectedTheme.primary }} />
                                <p className="text-xs font-bold text-white">Direct Checkout</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">No platform transaction fees</p>
                              </div>
                              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-left">
                                <LucideIcon name="MapPin" className="w-4 h-4 mb-2" style={{ color: selectedTheme.primary }} />
                                <p className="text-xs font-bold text-white">Location Hub</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{address}</p>
                              </div>
                            </div>
                          </div>

                          {/* Interactive modal callback previewer */}
                          <AnimatePresence>
                            {previewInteractedItem && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-4 bg-black/95 backdrop-blur-md rounded-xl p-6 flex flex-col justify-between border border-zinc-800 text-center"
                                id="interacted-modal"
                              >
                                <div className="space-y-3 mt-4">
                                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-zinc-900 text-white">
                                    <LucideIcon name={previewInteractedItem === "booking" ? "Calendar" : "MailCheck"} className="w-6 h-6" style={{ color: selectedTheme.primary }} />
                                  </div>
                                  <h4 className="text-base font-bold text-white">
                                    {previewInteractedItem === "booking" ? "Mock Booking Schedule Portal" : "Mock Inquiry Submission"}
                                  </h4>
                                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                                    {previewInteractedItem === "booking" 
                                      ? `This demonstrates how ${businessName} clients book calendar days under the selected ${selectedTemplate.name} layout.`
                                      : `Clients submit directly to ${userEmail} instantly via integrated contact pipelines.`
                                    }
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPreviewInteractedItem(null)}
                                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-xs font-bold text-white rounded-lg border border-zinc-800 mt-4"
                                >
                                  Close Demo Overlay
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PUBLISH & DEPLOY COMPILATION CONSOLE */}
              {currentStep === 6 && (
                <div className="space-y-6" id="step-6-publish">
                  
                  {/* Console loading state */}
                  {!isPublished ? (
                    <div className="space-y-6 text-left" id="compiling-console">
                      <div className="border-b border-zinc-900 pb-4 mb-4">
                        <h3 className="text-lg font-bold text-white font-display">Step 6: Dynamic Compilation Engine</h3>
                        <p className="text-xs text-zinc-400">Our compiler is translating template assets, CSS color structures, and mapping subdomains.</p>
                      </div>

                      {/* Progress loading percentage bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">MINT COMPILATION INDEX:</span>
                          <span className="text-mint font-bold animate-pulse">{compilationProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300" 
                            style={{ width: `${compilationProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* High-Tech black terminal console */}
                      <div className="bg-[#020204] border border-zinc-850/80 rounded-xl p-4 font-mono text-[11px] text-zinc-400 h-64 overflow-y-auto space-y-2 select-all shadow-inner">
                        {compilationLogs.map((log, idx) => {
                          const isSuccessLog = log.includes("Successfully") || log.includes("Complete");
                          return (
                            <div key={idx} className="flex gap-2">
                              <span className="text-zinc-600">[{idx + 1}]</span>
                              <span className={isSuccessLog ? "text-mint font-semibold" : "text-zinc-300"}>{log}</span>
                            </div>
                          );
                        })}
                        <div className="animate-pulse inline-block w-2 h-3.5 bg-mint ml-1" />
                      </div>
                    </div>
                  ) : (
                    /* DEPLOY SUCCESS DASHBOARD */
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-center py-6 space-y-6" 
                      id="deploy-success-dashboard"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 glow-mint shadow-xl">
                        <LucideIcon name="Rocket" className="w-10 h-10" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white font-display">Your Website is Minted Live!</h3>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto">
                          Our compiler finished building. Your storefront is deployed on edge networks with fully qualified SSL mapping.
                        </p>
                      </div>

                      {/* Deployed Custom URL Card */}
                      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">LIVE PRODUCTION LINK</p>
                          <a 
                            href={`https://${businessName.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourbrand"}.sitemint.app`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-bold text-mint hover:underline font-mono"
                          >
                            {businessName.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourbrand"}.sitemint.app
                          </a>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${businessName.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourbrand"}.sitemint.app`);
                            alert("Copied custom domain path to clipboard!");
                          }}
                          className="bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <LucideIcon name="Copy" className="w-3.5 h-3.5" />
                          Copy Link
                        </button>
                      </div>

                      {/* Mock share matrices */}
                      <div className="max-w-lg mx-auto border-t border-zinc-900 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        
                        {/* Mock QR generator */}
                        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center gap-3">
                          <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                            {/* Simple simulated vector QR */}
                            <div className="grid grid-cols-4 gap-0.5 w-full h-full text-black">
                              {[...Array(16)].map((_, i) => (
                                <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 5 === 1 ? "bg-black" : "bg-transparent"}`} />
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white font-display">Brand QR Code</h4>
                            <p className="text-[10px] text-zinc-500">Scan to launch mobile portal booking calendar</p>
                          </div>
                        </div>

                        {/* Integration metrics */}
                        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                            <span>MINT TOKEN:</span>
                            <span className="text-emerald-400 font-bold">#SMT-2026</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1">
                            <span>SSL PROTOCOL:</span>
                            <span className="text-cyan-400 font-bold">TLS v1.3 ACT</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1">
                            <span>SERVED VIA:</span>
                            <span className="text-white font-bold">Cloudflare Edge</span>
                          </div>
                        </div>

                      </div>

                      {/* Final Complete Action Button */}
                      <div className="pt-4">
                        <button
                          onClick={handleOnboardingComplete}
                          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_30px_rgba(16,185,129,0.3)]"
                          id="btn-onboarding-finish"
                        >
                          Launch Management Station
                        </button>
                      </div>
                    </motion.div>
                  )}

                </div>
              )}

              {/* NAVIGATION ACTION BAR */}
              {currentStep < 6 && (
                <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-between items-center" id="onboarding-nav-bar">
                  <button
                    disabled={currentStep === 1}
                    onClick={handlePrev}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    id="btn-onboarding-prev"
                  >
                    <LucideIcon name="ChevronLeft" className="w-4 h-4" />
                    Previous Step
                  </button>

                  <div className="text-xs font-mono text-zinc-500">
                    Step {currentStep} of 6
                  </div>

                  <button
                    disabled={currentStep === 1 && !isStep1Valid}
                    onClick={handleNext}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mint hover:text-[#00D185] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    id="btn-onboarding-next"
                  >
                    {currentStep === 5 ? "Submit & Publish" : "Next Step"}
                    <LucideIcon name="ChevronRight" className="w-4 h-4" />
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
