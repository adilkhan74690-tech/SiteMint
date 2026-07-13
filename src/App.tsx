import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import WhySiteMint from "./components/WhySiteMint";
import TemplateShowcase from "./components/TemplateShowcase";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import CheckoutModal from "./components/CheckoutModal";
import Logo from "./components/Logo";
import AuthScreens from "./components/AuthScreens";
import OnboardingFlow from "./components/OnboardingFlow";
import OwnerDashboard from "./components/OwnerDashboard";
import GymTemplate from "./components/GymTemplate";
import RestaurantTemplate from "./components/RestaurantTemplate";
import SalonTemplate from "./components/SalonTemplate";
import SearchAndCommandPalette from "./components/SearchAndCommandPalette";
import ErrorPages from "./components/ErrorPages";
import LucideIcon from "./components/LucideIcon";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("pro");

  // Dynamic Router States
  const [currentView, setCurrentView] = useState<
    "landing" | "login" | "register" | "forgot-password" | "reset-password" | "onboarding" | "dashboard" | "preview-gym" | "preview-restaurant" | "preview-salon" | "preview-404" | "preview-403" | "preview-500"
  >("landing");
  const [userEmail, setUserEmail] = useState("");

  // Theme support: default to dark
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("sitemint-theme");
    return (saved === "light" ? "light" : "dark") as "dark" | "light";
  });

  // UI state overlays
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [skeletonDemoActive, setSkeletonDemoActive] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);

  // Sync theme changes with document body elements
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("sitemint-theme", theme);
  }, [theme]);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Simulation loader triggers
  const handleSimulateLoader = () => {
    setLoading(true);
    setFabExpanded(false);
    setTimeout(() => {
      setLoading(false);
    }, 1600);
  };

  // Premium initial brand fade loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenCheckout = (planId?: string) => {
    if (planId) {
      setSelectedPlanId(planId);
    }
    
    // Smart user redirection: if they are already logged in, take them straight to onboarding.
    // If not, take them to the beautiful register page.
    if (userEmail) {
      setCurrentView("onboarding");
    } else {
      setCurrentView("register");
    }
  };

  const handleNavigate = (view: typeof currentView) => {
    setCurrentView(view);
    // Scroll window to top on transitions
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
  };

  const handleLogout = () => {
    setUserEmail("");
    setCurrentView("landing");
  };

  const isDark = theme === "dark";

  return (
    <div 
      className={`selection:bg-mint selection:text-black min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? "bg-[#09090B] text-white" : "bg-zinc-50 text-zinc-900"
      }`} 
      id="sitemint-app-root"
    >
      
      {/* 1. Loading Screen with Pulse */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[125] bg-[#09090B] flex flex-col items-center justify-center text-center"
            id="loading-screen"
          >
            <div className="relative flex flex-col items-center gap-4">
              <div className="absolute inset-[-40px] w-[180px] h-[180px] rounded-full bg-mint/5 blur-2xl animate-pulse pointer-events-none" />
              <Logo className="h-36 mb-1" imgClassName="h-36 object-contain" variant="full" showText={false} theme="dark" />
              
              <div className="space-y-1.5 mt-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 animate-pulse">
                  Minting Digital Presence...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Layout Router (visible once loader completes) */}
      {!loading && (
        <div className="flex flex-col min-h-screen relative" id="main-app-layout">
          {/* Universal Glass Navbar */}
          {currentView !== "dashboard" && 
           currentView !== "preview-gym" && 
           currentView !== "preview-restaurant" && 
           currentView !== "preview-salon" && 
           currentView !== "preview-404" && 
           currentView !== "preview-403" && 
           currentView !== "preview-500" && (
            <Navbar 
              onOpenCheckout={handleOpenCheckout} 
              onNavigate={handleNavigate}
              currentView={currentView}
              userEmail={userEmail}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onOpenSearch={() => setCommandPaletteOpen(true)}
              notificationOpen={notificationOpen}
              onToggleNotifications={() => setNotificationOpen(!notificationOpen)}
            />
          )}

          <AnimatePresence mode="wait">
            {/* Render matched page */}
            {currentView === "landing" && (
              <motion.div
                key="landing-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Hero section */}
                <Hero onOpenCheckout={handleOpenCheckout} />

                {/* Business Categories Grid */}
                <Categories onSelectCategory={() => handleOpenCheckout("pro")} />

                {/* Brand Comparison Module */}
                <WhySiteMint />

                {/* Interactive Live Template Showcase */}
                <TemplateShowcase 
                  onOpenCheckout={handleOpenCheckout} 
                  onNavigateToDemo={(demoId) => handleNavigate(demoId as any)}
                />

                {/* How It Works onboarding guide */}
                <HowItWorks />

                {/* Detailed Features matrix */}
                <Features />

                {/* Client Testimonials Carousel */}
                <Testimonials />

                {/* Flexible Pricing Tiers */}
                <Pricing onOpenCheckout={handleOpenCheckout} />

                {/* Accordion FAQ Grid */}
                <FAQ />

                {/* Premium Site Footer */}
                <Footer />
              </motion.div>
            )}

            {/* Authentication Screens layout */}
            {(currentView === "login" ||
              currentView === "register" ||
              currentView === "forgot-password" ||
              currentView === "reset-password") && (
              <motion.div
                key="auth-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.3 }}
              >
                <AuthScreens
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  onLoginSuccess={handleLoginSuccess}
                />
              </motion.div>
            )}

            {/* Premium Onboarding Flow layout */}
            {currentView === "onboarding" && (
              <motion.div
                key="onboarding-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <OnboardingFlow
                  userEmail={userEmail || "founder@vanguard.co"}
                  onComplete={() => {
                    // Redirect straight to their shiny new owner dashboard!
                    handleNavigate("dashboard");
                  }}
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}

            {/* Premium Owner Dashboard layout */}
            {currentView === "dashboard" && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col flex-grow"
              >
                <OwnerDashboard
                  userEmail={userEmail || "founder@vanguard.co"}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}

            {/* Gym Independent Live Template */}
            {currentView === "preview-gym" && (
              <motion.div
                key="preview-gym-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-grow"
              >
                <GymTemplate 
                  onBackToHub={() => handleNavigate("landing")}
                />
              </motion.div>
            )}

            {/* Restaurant Independent Live Template */}
            {currentView === "preview-restaurant" && (
              <motion.div
                key="preview-restaurant-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-grow"
              >
                <RestaurantTemplate 
                  onBackToHub={() => handleNavigate("landing")}
                />
              </motion.div>
            )}

            {/* Salon Independent Live Template */}
            {currentView === "preview-salon" && (
              <motion.div
                key="preview-salon-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-grow"
              >
                <SalonTemplate 
                  onBackToHub={() => handleNavigate("landing")}
                />
              </motion.div>
            )}

            {/* Custom Error Pages */}
            {currentView === "preview-404" && (
              <motion.div
                key="preview-404-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-grow"
              >
                <ErrorPages
                  code={404}
                  theme={theme}
                  onGoBack={() => handleNavigate("landing")}
                />
              </motion.div>
            )}

            {currentView === "preview-403" && (
              <motion.div
                key="preview-403-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-grow"
              >
                <ErrorPages
                  code={403}
                  theme={theme}
                  onGoBack={() => handleNavigate("landing")}
                />
              </motion.div>
            )}

            {currentView === "preview-500" && (
              <motion.div
                key="preview-500-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-grow"
              >
                <ErrorPages
                  code={500}
                  theme={theme}
                  onGoBack={() => handleNavigate("landing")}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Checkout Configurer / Drawer */}
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            selectedPlanId={selectedPlanId}
          />

          {/* Global Search and Command Palette */}
          <SearchAndCommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            theme={theme}
            onNavigate={handleNavigate}
            onToggleTheme={handleToggleTheme}
            onSimulateLoader={handleSimulateLoader}
            onTriggerError={(code) => handleNavigate(`preview-${code}` as any)}
          />

          {/* Mobile Bottom Navigation Bar (Visible on mobile screens) */}
          {currentView !== "landing" && 
           !["login", "register", "forgot-password", "reset-password"].includes(currentView) && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090B]/90 backdrop-blur-lg border-t border-white/[0.08] px-6 py-2.5 flex items-center justify-between shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
              <button
                onClick={() => handleNavigate("landing")}
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer ${
                  currentView === "landing" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-label="Home page"
              >
                <LucideIcon name="Home" className="w-5 h-5" />
                <span className="text-[10px] font-medium font-mono">Home</span>
              </button>
              
              <button
                onClick={() => {
                  if (userEmail) {
                    handleNavigate("dashboard");
                  } else {
                    handleNavigate("register");
                  }
                }}
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer ${
                  currentView === "dashboard" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-label="Owner dashboard"
              >
                <LucideIcon name="LayoutDashboard" className="w-5 h-5" />
                <span className="text-[10px] font-medium font-mono">Console</span>
              </button>

              {/* Spacer to give room to floating action button */}
              <div className="w-10 h-10" />

              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex flex-col items-center gap-1 bg-transparent border-none text-zinc-500 hover:text-zinc-300 cursor-pointer"
                aria-label="Open search command palette"
              >
                <LucideIcon name="Command" className="w-5 h-5" />
                <span className="text-[10px] font-medium font-mono">Search</span>
              </button>

              <button
                onClick={() => handleNavigate("preview-gym")}
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer ${
                  currentView === "preview-gym" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-label="Templates showcase"
              >
                <LucideIcon name="LayoutGrid" className="w-5 h-5" />
                <span className="text-[10px] font-medium font-mono">Templates</span>
              </button>
            </div>
          )}

          {/* Mobile Floating Action Button (FAB) Speed Dial */}
          {currentView !== "landing" && 
           !["login", "register", "forgot-password", "reset-password"].includes(currentView) && (
            <div className="md:hidden fixed bottom-18 left-1/2 -translate-x-1/2 z-55 flex flex-col items-center gap-3">
              <AnimatePresence>
                {fabExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.8 }}
                    className="flex flex-row items-center gap-2 bg-zinc-950 border border-white/[0.08] p-1.5 rounded-full shadow-2xl backdrop-blur-xl"
                  >
                    <button
                      onClick={handleToggleTheme}
                      className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                      title="Toggle Theme"
                    >
                      <LucideIcon name={theme === "dark" ? "Sun" : "Moon"} className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCommandPaletteOpen(true);
                        setFabExpanded(false);
                      }}
                      className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                      title="Search Commands"
                    >
                      <LucideIcon name="Search" className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={handleSimulateLoader}
                      className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer"
                      title="Simulate Reload"
                    >
                      <LucideIcon name="RefreshCw" className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => {
                        setNotificationOpen(!notificationOpen);
                        setFabExpanded(false);
                      }}
                      className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-white relative cursor-pointer"
                      title="Notifications"
                    >
                      <LucideIcon name="Bell" className="w-4.5 h-4.5" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setFabExpanded(!fabExpanded)}
                className="w-13 h-13 rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(0,245,160,0.4)] active:scale-95 transition-transform border border-emerald-300/20 cursor-pointer"
                aria-label="Mobile quick actions menu"
              >
                <LucideIcon name={fabExpanded ? "X" : "Plus"} className="w-6 h-6 text-black stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
