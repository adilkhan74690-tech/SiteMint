import { useState } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "./LucideIcon";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  businessName: string;
  upiId: string;
  amount: number;
  customer: {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  bookingDetails: {
    service_id: number;
    staff_id?: number | null;
    start_time: string;
    notes?: string;
  };
  onSuccess: (bookingId: string | number) => void;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  upiId,
  amount,
  customer,
  bookingDetails,
  onSuccess
}: UpiPaymentModalProps) {
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Format UPI payment link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR`;
  // Generate real QR code image using qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ffffff&bgcolor=09090b&data=${encodeURIComponent(upiLink)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionId.length < 8) {
      setErrorMsg("Please enter a valid Transaction Ref ID (at least 8 digits).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Create the booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          business_id: businessId,
          service_id: bookingDetails.service_id,
          staff_id: bookingDetails.staff_id,
          start_time: bookingDetails.start_time,
          notes: bookingDetails.notes,
          customer
        })
      });

      const bookingResult = await bookingRes.json();

      if (!bookingRes.ok) {
        throw new Error(bookingResult.message || "Failed to create booking.");
      }

      const bookingId = bookingResult.data.booking_id;

      // 2. Create the UPI payment transaction record
      const paymentRes = await fetch("/api/checkout/upi-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          business_id: businessId,
          booking_id: bookingId,
          amount,
          transaction_id: transactionId,
          customer_email: customer.email
        })
      });

      const paymentResult = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentResult.message || "Failed to submit UPI payment verification.");
      }

      setIsSubmitting(false);
      onSuccess(bookingId);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "An unexpected error occurred during submission.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="upi-payment-modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#09090B] p-6 text-white shadow-2xl flex flex-col"
          id="upi-payment-modal-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-mint/10 text-mint">
                <LucideIcon name="QrCode" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold font-display">Direct UPI Payment</h3>
                <p className="text-[10px] text-zinc-500 font-mono">SECURE TENANT GATEWAY</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <LucideIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left flex-grow">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="text-center space-y-3">
              <p className="text-xs text-zinc-400">
                Scan QR using any UPI app (GPay, PhonePe, Paytm) to transfer directly to the merchant.
              </p>

              {/* QR Code Frame */}
              <div className="inline-block p-3 rounded-2xl bg-zinc-950 border border-zinc-900 mx-auto shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 block rounded-xl"
                  onError={(e) => {
                    // Fallback visual if network fails
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              {/* Amount Display */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Transfer Amount</p>
                <h4 className="text-2xl font-black text-white font-mono">₹{amount.toFixed(2)}</h4>
              </div>
            </div>

            {/* Merchant UPI info */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Business:</span>
                <span className="text-white font-bold">{businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">VPA Address:</span>
                <span className="text-mint font-bold select-all">{upiId}</span>
              </div>
            </div>

            {/* Verification Inputs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Transaction ID / Ref Number
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter 12-digit UPI Ref Number"
                className="w-full bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all font-mono"
              />
              <p className="text-[10px] text-zinc-500 leading-normal">
                Submit the UPI reference number from your payment confirmation screen to clear settlement.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <LucideIcon name="Loader2" className="w-4.5 h-4.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit UPI Payment
                    <LucideIcon name="CheckCircle" className="w-4 h-4" />
                  </>
                )}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
