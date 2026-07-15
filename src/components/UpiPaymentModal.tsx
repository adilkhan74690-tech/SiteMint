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
  bookingDetails?: {
    service_id: number;
    staff_id?: number | null;
    start_time: string;
    notes?: string;
  };
  orderId?: number | string;
  onSuccess: (id: string | number) => void;
  onBack?: () => void;
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
  orderId,
  onSuccess,
  onBack
}: UpiPaymentModalProps) {
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setFilePreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  if (!isOpen) return null;

  // Format UPI payment link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR`;
  // Generate real QR code image using qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ffffff&bgcolor=09090b&data=${encodeURIComponent(upiLink)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile) {
      setErrorMsg("Please upload your payment screenshot.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (orderId) {
        // Create the UPI payment transaction record linked to order using FormData
        const formData = new FormData();
        formData.append("business_id", String(businessId));
        formData.append("order_id", String(orderId));
        formData.append("amount", String(amount));
        formData.append("customer_email", customer.email);
        formData.append("screenshot", screenshotFile);

        const paymentRes = await fetch("/api/checkout/upi-payment", {
          method: "POST",
          body: formData
        });

        const paymentResult = await paymentRes.json();
        if (!paymentRes.ok || !paymentResult.success) {
          throw new Error(paymentResult.message || "Failed to submit UPI payment verification.");
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        setErrorMsg("");
        
        setTimeout(() => {
          onSuccess(orderId);
        }, 2000);
      } else if (bookingDetails) {
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

        // 2. Create the UPI payment transaction record using FormData
        const formData = new FormData();
        formData.append("business_id", String(businessId));
        formData.append("booking_id", String(bookingId));
        formData.append("amount", String(amount));
        formData.append("customer_email", customer.email);
        formData.append("screenshot", screenshotFile);

        const paymentRes = await fetch("/api/checkout/upi-payment", {
          method: "POST",
          body: formData
        });

        const paymentResult = await paymentRes.json();
        if (!paymentRes.ok || !paymentResult.success) {
          throw new Error(paymentResult.message || "Failed to submit UPI payment verification.");
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        setErrorMsg("");
        
        setTimeout(() => {
          onSuccess(bookingId);
        }, 2000);
      } else {
        throw new Error("Invalid transaction parameters.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "Your payment submission could not be processed. Please check your network and try again.");
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
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#09090B] p-6 text-white shadow-2xl flex flex-col scrollbar-thin"
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
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <LucideIcon name="CheckCircle" className="w-10 h-10 stroke-[2] animate-bounce" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Payment Submitted</h4>
                <p className="text-sm text-zinc-300 flex items-center justify-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Payment submitted successfully.
                </p>
                <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Waiting for owner approval.
                </p>
              </div>
            </div>
          ) : (
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

              {/* Verification Inputs - Screenshot Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block text-left">
                  Upload Payment Screenshot
                </label>
                
                <div className="relative border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950 hover:bg-zinc-900/40 transition-all text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {filePreview ? (
                    <div className="relative z-0 max-w-[150px] mx-auto rounded-lg overflow-hidden border border-zinc-800 shadow-lg">
                      <img src={filePreview} alt="Screenshot Preview" className="w-full h-auto max-h-24 object-contain" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        Change File
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 flex flex-col items-center text-zinc-400 group-hover:text-white transition-colors">
                      <LucideIcon name="Upload" className="w-6 h-6 text-zinc-500 group-hover:text-mint transition-colors" />
                      <span className="text-xs font-semibold">Tap to select or take photo</span>
                      <span className="text-[9px] text-zinc-500">Supports PNG, JPG, JPEG</span>
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-zinc-500 leading-normal text-left">
                  Upload the payment receipt screenshot from your UPI app (GPay, PhonePe, Paytm, etc.) to verify settlement.
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

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 bg-zinc-950/40 hover:bg-zinc-900"
                >
                  <LucideIcon name="ChevronLeft" className="w-3.5 h-3.5" />
                  Back to Basket
                </button>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
