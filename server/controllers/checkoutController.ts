import { Request, Response, NextFunction } from "express";
import { query, getConnection } from "../config/database.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/razorpayService.js";
import { emitToStaff } from "../services/socketService.js";

/**
 * Create a new customer Order and request a Razorpay transaction token.
 */
export async function createCheckoutOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.body.business_id || req.user?.businessId;
  const { customer, items, shipping_amount, tax_amount } = req.body;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id context is required." });
    return;
  }

  if (!customer || !customer.email || !items || items.length === 0) {
    res.status(400).json({
      status: "error",
      message: "Please specify customer credentials and at least one item to checkout."
    });
    return;
  }

  // Calculate order subtotals and totals
  let subtotal = 0;
  for (const item of items) {
    subtotal += Number(item.price) * Number(item.quantity);
  }

  const tax = Number(tax_amount || 0);
  const shipping = Number(shipping_amount || 0);
  const totalAmount = subtotal + tax + shipping;

  // Live database transactions
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Resolve or Register Customer profile
    const [existingCusts]: any = await connection.execute(
      "SELECT id FROM `customers` WHERE `business_id` = ? AND `email` = ?",
      [businessId, customer.email]
    );

    let customerId;
    if (existingCusts.length > 0) {
      customerId = existingCusts[0].id;
    } else {
      const [newCustResult]: any = await connection.execute(
        `INSERT INTO \`customers\` (\`business_id\`, \`email\`, \`phone\`, \`first_name\`, \`last_name\`, \`status\`) 
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [
          businessId,
          customer.email,
          customer.phone || null,
          customer.first_name,
          customer.last_name || ""
        ]
      );
      customerId = newCustResult.insertId;
    }

    // 2. Insert main Order record
    const [orderResult]: any = await connection.execute(
      `INSERT INTO \`orders\` (\`business_id\`, \`customer_id\`, \`total_amount\`, \`tax_amount\`, \`shipping_amount\`, \`status\`) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [businessId, customerId, totalAmount, tax, shipping]
    );
    const orderId = orderResult.insertId;

    // 3. Insert each separate Order Line Item
    for (const item of items) {
      await connection.execute(
        `INSERT INTO \`order_items\` (\`order_id\`, \`product_id\`, \`quantity\`, \`unit_price\`) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 4. Register with Razorpay gateway
    const razorpayData = await createRazorpayOrder(totalAmount, `receipt_order_${orderId}`);

    // 5. Create payment ledger entry with gateway order tracking
    await connection.execute(
      `INSERT INTO \`payments\` (\`business_id\`, \`customer_id\`, \`order_id\`, \`gateway\`, \`gateway_order_id\`, \`amount\`, \`status\`) 
       VALUES (?, ?, ?, 'razorpay', ?, ?, 'pending')`,
      [businessId, customerId, orderId, razorpayData.id, totalAmount]
    );

    await connection.commit();

    res.status(201).json({
      status: "success",
      message: "Checkout order created and registered with payment gateway.",
      data: {
        order_id: orderId,
        gateway_order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency
      }
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Handle verification callback from Razorpay Client checkout success.
 */
export async function verifyAndCapturePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({
      status: "error",
      message: "Please provide razorpay_order_id, razorpay_payment_id, and razorpay_signature for verification."
    });
    return;
  }

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValid) {
    res.status(400).json({
      status: "error",
      message: "Security signature mismatch. Payment verification failed."
    });
    return;
  }

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Locate the pending payment record
    const [payments]: any = await connection.execute(
      "SELECT id, order_id, booking_id, business_id, amount FROM `payments` WHERE `gateway_order_id` = ?",
      [razorpay_order_id]
    );

    if (payments.length === 0) {
      res.status(404).json({ status: "error", message: "Transaction record was not registered." });
      await connection.rollback();
      return;
    }

    const tx = payments[0];

    // 2. Capture and update transaction status
    await connection.execute(
      "UPDATE `payments` SET `gateway_payment_id` = ?, `status` = 'captured' WHERE `id` = ?",
      [razorpay_payment_id, tx.id]
    );

    // 3. Mark the connected order or booking as paid/completed
    if (tx.order_id) {
      await connection.execute(
        "UPDATE `orders` SET `status` = 'completed' WHERE `id` = ?",
        [tx.order_id]
      );
    }
    if (tx.booking_id) {
      await connection.execute(
        "UPDATE `bookings` SET `status` = 'confirmed' WHERE `id` = ?",
        [tx.booking_id]
      );
    }

    // 4. Create Audit Log
    await connection.execute(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'payment_captured', ?)`,
      [tx.business_id, JSON.stringify({ amount: tx.amount, gateway_order_id: razorpay_order_id, payment_id: tx.id })]
    );

    await connection.commit();

    // Broadcast socket event to tenant professionals
    emitToStaff(tx.business_id, "new-payment", {
      order_id: tx.order_id,
      amount: tx.amount,
      status: "captured"
    });

    res.json({
      status: "success",
      message: "Razorpay payment captured and verified successfully. Transaction settled."
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Fetch Order list (staff dashboard access).
 */
export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.query.business_id || req.user?.businessId;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id context is required." });
    return;
  }

  try {
    const orders = await query(
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone 
       FROM \`orders\` o
       JOIN \`customers\` c ON o.customer_id = c.id
       WHERE o.business_id = ? 
       ORDER BY o.id DESC`,
      [businessId]
    );
    res.json({ status: "success", data: orders });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch Payments list (staff dashboard access).
 */
export async function listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.query.business_id || req.user?.businessId;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id context is required." });
    return;
  }

  try {
    const payments = await query(
      `SELECT p.*, c.first_name, c.last_name, c.email, c.phone
       FROM \`payments\` p
       JOIN \`customers\` c ON p.customer_id = c.id
       WHERE p.business_id = ? 
       ORDER BY p.id DESC`,
      [businessId]
    );
    res.json({ status: "success", data: payments });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new pending UPI payment submission from booking page.
 */
export async function createUpiPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { business_id, booking_id, amount, transaction_id, customer_email } = req.body;

  if (!business_id || !booking_id || !amount || !transaction_id || !customer_email) {
    res.status(400).json({
      status: "error",
      message: "Required parameters are missing: business_id, booking_id, amount, transaction_id, and customer_email."
    });
    return;
  }

  try {
    // 1. Check customer profile
    const customers = await query(
      "SELECT id FROM `customers` WHERE `business_id` = ? AND `email` = ?",
      [business_id, customer_email]
    );

    if (customers.length === 0) {
      res.status(404).json({ status: "error", message: "Customer profile not found." });
      return;
    }

    const customerId = customers[0].id;

    // 2. Insert UPI payment record
    const gatewayOrderId = `UPI-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const result: any = await query(
      `INSERT INTO \`payments\` (\`business_id\`, \`customer_id\`, \`booking_id\`, \`gateway\`, \`gateway_order_id\`, \`gateway_payment_id\`, \`amount\`, \`status\`) 
       VALUES (?, ?, ?, 'upi', ?, ?, ?, 'pending')`,
      [
        business_id,
        customerId,
        booking_id,
        gatewayOrderId,
        transaction_id,
        amount
      ]
    );

    res.status(201).json({
      status: "success",
      message: "UPI transaction submitted successfully and is pending owner verification.",
      data: { payment_id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve or Reject a pending UPI settlement transaction (owner/manager dashboard action).
 */
export async function approvePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { status } = req.body; // 'captured' (approved) or 'failed' (rejected)

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  if (!status || (status !== "captured" && status !== "failed")) {
    res.status(400).json({ status: "error", message: "Valid status ('captured' or 'failed') is required." });
    return;
  }

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Load payment details
    const [payments]: any = await connection.execute(
      "SELECT * FROM `payments` WHERE `id` = ? AND `business_id` = ?",
      [id, businessId]
    );

    if (payments.length === 0) {
      res.status(404).json({ status: "error", message: "Payment transaction record not found." });
      await connection.rollback();
      return;
    }

    const payment = payments[0];

    // 2. Update payment status
    await connection.execute(
      "UPDATE `payments` SET `status` = ? WHERE `id` = ?",
      [status, id]
    );

    // 3. Propagate changes to order or booking
    if (status === "captured") {
      if (payment.booking_id) {
        await connection.execute(
          "UPDATE `bookings` SET `status` = 'confirmed' WHERE `id` = ?",
          [payment.booking_id]
        );
      }
      if (payment.order_id) {
        await connection.execute(
          "UPDATE `orders` SET `status` = 'completed' WHERE `id` = ?",
          [payment.order_id]
        );
      }
    } else {
      // If rejected
      if (payment.booking_id) {
        await connection.execute(
          "UPDATE `bookings` SET `status` = 'cancelled' WHERE `id` = ?",
          [payment.booking_id]
        );
      }
      if (payment.order_id) {
        await connection.execute(
          "UPDATE `orders` SET `status` = 'cancelled' WHERE `id` = ?",
          [payment.order_id]
        );
      }
    }

    // Write activity log
    await connection.execute(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'payment_approval_processed', ?)`,
      [businessId, JSON.stringify({ payment_id: id, status, amount: payment.amount })]
    );

    await connection.commit();

    emitToStaff(businessId, "payment-approved", {
      payment_id: id,
      status,
      amount: payment.amount
    });

    res.json({
      status: "success",
      message: `Payment settlement transaction has been marked as ${status === "captured" ? "Approved" : "Rejected"}.`
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
}
