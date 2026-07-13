import React, { useState } from "react";
import { motion } from "motion/react";
import LucideIcon from "./LucideIcon";

interface ErrorPageProps {
  code: 404 | 403 | 500;
  theme: "dark" | "light";
  onGoBack: () => void;
  onSimulateAction?: () => void;
}

export default function ErrorPages({ code, theme, onGoBack, onSimulateAction }: ErrorPageProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [fixedMessage, setFixedMessage] = useState("");

  const handleFixError = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setFixedMessage("System recovered! DNS records synchronizing.");
      if (onSimulateAction) {
        onSimulateAction();
      }
    }, 2000);
  };

  const getErrorDetails = () => {
    switch (code) {
      case 403:
        return {
          title: "Access Restricted",
          subtitle: "Forbidden Credentials Detected",
          description: "Your local minting key does not have read-access to the requested cloud SSL container. Access was closed by the gatekeeper server.",
          icon: "ShieldAlert",
          accentClass: "text-amber-400 border-amber-400/20 bg-amber-400/10",
          actionLabel: "Verify Certificate Keys",
        };
      case 500:
        return {
          title: "Internal Minting Error",
          subtitle: "SaaS Compiler Out of Bounds",
          description: "The background compiler hit an unhandled React layout node exception during site construction. Server logs printed to the dashboard terminal.",
          icon: "FileX2",
          accentClass: "text-rose-400 border-rose-400/20 bg-rose-400/10",
          actionLabel: "Hot-Reload Dev Server",
        };
      case 404:
      default:
        return {
          title: "Minting Node Lost",
          subtitle: "Target Sub-URL Not Found",
          description: "The digital address you are trying to lookup doesn't exist on the SiteMint global CDN network. It might have been burned or un-minted.",
          icon: "SearchX",
          accentClass: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10",
          actionLabel: "Scan Active Domains",
        };
    }
  };

  const details = getErrorDetails();
  const isDark = theme === "dark";

  return (
    <div 
      className={`min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none ${
        isDark ? "bg-[#09090B] text-zinc-100" : "bg-zinc-50 text-zinc-900"
      }`}
      id={`error-page-${code}`}
    >
      <div className="max-w-lg w-full relative space-y-8">
        {/* Animated Radial Backdrop Glow */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none opacity-10`}
          style={{ 
            backgroundColor: code === 403 ? "#F59E0B" : code === 500 ? "#F43F5E" : "#00F5A0" 
          }}
        />

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <div className={`p-4 rounded-2xl border-2 flex items-center justify-center ${details.accentClass} shadow-lg animate-pulse`}>
            <LucideIcon name={details.icon} className="w-10 h-10" />
          </div>
          <span className="text-sm font-mono tracking-widest text-zinc-500 uppercase font-bold mt-2">
            Status Code: {code} • CRITICAL NOTICE
          </span>
        </motion.div>

        {/* Text Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-3 relative z-10"
        >
          <h2 className={`text-4xl font-extrabold tracking-tight font-display ${isDark ? "text-white" : "text-zinc-950"}`}>
            {details.title}
          </h2>
          <p className="text-xs font-mono tracking-wider text-emerald-400 uppercase font-bold">
            {details.subtitle}
          </p>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"} max-w-md mx-auto leading-relaxed font-sans`}>
            {details.description}
          </p>
        </motion.div>

        {/* Re-minting Simulator Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-5 rounded-2xl border ${
            isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          } text-left relative z-10`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg border ${details.accentClass}`}>
              <LucideIcon name="Settings" className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-grow">
              <span className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                Auto-Recovery Diagnostic Tool
              </span>
              <p className="text-[11px] text-zinc-500">
                You can trigger a mock sandbox diagnostic script below to auto-recover this specific routing node state.
              </p>

              {fixedMessage ? (
                <div className="text-xs text-emerald-400 font-semibold font-mono flex items-center gap-1.5 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  <LucideIcon name="CheckCircle" className="w-3.5 h-3.5 shrink-0" />
                  {fixedMessage}
                </div>
              ) : (
                <button
                  onClick={handleFixError}
                  disabled={isFixing}
                  className="mt-3.5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isFixing ? (
                    <>
                      <LucideIcon name="RefreshCw" className="w-3.5 h-3.5 animate-spin" />
                      Re-routing & Repairing...
                    </>
                  ) : (
                    <>
                      <LucideIcon name="Activity" className="w-3.5 h-3.5" />
                      {details.actionLabel}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 relative z-10"
        >
          <button
            onClick={onGoBack}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
          >
            ← Back to Hub Homepage
          </button>
        </motion.div>
      </div>
    </div>
  );
}
