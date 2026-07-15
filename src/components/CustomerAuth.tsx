import { useState } from "react";
import React from "react";
import { motion } from "motion/react";
import LucideIcon from "./LucideIcon";

interface CustomerAuthProps {
  sector: "gym" | "restaurant" | "salon";
  brandName: string;
  accentColor: string;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
}

export default function CustomerAuth({ sector, brandName, accentColor, onClose, onAuthSuccess }: CustomerAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Define thematic details based on sector
  const getThematicDetails = () => {
    switch (sector) {
      case "gym":
        return {
          bgImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80",
          tagline: "Unleash your ultimate physical limits.",
          overlayClass: "bg-gradient-to-t from-black via-zinc-950/90 to-black/40",
          fontClass: "font-display",
          welcomeTitle: "Pulse Member Arena",
        };
      case "restaurant":
        return {
          bgImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
          tagline: "Taste refined, booked with exquisite ease.",
          overlayClass: "bg-gradient-to-t from-[#0A050D] via-[#0A050D]/95 to-[#0A050D]/30",
          fontClass: "font-serif",
          welcomeTitle: "Culinary Club Portal",
        };
      case "salon":
      default:
        return {
          bgImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
          tagline: "Unlock curated style, booked instantly.",
          overlayClass: "bg-gradient-to-t from-[#090B0F] via-[#090B0F]/95 to-[#090B0F]/40",
          fontClass: "font-sans",
          welcomeTitle: "Aesthetic Salon Vault",
        };
    }
  };

  const theme = getThematicDetails();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please provide your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (!isLogin && !name) {
      setErrorMsg("Please provide your full name.");
      return;
    }
    if (!isLogin && !termsAccepted) {
      setErrorMsg("You must accept our service conditions.");
      return;
    }

    setIsSubmitting(true);

    // Simulate luxury API handshake
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(email || "guest.client@sitemint.app");
        onClose();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="customer-auth-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-auto md:h-full max-h-[90vh] md:max-h-[600px] rounded-3xl overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-zinc-800 shadow-2xl bg-[#09090B]"
        id="customer-auth-card"
      >
        {/* 1. Brand Side Banner (col-span-5) */}
        <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-8 text-left overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={theme.bgImage} alt="Brand BG" className="w-full h-full object-cover grayscale opacity-40 transition-transform duration-10000 hover:scale-110" />
            <div className={`absolute inset-0 ${theme.overlayClass}`} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className={`text-sm font-bold tracking-tight text-white ${theme.fontClass}`}>{brandName}</span>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            <h3 className={`text-2xl font-black text-white tracking-tight leading-tight ${theme.fontClass}`}>
              {theme.welcomeTitle}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {theme.tagline} Gain prioritized schedules, fast order history, and exclusive tier benefits.
            </p>
          </div>

          <div className="relative z-10 text-[10px] font-mono text-zinc-500">
            Powered securely by SiteMint Edge
          </div>
        </div>

        {/* 2. Interactive Input Forms (col-span-7) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between relative bg-[#0d0d10]" id="customer-auth-form-side">
          
          {/* Header & Close button */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              {isLogin ? "Secure Entry" : "Join Member Pool"}
            </span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
              id="btn-close-customer-auth"
            >
              <LucideIcon name="X" className="w-4 h-4" />
            </button>
          </div>

          {/* Core Success Screen */}
          {success ? (
            <div className="my-auto text-center space-y-4" id="customer-auth-success">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <LucideIcon name="Check" className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h4 className={`text-lg font-bold text-white ${theme.fontClass}`}>Verification Approved</h4>
                <p className="text-xs text-zinc-400">Synchronizing client records to active portal...</p>
              </div>
            </div>
          ) : (
            <div className="my-auto py-4" id="customer-auth-forms-container">
              <div className="text-left space-y-1.5 mb-6">
                <h2 className={`text-2xl font-bold text-white tracking-tight ${theme.fontClass}`}>
                  {isLogin ? "Welcome back" : "Create your credentials"}
                </h2>
                <p className="text-xs text-zinc-400">
                  {isLogin ? "Sign in to manage active reservations and checkout baskets." : "Sign up in 30 seconds to lock in premium access pricing."}
                </p>
              </div>

              {/* Form container */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <LucideIcon name="AlertCircle" className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-zinc-500">
                        <LucideIcon name="User" className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-zinc-500">
                      <LucideIcon name="Mail" className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Password</label>
                    {isLogin && (
                      <button type="button" className="text-[10px] font-bold text-zinc-400 hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-zinc-500">
                      <LucideIcon name="Lock" className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all"
                    />
                  </div>
                </div>

                {isLogin ? (
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
                    />
                    <label htmlFor="remember-me" className="text-xs text-zinc-400 cursor-pointer select-none">
                      Keep me signed in for 30 days
                    </label>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 py-1">
                    <input
                      type="checkbox"
                      id="terms-accepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0 mt-0.5"
                    />
                    <label htmlFor="terms-accepted" className="text-xs text-zinc-400 cursor-pointer select-none leading-tight">
                      I accept the terms of service & electronic privacy waiver forms
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                  id="btn-customer-auth-submit"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <span>{isLogin ? "Sign In Securely" : "Create Member Account"}</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Toggle Login/Register */}
          {!success && (
            <div className="text-center text-xs text-zinc-500 pt-4 border-t border-zinc-900/60" id="customer-auth-switch">
              {isLogin ? (
                <p>
                  New to {brandName}?{" "}
                  <button onClick={() => setIsLogin(false)} className="font-bold text-white hover:underline" style={{ color: accentColor }}>
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button onClick={() => setIsLogin(true)} className="font-bold text-white hover:underline" style={{ color: accentColor }}>
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
