import { useState, useRef, useEffect } from "react";
import React from "react";
import { motion } from "motion/react";
import LucideIcon from "./LucideIcon";
import Logo from "./Logo";

interface AuthScreensProps {
  currentView: "login" | "register" | "forgot-password" | "reset-password";
  onNavigate: (view: any) => void;
  onLoginSuccess: (email: string, role?: string) => void;
}

export default function AuthScreens({ currentView, onNavigate, onLoginSuccess }: AuthScreensProps) {
  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Statuses
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
    setValidationErrors({});
  }, [currentView]);

  // Autofill helpers for seamless testing inside the sandbox
  const handleUseDemo = () => {
    setEmail("adil.khan@company.com");
    setPassword("sitemint-premium-2026");
    setName("Adil Khan");
    setRememberMe(true);
    setAgreeTerms(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid credentials.");
      }

      if (result.data?.token) {
        localStorage.setItem("sitemint_token", result.data.token);
      }

      const role = result.data?.user?.role;
      onLoginSuccess(email || result.data?.user?.email || "adil.khan@company.com", role);
      if (role === "SUPER_ADMIN") {
        onNavigate("super-admin" as any);
      } else if (result.data?.user?.onboarded === false) {
        onNavigate("onboarding");
      } else {
        onNavigate("dashboard");
      }
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || "An error occurred during sign in.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setValidationErrors({});
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms & Conditions");
      return;
    }

    setIsLoading(true);

    try {
      const cleanName = name.trim();
      const emailPrefix = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      const subdomain = `${emailPrefix}-biz`;
      const businessName = `${cleanName}'s Site`;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: businessName,
          subdomain,
          contact_email: email,
          contact_phone: "",
          full_name: cleanName,
          password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        throw new Error(result.message || "Registration validation failed.");
      }

      if (result.data?.token) {
        localStorage.setItem("sitemint_token", result.data.token);
      }

      setIsLoading(false);
      onLoginSuccess(email);
      onNavigate("onboarding");
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error.message || "An error occurred during registration.");
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("A password reset link has been dispatched.");
      // Auto transition to reset-password after a brief pause so user can test the reset flow!
      setTimeout(() => {
        onNavigate("reset-password");
        setSuccessMessage("");
      }, 2000);
    }, 1200);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage("Password cannot be blank");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Password reset successfully!");
      setTimeout(() => {
        onNavigate("login");
        setSuccessMessage("");
      }, 1500);
    }, 1200);
  };

  // Visual helper of password strength
  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-zinc-800", width: "w-0" };
    if (password.length < 5) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (password.length < 8) return { label: "Medium", color: "bg-amber-400", width: "w-2/3" };
    return { label: "Strong & Safe", color: "bg-emerald-400", width: "w-full" };
  };

  const strength = getPasswordStrength();

  return (
    <div
      className="relative min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#09090B] bg-dot-grid overflow-hidden px-4"
      id="auth-container-wrapper"
    >
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Redundant back button removed for simplified distraction-free layout */}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
        id="auth-card-frame"
      >
        {/* Modern Glass Card */}
        <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl p-8 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6" id="auth-header">
            <div className="mb-2">
              <Logo className="h-24" variant="full" showText={false} />
            </div>
            
            {/* Dynamic Titles */}
            {currentView === "login" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Sign in to SiteMint</h2>
                <p className="text-xs text-zinc-400 mt-1">Enter your credentials to manage your website</p>
              </>
            )}
            {currentView === "register" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Create your account</h2>
                <p className="text-xs text-zinc-400 mt-1">Get started with your custom business website</p>
              </>
            )}
            {currentView === "forgot-password" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Reset your password</h2>
                <p className="text-xs text-zinc-400 mt-1">We will send you a secure link to reset your credentials</p>
              </>
            )}
            {currentView === "reset-password" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Set a new password</h2>
                <p className="text-xs text-zinc-400 mt-1">Ensure it is at least 8 characters for account security</p>
              </>
            )}
          </div>

          {/* Feedback states */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col gap-2 text-xs text-red-400" id="auth-error">
              <div className="flex items-center gap-2.5">
                <LucideIcon name="AlertTriangle" className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
              {Object.keys(validationErrors).length > 0 && (
                <ul className="list-disc pl-5 mt-1 space-y-1 text-[11px] text-red-400 font-medium text-left">
                  {Object.entries(validationErrors).map(([field, msg]) => (
                    <li key={field}>
                      <span className="capitalize font-semibold">{field.replace("_", " ")}</span>: {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400" id="auth-success">
              <LucideIcon name="CheckCircle" className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Forms switcher */}
          {currentView === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5" id="form-login">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Mail" className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => onNavigate("forgot-password")}
                    className="text-xs font-semibold text-mint hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Lock" className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-mint rounded border-zinc-800 bg-zinc-900 w-4 h-4"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit and demo helper */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <LucideIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <LucideIcon name="LogIn" className="w-4 h-4" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-mint to-cyan transition-transform duration-300 -z-10" />
              </button>



              <p className="text-center text-xs text-zinc-400 mt-6 pt-4 border-t border-zinc-900/60">
                New to the platform?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("register")}
                  className="font-bold text-mint hover:underline"
                >
                  Create free account
                </button>
              </p>
            </form>
          )}

          {currentView === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" id="form-register">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="User" className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
                {(validationErrors.full_name || validationErrors.name) && (
                  <p className="text-[11px] text-red-400 mt-1 pl-1 text-left">
                    {validationErrors.full_name || validationErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Mail" className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya.sharma@company.com"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
                {validationErrors.contact_email && (
                  <p className="text-[11px] text-red-400 mt-1 pl-1 text-left">
                    {validationErrors.contact_email}
                  </p>
                )}
                {validationErrors.subdomain && (
                  <p className="text-[11px] text-red-400 mt-1 pl-1 text-left">
                    Subdomain Error: {validationErrors.subdomain}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <LucideIcon name="Lock" className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                    />
                  </div>
                  {validationErrors.password && (
                    <p className="text-[11px] text-red-400 mt-1 pl-1 text-left">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <LucideIcon name="Lock" className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password strength guide */}
              {password && (
                <div className="space-y-1.5 pt-1 text-left">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>Password strength:</span>
                    <span className="text-zinc-300 font-bold">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                </div>
              )}

              <div className="pt-2 text-left">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-mint rounded border-zinc-800 bg-zinc-900 w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span>
                    I agree to SiteMint's{" "}
                    <span className="text-mint hover:underline cursor-pointer">Terms of Service</span> and{" "}
                    <span className="text-mint hover:underline cursor-pointer">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <LucideIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <LucideIcon name="UserPlus" className="w-4 h-4" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-mint to-cyan transition-transform duration-300 -z-10" />
              </button>

              <p className="text-center text-xs text-zinc-400 mt-6 pt-4 border-t border-zinc-900/60">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="font-bold text-mint hover:underline"
                >
                  Log In
                </button>
              </p>
            </form>
          )}

          {currentView === "forgot-password" && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5" id="form-forgot">
              <div className="text-left space-y-1">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Mail" className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <LucideIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <LucideIcon name="Key" className="w-4 h-4" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-mint to-cyan transition-transform duration-300 -z-10" />
              </button>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <LucideIcon name="ArrowLeft" className="w-3.5 h-3.5" />
                  Back to Log In
                </button>
              </div>
            </form>
          )}

          {currentView === "reset-password" && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4" id="form-reset-pw">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Lock" className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Lock" className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
                  />
                </div>
              </div>

              {/* Password strength */}
              {password && (
                <div className="space-y-1.5 pt-1 text-left">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>Robustness:</span>
                    <span className="text-zinc-300 font-bold">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <LucideIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <LucideIcon name="ShieldAlert" className="w-4 h-4" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-mint to-cyan transition-transform duration-300 -z-10" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
