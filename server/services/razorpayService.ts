import crypto from "crypto";

const {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET
} = process.env;

let isRazorpayConfigured = false;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  isRazorpayConfigured = true;
  console.log("💳 Razorpay payment gateway integration initialized successfully.");
} else {
  console.warn("⚠️  Razorpay credentials are missing. Payment workflows will run in sandbox/simulation mode.");
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

/**
 * Creates an order in Razorpay (or simulates order creation in sandbox mode).
 */
export async function createRazorpayOrder(
  amountInRupees: number,
  receiptId: string
): Promise<RazorpayOrderResult> {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (!isRazorpayConfigured) {
    const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 12)}`;
    console.log(`[SIMULATION] Created mock Razorpay order: ${mockOrderId} for ₹${amountInRupees}`);
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      status: "created"
    };
  }

  try {
    // Razorpay standard HTTP authorization
    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status
    };
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error);
    throw error;
  }
}

/**
 * Verifies the integrity of a Razorpay payment signature.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!isRazorpayConfigured) {
    console.log(`[SIMULATION] Bypass payment signature verification in sandbox mode for order: ${orderId}`);
    return true;
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("❌ Razorpay signature verification error:", error);
    return false;
  }
}
