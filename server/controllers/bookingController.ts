import { Request, Response, NextFunction } from "express";
import { query, getConnection } from "../config/database.js";
import { emitToStaff } from "../services/socketService.js";

/**
 * List bookings with date range filters.
 */
export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.query.business_id || req.user?.businessId;
  const { start_date, end_date } = req.query;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id context is required." });
    return;
  }

  try {
    let sql = `
      SELECT b.*, 
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email, c.phone as customer_phone,
             s.name as service_name, s.duration_minutes as service_duration, s.price as service_price,
             u.full_name as staff_name
      FROM \`bookings\` b
      JOIN \`customers\` c ON b.customer_id = c.id
      JOIN \`services\` s ON b.service_id = s.id
      LEFT JOIN \`users\` u ON b.staff_id = u.id
      WHERE b.business_id = ?
    `;
    const params: any[] = [businessId];

    if (start_date) {
      sql += " AND b.start_time >= ?";
      params.push(start_date);
    }
    if (end_date) {
      sql += " AND b.start_time <= ?";
      params.push(end_date);
    }

    sql += " ORDER BY b.start_time ASC";

    const bookings = await query(sql, params);
    res.json({ status: "success", data: bookings });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle online bookings for customers (including automatic guest profiling).
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.body.business_id || req.user?.businessId;
  const { service_id, staff_id, start_time, notes, customer } = req.body;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id context is required." });
    return;
  }

  if (!service_id || !start_time || !customer || !customer.email || !customer.first_name) {
    res.status(400).json({
      status: "error",
      message: "Required booking details are missing: service_id, start_time, customer.email, and customer.first_name."
    });
    return;
  }

  // Live database execution
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Check if customer exists under this business tenant
    const [existingCusts]: any = await connection.execute(
      "SELECT id FROM `customers` WHERE `business_id` = ? AND `email` = ?",
      [businessId, customer.email]
    );

    let customerId;
    if (existingCusts.length > 0) {
      customerId = existingCusts[0].id;
    } else {
      // Create new customer record
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

    // 2. Load service to read duration
    const [services]: any = await connection.execute(
      "SELECT duration_minutes, name, price FROM `services` WHERE `id` = ? AND `business_id` = ?",
      [service_id, businessId]
    );

    if (services.length === 0) {
      res.status(404).json({ status: "error", message: "Service is inactive or doesn't exist." });
      await connection.rollback();
      return;
    }

    const service = services[0];
    const startTimeParsed = new Date(start_time);
    const endTimeParsed = new Date(startTimeParsed.getTime() + service.duration_minutes * 60000);

    // 3. Insert Booking record (initially 'pending')
    const [bookingResult]: any = await connection.execute(
      `INSERT INTO \`bookings\` (\`business_id\`, \`customer_id\`, \`service_id\`, \`staff_id\`, \`start_time\`, \`end_time\`, \`status\`, \`notes\`) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        businessId,
        customerId,
        service_id,
        staff_id ? Number(staff_id) : null,
        startTimeParsed,
        endTimeParsed,
        notes || null
      ]
    );

    const bookingId = bookingResult.insertId;

    // Create a real-time Audit Log record
    await connection.execute(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'booking_created', ?)`,
      [businessId, JSON.stringify({ booking_id: bookingId, customer_email: customer.email, service_name: service.name })]
    );

    // Create an App Notification record
    await connection.execute(
      `INSERT INTO \`notifications\` (\`business_id\`, \`recipient_type\`, \`recipient_id\`, \`title\`, \`message\`) 
       VALUES (?, 'user', ?, 'New Appointment Booked', ?)`,
      [
        businessId,
        staff_id || 1, // Notify therapist/staff or default admin
        `A new appointment for "${service.name}" is scheduled on ${startTimeParsed.toLocaleString()}.`
      ]
    );

    await connection.commit();

    // Fire live updates over socket
    emitToStaff(businessId, "new-booking", {
      booking_id: bookingId,
      customer_name: `${customer.first_name} ${customer.last_name || ""}`,
      service_name: service.name,
      price: service.price,
      start_time: startTimeParsed
    });

    res.status(201).json({
      status: "success",
      message: "Appointment scheduled successfully.",
      data: {
        booking_id: bookingId,
        start_time: startTimeParsed,
        end_time: endTimeParsed,
        customer_id: customerId,
        price: service.price,
        business_name: service.name // can be mapped or updated as needed
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
 * Cancel or Confirm an Appointment (staff action)
 */
export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { status } = req.body; // e.g., 'confirmed', 'cancelled', 'completed'

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  if (!status) {
    res.status(400).json({ status: "error", message: "Status parameter is required." });
    return;
  }

  try {
    const bookings: any[] = await query(
      "SELECT customer_id FROM `bookings` WHERE `id` = ? AND `business_id` = ?",
      [id, businessId]
    );
    if (bookings.length === 0) {
      res.status(404).json({ status: "error", message: "Appointment record not found." });
      return;
    }
    const customerId = bookings[0].customer_id;

    const result: any = await query(
      "UPDATE `bookings` SET `status` = ? WHERE `id` = ? AND `business_id` = ?",
      [status.toLowerCase(), id, businessId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ status: "error", message: "Appointment record not found." });
      return;
    }

    // Create customer notification record
    let notifTitle = "Pending Approval";
    let notifMessage = "Your request has been submitted successfully and is waiting for owner approval.";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "confirmed" || lowerStatus === "completed" || lowerStatus === "approved") {
      notifTitle = "Approved";
      notifMessage = "Your request has been approved.";
    } else if (lowerStatus === "cancelled" || lowerStatus === "rejected") {
      notifTitle = "Rejected";
      notifMessage = "Your request has been rejected.";
    }

    await query(
      `INSERT INTO \`notifications\` (\`business_id\`, \`recipient_type\`, \`recipient_id\`, \`title\`, \`message\`) 
       VALUES (?, 'customer', ?, ?, ?)`,
      [businessId, customerId, notifTitle, notifMessage]
    );

    res.json({ status: "success", message: `Booking status updated to ${status} successfully.` });
  } catch (error) {
    next(error);
  }
}

/**
 * Public endpoint to fetch status of a booking.
 */
export async function getPublicBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  try {
    const bookings: any[] = await query(
      "SELECT b.status, b.customer_id, b.business_id FROM `bookings` b WHERE b.id = ?",
      [id]
    );

    if (bookings.length === 0) {
      res.status(404).json({ status: "error", message: "Booking not found." });
      return;
    }

    const booking = bookings[0];
    let displayStatus = "Pending Approval";
    const lowerStatus = booking.status.toLowerCase();

    // Check if there is a pending UPI payment linked
    const payments: any[] = await query(
      "SELECT status, gateway FROM `payments` WHERE `booking_id` = ? ORDER BY `id` DESC LIMIT 1",
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
      } else if (lowerStatus === "confirmed" || lowerStatus === "completed") {
        displayStatus = "Approved";
      } else if (lowerStatus === "cancelled") {
        displayStatus = "Rejected";
      }
    } else {
      if (lowerStatus === "confirmed" || lowerStatus === "completed") {
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
