import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import LucideIcon from "./LucideIcon";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveStatus?: string;
  onContinueShopping: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  liveStatus = "Pending Approval",
  onContinueShopping
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        id="success-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#09090B] p-6 text-white shadow-2xl flex flex-col items-center text-center space-y-6"
          id="success-modal-card"
        >
          {/* Animated Success Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            >
              <LucideIcon name="CheckCircle" className="w-9 h-9 stroke-[2]" />
            </motion.div>
            <span className="absolute -inset-1 rounded-full border border-emerald-500/10 animate-ping pointer-events-none" />
          </div>

          {/* Texts */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-white">Payment Submitted</h3>
            <p className="text-sm text-zinc-300 font-medium">
              Payment submitted successfully.
            </p>
            <p className="text-xs text-zinc-400">
              Your order is waiting for owner approval.
            </p>
            <p className="text-xs text-zinc-500 italic">
              The owner has been notified.
            </p>
          </div>

          {/* Live Tracker Box */}
          <div className="w-full p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 space-y-2.5 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 uppercase tracking-wider font-mono">Approval Progress</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                liveStatus.toLowerCase().includes("approved") || liveStatus.toLowerCase().includes("verified") || liveStatus.toLowerCase().includes("confirmed")
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : liveStatus.toLowerCase().includes("rejected") || liveStatus.toLowerCase().includes("failed") || liveStatus.toLowerCase().includes("cancelled")
                  ? "bg-red-500/10 text-red-400" 
                  : "bg-amber-500/10 text-amber-400 animate-pulse"
              }`}>
                {liveStatus}
              </span>
            </div>

            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  liveStatus.toLowerCase().includes("approved") || liveStatus.toLowerCase().includes("verified") || liveStatus.toLowerCase().includes("confirmed")
                    ? "w-full bg-emerald-500" 
                    : liveStatus.toLowerCase().includes("rejected") || liveStatus.toLowerCase().includes("failed") || liveStatus.toLowerCase().includes("cancelled")
                    ? "w-full bg-red-500" 
                    : "w-2/3 bg-amber-500"
                }`} 
              />
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal">
              {liveStatus.toLowerCase().includes("approved") || liveStatus.toLowerCase().includes("verified") || liveStatus.toLowerCase().includes("confirmed")
                ? "Your request has been approved and confirmed by the business owner!"
                : liveStatus.toLowerCase().includes("rejected") || liveStatus.toLowerCase().includes("failed") || liveStatus.toLowerCase().includes("cancelled")
                ? "The request was rejected or cancelled. Please contact customer support."
                : "Real-time updates will display here as the owner reviews your payment receipt."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all hover:bg-zinc-850"
            >
              Track Order
            </button>
            <button
              onClick={onContinueShopping}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-black transition-all hover:opacity-95 shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
