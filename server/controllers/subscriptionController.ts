import { Request, Response, NextFunction } from "express";
import { query, getConnection } from "../config/database.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/razorpayService.js";

/**
 * Fetch subscription status and transaction history
 */
export async function getSubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business context." });
    return;
  }

  try {
    // 1. Get Active Subscription Details
    const subs: any[] = await query(
      `SELECT s.*, p.name as plan_name, p.price as plan_price, p.currency as plan_currency
       FROM \`subscriptions\` s 
       JOIN \`subscription_plans\` p ON s.plan_id = p.id
       WHERE s.business_id = ?
       LIMIT 1`,
      [businessId]
    );

    if (subs.length === 0) {
      res.status(404).json({ status: "error", message: "No active subscription found for this business." });
      return;
    }

    let sub = subs[0];
    let trialRemaining = 0;

    // 2. Check if trial has expired
    if (sub.status === "trial" && sub.renewal_date) {
      const renewalTime = new Date(sub.renewal_date).getTime();
      const now = Date.now();
      const diffMs = renewalTime - now;
      trialRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (trialRemaining <= 0) {
        // Auto-expire trial
        await query(
          "UPDATE `subscriptions` SET `status` = 'expired' WHERE `id` = ?",
          [sub.id]
        );
        sub.status = "expired";
      }
    }

    // 3. Fetch Transaction Ledger
    const transactions: any[] = await query(
      `SELECT * FROM \`payment_transactions\` 
       WHERE \`business_id\` = ? 
       ORDER BY \`created_at\` DESC`,
      [businessId]
    );

    res.json({
      status: "success",
      data: {
        subscription: {
          id: sub.id,
          plan_id: sub.plan_id,
          plan_name: sub.plan_name,
          price: sub.plan_price,
          currency: sub.plan_currency,
          status: sub.status,
          renewal_date: sub.renewal_date,
          trial_remaining: trialRemaining
        },
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a Razorpay Order for Pro or Business Plan Subscription
 */
export async function createSubscriptionOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { plan_id } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business context." });
    return;
  }

  if (plan_id !== "pro" && plan_id !== "business") {
    res.status(400).json({ status: "error", message: "Invalid subscription plan selection." });
    return;
  }

  try {
    // 1. Fetch Plan Details from database
    const plans: any[] = await query("SELECT * FROM `subscription_plans` WHERE `id` = ?", [plan_id]);
    if (plans.length === 0) {
      res.status(404).json({ status: "error", message: "Selected plan does not exist." });
      return;
    }

    const plan = plans[0];
    const receiptId = `receipt_sub_${Date.now()}`;

    // 2. Call Razorpay API order builder
    const razorpayData = await createRazorpayOrder(Number(plan.price), receiptId);

    // 3. Record pending transaction in MySQL
    await query(
      `INSERT INTO \`payment_transactions\` (\`business_id\`, \`order_id\`, \`amount\`, \`currency\`, \`status\`)
       VALUES (?, ?, ?, ?, 'pending')`,
      [businessId, razorpayData.id, plan.price, plan.currency]
    );

    res.status(201).json({
      status: "success",
      data: {
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        plan_id: plan.id
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify Razorpay Signature and Update Subscription Plan
 */
export async function verifySubscriptionPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business context." });
    return;
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan_id) {
    res.status(400).json({
      status: "error",
      message: "Required verification params (razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id) are missing."
    });
    return;
  }

  // 1. Verify Razorpay Payment Signature
  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    res.status(400).json({ status: "error", message: "Razorpay payment signature verification failed." });
    return;
  }

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 2. Locate the pending transaction ledger entry
    const [txs]: any = await connection.execute(
      "SELECT id FROM `payment_transactions` WHERE `order_id` = ? AND `business_id` = ?",
      [razorpay_order_id, businessId]
    );

    if (txs.length === 0) {
      res.status(404).json({ status: "error", message: "Payment order transaction record not found." });
      await connection.rollback();
      return;
    }

    const txId = txs[0].id;

    // 3. Calculate new monthly renewal date
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    // 4. Update the tenant subscription entry in MySQL
    await connection.execute(
      `INSERT INTO \`subscriptions\` (\`business_id\`, \`plan_id\`, \`status\`, \`renewal_date\`)
       VALUES (?, ?, 'active', ?)
       ON DUPLICATE KEY UPDATE \`plan_id\` = VALUES(\`plan_id\`), \`status\` = 'active', \`renewal_date\` = VALUES(\`renewal_date\`)`,
      [businessId, plan_id, renewalDate]
    );

    // Retrieve active subscription ID to link it to the payment record
    const [subs]: any = await connection.execute(
      "SELECT id FROM `subscriptions` WHERE `business_id` = ? LIMIT 1",
      [businessId]
    );
    const subId = subs[0].id;

    // 5. Update transaction state to success and bind subscription relation
    await connection.execute(
      `UPDATE \`payment_transactions\` 
       SET \`status\` = 'success', \`payment_id\` = ?, \`subscription_id\` = ?
       WHERE \`id\` = ?`,
      [razorpay_payment_id, subId, txId]
    );

    // 6. Log system audit log
    await connection.execute(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'subscription_activated', ?)`,
      [businessId, JSON.stringify({ plan_id, renewal_date: renewalDate, payment_id: razorpay_payment_id })]
    );

    await connection.commit();

    res.json({
      status: "success",
      message: "Subscription plan upgraded successfully."
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Cancel the active monthly subscription (expires immediately or marks as cancelled)
 */
export async function cancelActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business context." });
    return;
  }

  try {
    await query(
      "UPDATE `subscriptions` SET `status` = 'cancelled' WHERE `business_id` = ?",
      [businessId]
    );

    await query(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'subscription_cancelled', '{}')`,
      [businessId]
    );

    res.json({
      status: "success",
      message: "Subscription cancelled successfully. Plan features remain locked or downgraded."
    });
  } catch (error) {
    next(error);
  }
}
