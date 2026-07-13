import { useState, useEffect } from "react";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import Logo from "./Logo";
import LucideIcon from "./LucideIcon";
import NotificationPanel from "./NotificationPanel";

interface NavbarProps {
  onOpenCheckout: (planId?: string) => void;
  onNavigate: (view: any) => void;
  currentView: any;
  userEmail: string;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  notificationOpen: boolean;
  onToggleNotifications: () => void;
}

export default function Navbar({
  onOpenCheckout,
  onNavigate,
  currentView,
  userEmail,
  onLogout,
  theme,
  onToggleTheme,
  onOpenSearch,
  notificationOpen,
  onToggleNotifications,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Categories", href: "#categories" },
    { name: "Why SiteMint", href: "#why-sitemint" },
    { name: "Templates", href: "#templates" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate("landing");
  };

  const isDark = theme === "dark";

  const isAuthView = [
    "login",
    "register",
    "forgot-password",
    "reset-password"
  ].includes(currentView);

  if (isAuthView) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#09090B]/85 backdrop-blur-md border-b border-white/[0.06] py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        id="sitemint-auth-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" id="auth-navbar-container">
            {/* Logo */}
            <button 
              onClick={handleLogoClick} 
              className="flex items-center cursor-pointer bg-transparent border-none p-0 focus:outline-none hover:opacity-90 active:scale-95 transition-all duration-200" 
              id="auth-nav-logo-link"
              aria-label="SiteMint Home"
            >
              <Logo theme="dark" />
            </button>

            {/* Back to Home & Sign In / Register toggle */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => onNavigate("landing")}
                className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                id="auth-nav-back-home"
              >
                <LucideIcon name="ArrowLeft" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </button>
              
              <span className="h-4 w-px bg-zinc-800" />

              {currentView === "register" ? (
                <button
                  onClick={() => onNavigate("login")}
                  className="text-xs sm:text-sm font-semibold text-mint hover:text-mint-hover transition-colors"
                  id="auth-nav-signin-toggle"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => onNavigate("register")}
                  className="text-xs sm:text-sm font-semibold text-mint hover:text-mint-hover transition-colors"
                  id="auth-nav-register-toggle"
                >
                  Register
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? isDark
            ? "bg-[#09090B]/85 backdrop-blur-xl border-b border-white/[0.06] py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]" 
            : "bg-white/90 backdrop-blur-xl border-b border-zinc-200 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
          : "bg-transparent py-6 border-b border-transparent"
      }`}
      id="sitemint-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" id="navbar-container">
          {/* Logo */}
          <button 
            onClick={handleLogoClick} 
            className="flex items-center cursor-pointer bg-transparent border-none p-0 focus:outline-none hover:opacity-90 active:scale-95 transition-all duration-200" 
            id="nav-logo-link"
            aria-label="SiteMint Home"
          >
            <Logo theme={theme} />
          </button>

          {/* Desktop Navigation - only show if on landing page */}
          {currentView === "landing" ? (
            <nav className="hidden md:flex items-center gap-8" id="desktop-nav" aria-label="Primary Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 relative group py-1 ${
                    isDark 
                      ? "text-zinc-400 hover:text-white" 
                      : "text-zinc-600 hover:text-zinc-950 font-medium"
                  }`}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-mint to-cyan-400 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6" id="desktop-nav-short" aria-label="Short Navigation">
              <button
                onClick={() => onNavigate("landing")}
                className={`text-sm font-medium transition-colors ${
                  isDark ? "text-zinc-400 hover:text-white" : "text-zinc-550 hover:text-zinc-950 font-medium"
                }`}
                id="short-nav-home"
              >
                Home
              </button>
              <span className={isDark ? "text-zinc-850" : "text-zinc-300"}>/</span>
              <span className="text-sm font-bold text-mint font-display capitalize">
                {String(currentView).replace("-", " ")}
              </span>
            </nav>
          )}

          {/* Call to Actions / User Profile Section */}
          <div className="hidden md:flex items-center gap-3 relative" id="nav-ctas">
            {/* Utility Actions (Search, Theme, Notifications) */}
            {currentView !== "landing" && (
              <div className="flex items-center gap-1 bg-zinc-900/40 dark:bg-zinc-900/30 p-1.5 rounded-2xl border border-white/[0.04] dark:border-white/[0.06] mr-1">
                {/* Command Palette Trigger */}
                <button
                  onClick={onOpenSearch}
                  className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    theme === "dark"
                      ? "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                  title="Search / Command Palette (Cmd+K)"
                  aria-label="Open Command Palette"
                >
                  <LucideIcon name="Search" className="w-4.5 h-4.5" />
                </button>

                {/* Theme Toggle Trigger */}
                <button
                  onClick={onToggleTheme}
                  className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    theme === "dark"
                      ? "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                  title={`Toggle ${theme === "dark" ? "Light" : "Dark"} Mode`}
                  aria-label="Toggle Theme"
                >
                  <LucideIcon name={theme === "dark" ? "Sun" : "Moon"} className="w-4.5 h-4.5" />
                </button>

                {/* Notifications Toggle Trigger */}
                <div className="relative">
                  <button
                    onClick={onToggleNotifications}
                    className={`p-2 rounded-xl transition-all duration-200 cursor-pointer relative ${
                      theme === "dark"
                        ? "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                        : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                    }`}
                    title="Notifications panel"
                    aria-label="Toggle Notifications Feed"
                  >
                    <LucideIcon name="Bell" className="w-4.5 h-4.5" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  </button>

                  {/* Notifications Dropdown Panel */}
                  <NotificationPanel
                    isOpen={notificationOpen}
                    onClose={onToggleNotifications}
                    theme={theme}
                  />
                </div>
              </div>
            )}

            {userEmail ? (
              /* Premium logged in profile dropdown button */
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all focus:outline-none focus:ring-1 focus:ring-mint ${
                    theme === "dark"
                      ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-white"
                      : "border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-900"
                  }`}
                  id="btn-profile-dropdown"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-black flex items-center justify-center text-xs font-black shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                    {userEmail.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{userEmail}</span>
                  <LucideIcon name="ChevronDown" className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl backdrop-blur-2xl z-50 text-left ${
                        theme === "dark"
                          ? "border-white/[0.08] bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-900"
                      }`}
                      id="profile-dropdown-content"
                    >
                      <div className={`px-3 py-2 border-b mb-1 ${theme === "dark" ? "border-zinc-900" : "border-zinc-100"}`}>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">AUTHENTICATED IDENTITY</p>
                        <p className={`text-xs font-semibold truncate mt-0.5 ${theme === "dark" ? "text-zinc-300" : "text-zinc-800"}`}>{userEmail}</p>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate("dashboard");
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
                          theme === "dark" ? "text-zinc-300 hover:text-white hover:bg-zinc-900" : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50"
                        }`}
                        id="btn-nav-dashboard"
                      >
                        <LucideIcon name="LayoutDashboard" className="w-4 h-4 text-emerald-400" />
                        Owner Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate("onboarding");
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all text-left ${
                          theme === "dark" ? "text-zinc-300 hover:text-white hover:bg-zinc-900" : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50"
                        }`}
                      >
                        <LucideIcon name="Layers" className="w-4 h-4 text-zinc-500" />
                        Onboarding Flow
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg transition-all text-left mt-1 border-t ${
                          theme === "dark"
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border-zinc-900"
                            : "text-red-600 hover:text-red-500 hover:bg-red-50 border-zinc-100"
                        }`}
                        id="btn-dropdown-logout"
                      >
                        <LucideIcon name="LogOut" className="w-4 h-4" />
                        Log Out Credentials
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Non logged-in CTA pair */
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className={`text-sm font-semibold transition-all duration-200 cursor-pointer py-2 px-3 rounded-lg hover:bg-white/[0.03] active:scale-95 ${
                    theme === "dark" ? "text-zinc-350 hover:text-white" : "text-zinc-650 hover:text-zinc-950"
                  }`}
                  id="btn-login-trigger"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="rounded-xl bg-mint px-5.5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_15px_rgba(16,185,129,0.2)] hover:bg-mint-hover cursor-pointer"
                  id="btn-mint-navbar"
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    Create Website
                    <LucideIcon name="ArrowRight" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center" id="mobile-menu-btn-container">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-mint rounded-lg"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              id="btn-mobile-menu-toggle"
            >
              <LucideIcon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#09090BE0] border-b border-zinc-800/80 px-4 pt-2 pb-6 absolute top-full left-0 right-0 shadow-2xl backdrop-blur-xl"
            id="mobile-nav-drawer"
          >
            <div className="flex flex-col gap-4 py-2">
              {currentView === "landing" && navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-zinc-400 hover:text-white py-2 border-b border-zinc-900 transition-colors"
                  id={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.name}
                </a>
              ))}
              
              <div className="flex flex-col gap-3 pt-4">
                {userEmail ? (
                  <>
                    <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/65 text-left mb-2">
                      <p className="text-[10px] font-bold text-zinc-500 font-mono">LOGGED IN AS</p>
                      <p className="text-xs text-zinc-300 font-bold truncate">{userEmail}</p>
                    </div>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate("dashboard");
                      }}
                      className="w-full py-2.5 rounded-xl border border-zinc-850 text-center text-sm font-bold text-black bg-mint hover:bg-mint-hover mb-2"
                      id="mobile-btn-nav-dashboard"
                    >
                      Owner Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate("onboarding");
                      }}
                      className="w-full py-2.5 rounded-xl border border-zinc-800 text-center text-sm font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-850"
                    >
                      Onboarding Flow
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20"
                    >
                      Sign Out Credentials
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate("login");
                      }}
                      className="w-full text-center text-sm font-medium text-zinc-400 hover:text-white py-2 border border-zinc-800 rounded-xl"
                      id="mobile-btn-signin"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate("register");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-mint text-black px-4 py-3 text-sm font-semibold hover:bg-mint-hover active:scale-[0.98]"
                      id="mobile-btn-mint"
                    >
                      Create Website
                      <LucideIcon name="ArrowRight" className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
