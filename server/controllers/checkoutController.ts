import { Request, Response, NextFunction } from "express";
import { query, getConnection } from "../config/database.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/razorpayService.js";
import { emitToStaff } from "../services/socketService.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

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
        [orderId, item.product_id || item.id, item.quantity, item.price]
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
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone,
              p.gateway_payment_id AS screenshot_url, p.status AS payment_status, p.amount AS payment_amount,
              (
                SELECT GROUP_CONCAT(CONCAT(oi.quantity, 'x ', COALESCE(pr.name, s2.name)) SEPARATOR ', ')
                FROM order_items oi
                LEFT JOIN products pr ON oi.product_id = pr.id
                LEFT JOIN services s2 ON oi.product_id = s2.id
                WHERE oi.order_id = o.id
              ) AS order_items_desc
       FROM \`orders\` o
       JOIN \`customers\` c ON o.customer_id = c.id
       LEFT JOIN \`payments\` p ON p.order_id = o.id AND p.gateway = 'upi'
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
      `SELECT p.*, 
              c.first_name, c.last_name, c.email, c.phone,
              s.name AS service_name, b.start_time AS booking_start_time,
              o.total_amount AS order_total_amount,
              (
                SELECT GROUP_CONCAT(CONCAT(oi.quantity, 'x ', COALESCE(pr.name, s2.name)) SEPARATOR ', ')
                FROM order_items oi
                LEFT JOIN products pr ON oi.product_id = pr.id
                LEFT JOIN services s2 ON oi.product_id = s2.id
                WHERE oi.order_id = p.order_id
              ) AS order_items_desc
       FROM \`payments\` p
       JOIN \`customers\` c ON p.customer_id = c.id
       LEFT JOIN \`bookings\` b ON p.booking_id = b.id
       LEFT JOIN \`services\` s ON b.service_id = s.id
       LEFT JOIN \`orders\` o ON p.order_id = o.id
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
  const { business_id, booking_id, order_id, amount, customer_email } = req.body;
  const file = req.file;

  if (!business_id || (!booking_id && !order_id) || !amount || !customer_email) {
    res.status(400).json({
      status: "error",
      message: "Required parameters are missing: business_id, amount, customer_email, and either booking_id or order_id."
    });
    return;
  }

  if (!file) {
    res.status(400).json({
      status: "error",
      message: "Please upload your payment screenshot."
    });
    return;
  }

  try {
    // Check if order/booking already exists and has a payment record
    if (order_id) {
      const [existingOrder]: any = await query("SELECT id FROM `orders` WHERE `id` = ?", [order_id]);
      if (existingOrder.length > 0) {
        const [existingPayment]: any = await query(
          "SELECT id, gateway_order_id FROM `payments` WHERE `order_id` = ? AND `business_id` = ?",
          [order_id, business_id]
        );
        if (existingPayment.length > 0) {
          res.status(200).json({
            success: true,
            message: "Payment submitted successfully. Waiting for owner approval.",
            orderId: String(order_id),
            trackingId: existingPayment[0].gateway_order_id
          });
          return;
        }
      }
    } else if (booking_id) {
      const [existingBooking]: any = await query("SELECT id FROM `bookings` WHERE `id` = ?", [booking_id]);
      if (existingBooking.length > 0) {
        const [existingPayment]: any = await query(
          "SELECT id, gateway_order_id FROM `payments` WHERE `booking_id` = ? AND `business_id` = ?",
          [booking_id, business_id]
        );
        if (existingPayment.length > 0) {
          res.status(200).json({
            success: true,
            message: "Payment submitted successfully. Waiting for owner approval.",
            orderId: String(booking_id),
            trackingId: existingPayment[0].gateway_order_id
          });
          return;
        }
      }
    }

    // 1. Upload screenshot to Cloudinary/Mock storage
    const folderPath = `sitemint_payments_${business_id}`;
    const uploadResult = await uploadToCloudinary(file.buffer, folderPath, file.originalname);
    const screenshotUrl = uploadResult.url;

    // 2. Check/create customer profile
    const customers = await query(
      "SELECT id FROM `customers` WHERE `business_id` = ? AND `email` = ?",
      [business_id, customer_email]
    );

    let customerId;
    if (customers.length === 0) {
      const parts = customer_email.split("@")[0].split(".");
      const firstName = parts[0] || "Customer";
      const lastName = parts.slice(1).join(" ") || "";
      const custResult: any = await query(
        "INSERT INTO `customers` (`business_id`, `first_name`, `last_name`, `email`) VALUES (?, ?, ?, ?)",
        [business_id, firstName, lastName, customer_email]
      );
      customerId = custResult.insertId;
    } else {
      customerId = customers[0].id;
    }

    // 3. Insert UPI payment record
    const gatewayOrderId = `UPI-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const result: any = await query(
      `INSERT INTO \`payments\` (\`business_id\`, \`customer_id\`, \`booking_id\`, \`order_id\`, \`gateway\`, \`gateway_order_id\`, \`gateway_payment_id\`, \`amount\`, \`status\`) 
       VALUES (?, ?, ?, ?, 'upi', ?, ?, ?, 'pending')`,
      [
        business_id,
        customerId,
        booking_id || null,
        order_id || null,
        gatewayOrderId,
        screenshotUrl,
        amount
      ]
    );

    res.status(200).json({
      success: true,
      message: "Payment submitted successfully. Waiting for owner approval.",
      orderId: String(order_id || booking_id),
      trackingId: gatewayOrderId
    });
  } catch (error: any) {
    console.error("Error in createUpiPayment:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Your payment submission could not be completed. Please try again."
    });
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
          "UPDATE `orders` SET `status` = 'approved' WHERE `id` = ?",
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
          "UPDATE `orders` SET `status` = 'rejected' WHERE `id` = ?",
          [payment.order_id]
        );
      }
    }

    // Create customer notification record
    const notifTitle = status === "captured" ? "Approved" : "Rejected";
    const notifMessage = status === "captured" 
      ? "🎉 Your payment has been verified. Your order has been approved and is now being prepared." 
      : "Your payment could not be verified. Please upload a new payment screenshot.";
    
    await connection.execute(
      `INSERT INTO \`notifications\` (\`business_id\`, \`recipient_type\`, \`recipient_id\`, \`title\`, \`message\`) 
       VALUES (?, 'customer', ?, ?, ?)`,
      [businessId, payment.customer_id, notifTitle, notifMessage]
    );

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

/**
 * Update the status of an order record.
 */
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { status } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  if (!status) {
    res.status(400).json({ status: "error", message: "Status parameter is required." });
    return;
  }

  try {
    const orders: any[] = await query(
      "SELECT customer_id FROM `orders` WHERE `id` = ? AND `business_id` = ?",
      [id, businessId]
    );
    if (orders.length === 0) {
      res.status(404).json({ status: "error", message: "Order record not found." });
      return;
    }
    const customerId = orders[0].customer_id;

    const result: any = await query(
      "UPDATE `orders` SET `status` = ? WHERE `id` = ? AND `business_id` = ?",
      [status.toLowerCase(), id, businessId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ status: "error", message: "Order record not found." });
      return;
    }

    // Create customer notification record and propagate payment status
    let notifTitle = "Pending";
    let notifMessage = "Your order has been received and is waiting for approval.";
    const lowerStatus = status.toLowerCase();

    if (lowerStatus === "approved" || lowerStatus === "confirmed" || lowerStatus === "processed") {
      notifTitle = "Approved";
      notifMessage = "🎉 Your payment has been verified. Your order has been approved and is now being prepared.";
      await query("UPDATE `payments` SET `status` = 'captured' WHERE `order_id` = ? AND `business_id` = ?", [id, businessId]);
    } else if (lowerStatus === "rejected" || lowerStatus === "failed") {
      notifTitle = "Rejected";
      notifMessage = "Your payment could not be verified. Please upload a new payment screenshot.";
      await query("UPDATE `payments` SET `status` = 'failed' WHERE `order_id` = ? AND `business_id` = ?", [id, businessId]);
    } else if (lowerStatus === "completed") {
      notifTitle = "Completed";
      notifMessage = "Your order has been completed. Thank you for choosing us.";
    } else if (lowerStatus === "cancelled") {
      notifTitle = "Cancelled";
      notifMessage = "Your order has been cancelled.";
    } else if (lowerStatus === "pending") {
      notifTitle = "Pending";
      notifMessage = "Your order has been received and is waiting for approval.";
    }

    await query(
      `INSERT INTO \`notifications\` (\`business_id\`, \`recipient_type\`, \`recipient_id\`, \`title\`, \`message\`) 
       VALUES (?, 'customer', ?, ?, ?)`,
      [businessId, customerId, notifTitle, notifMessage]
    );

    res.json({ status: "success", message: `Order status updated to ${status} successfully.` });
  } catch (error) {
    next(error);
  }
}

/**
 * Public endpoint to fetch status of an order.
 */
export async function getPublicOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  try {
    const orders: any[] = await query(
      "SELECT o.status, o.customer_id, o.business_id FROM `orders` o WHERE o.id = ?",
      [id]
    );

    if (orders.length === 0) {
      res.status(404).json({ status: "error", message: "Order not found." });
      return;
    }

    const order = orders[0];
    let displayStatus = "Pending Approval";
    const lowerStatus = order.status.toLowerCase();

    // Check if there is a pending UPI payment linked
    const payments: any[] = await query(
      "SELECT status, gateway FROM `payments` WHERE `order_id` = ? ORDER BY `id` DESC LIMIT 1",
      [id]
    );

    if (payments.length > 0) {
      const payment = payments[0];
      if (payment.gateway === "upi" && payment.status === "pending") {
        displayStatus = "Payment Pending Verification";
      } else if (payment.status === "captured") {
        displayStatus = "Payment Verified";
      } else if (payment.status === "failed") {
        displayStatus = "Payment Rejected";
      } else if (lowerStatus === "completed" || lowerStatus === "processing") {
        displayStatus = "Approved";
      } else if (lowerStatus === "cancelled") {
        displayStatus = "Rejected";
      }
    } else {
      if (lowerStatus === "completed" || lowerStatus === "processing") {
        displayStatus = "Approved";
      } else if (lowerStatus === "cancelled") {
        displayStatus = "Rejected";
      }
    }

    res.json({ status: "success", data: { status: displayStatus } });
  } catch (error) {
    next(error);
  }
}
