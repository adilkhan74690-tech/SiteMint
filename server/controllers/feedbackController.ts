import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

/**
 * 1. MEDIA GALLERY WORKFLOWS
 */

export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const file = req.file;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  if (!file) {
    res.status(400).json({ status: "error", message: "Please upload an image file." });
    return;
  }

  try {
    // 1. Upload to Cloudinary (or mock it if credentials are not configured)
    const folderPath = `sitemint_tenant_${businessId}`;
    const uploadResult = await uploadToCloudinary(file.buffer, folderPath, file.originalname);

    // 2. Persist in MySQL schema
    const result: any = await query(
      `INSERT INTO \`media\` (\`business_id\`, \`public_id\`, \`url\`, \`file_name\`, \`file_size\`, \`mime_type\`) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, uploadResult.publicId, uploadResult.url, file.originalname, file.size, file.mimetype]
    );

    res.status(201).json({
      status: "success",
      message: "Media asset uploaded and indexed successfully.",
      data: {
        id: result.insertId,
        url: uploadResult.url,
        file_name: file.originalname
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMediaGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.query.business_id || req.user?.businessId;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id context is required." });
    return;
  }

  try {
    const media = await query(
      "SELECT * FROM `media` WHERE `business_id` = ? ORDER BY `id` DESC",
      [businessId]
    );
    res.json({ status: "success", data: media });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. REVIEWS WORKFLOWS
 */

export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  let businessId = req.query.business_id || req.user?.businessId;
  const { subdomain, approved_only } = req.query;

  if (!businessId && subdomain) {
    const biz: any[] = await query("SELECT id FROM `businesses` WHERE `subdomain` = ?", [subdomain]);
    if (biz.length > 0) {
      businessId = biz[0].id;
    }
  }

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id or subdomain context is required." });
    return;
  }

  try {
    let sql = `
      SELECT r.*, c.first_name, c.last_name, p.name as product_name, s.name as service_name
      FROM \`reviews\` r
      JOIN \`customers\` c ON r.customer_id = c.id
      LEFT JOIN \`products\` p ON r.product_id = p.id
      LEFT JOIN \`services\` s ON r.service_id = s.id
      WHERE r.business_id = ?
    `;
    const params: any[] = [businessId];

    if (approved_only === "true") {
      sql += " AND r.is_approved = TRUE";
    }

    sql += " ORDER BY r.id DESC";

    const reviews = await query(sql, params);
    res.json({ status: "success", data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.body.business_id || req.user?.businessId;
  let { customer_id, product_id, service_id, rating, comment, customer_name, is_approved } = req.body;

  if (!businessId) {
    res.status(400).json({ status: "error", message: "business_id is required." });
    return;
  }

  if (rating === undefined || rating === null || Number.isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400).json({ status: "error", message: "A rating between 1 and 5 is required." });
    return;
  }

  try {
    // Auto-create customer if customer_name is provided and customer_id is missing
    if (!customer_id && customer_name) {
      const parts = customer_name.trim().split(/\s+/);
      const firstName = parts[0] || "Customer";
      const lastName = parts.slice(1).join(" ") || "";
      const email = `${firstName.toLowerCase()}_${Date.now()}@placeholder.com`;

      const custResult: any = await query(
        "INSERT INTO `customers` (`business_id`, `first_name`, `last_name`, `email`) VALUES (?, ?, ?, ?)",
        [businessId, firstName, lastName, email]
      );
      customer_id = custResult.insertId;
    }

    if (!customer_id) {
      res.status(400).json({ status: "error", message: "customer_id or customer_name is required." });
      return;
    }

    const approvedVal = req.user ? (is_approved === true || is_approved === "true" || is_approved === 1) : false;

    const result: any = await query(
      `INSERT INTO \`reviews\` (\`business_id\`, \`customer_id\`, \`product_id\`, \`service_id\`, \`rating\`, \`comment\`, \`is_approved\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        businessId,
        customer_id,
        product_id ? Number(product_id) : null,
        service_id ? Number(service_id) : null,
        Number(rating),
        comment || null,
        approvedVal
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Feedback submitted successfully.",
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. ACTIVITY AUDIT TRAIL LOGS
 */

export async function listActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    const logs = await query(
      `SELECT l.*, u.full_name as user_name, u.email as user_email
       FROM \`activity_logs\` l
       LEFT JOIN \`users\` u ON l.user_id = u.id
       WHERE l.business_id = ? 
       ORDER BY l.created_at DESC LIMIT 100`,
      [businessId]
    );
    res.json({ status: "success", data: logs });
  } catch (error) {
    next(error);
  }
}

/**
 * 4. NOTIFICATIONS FEED
 */

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const userId = req.user?.userId;

  if (!businessId || !userId) {
    res.status(401).json({ status: "error", message: "Unauthorized." });
    return;
  }

  try {
    const notifications = await query(
      "SELECT * FROM `notifications` WHERE `business_id` = ? AND `recipient_type` = 'user' AND `recipient_id` = ? ORDER BY `id` DESC",
      [businessId, userId]
    );
    res.json({ status: "success", data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!businessId || !userId) {
    res.status(401).json({ status: "error", message: "Unauthorized." });
    return;
  }

  try {
    await query(
      "UPDATE `notifications` SET `is_read` = TRUE WHERE `id` = ? AND `business_id` = ? AND `recipient_type` = 'user' AND `recipient_id` = ?",
      [id, businessId, userId]
    );
    res.json({ status: "success", message: "Notification marked as read successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a media asset from MySQL registry.
 */
export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized context." });
    return;
  }

  try {
    await query("DELETE FROM `media` WHERE `id` = ? AND `business_id` = ?", [id, businessId]);
    res.json({ status: "success", message: "Media deleted successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve or update review status (owner action).
 */
export async function updateReviewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { is_approved } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query(
      "UPDATE `reviews` SET `is_approved` = ? WHERE `id` = ? AND `business_id` = ?",
      [is_approved ? 1 : 0, id, businessId]
    );
    res.json({ status: "success", message: "Review status updated successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * Reply to a customer review (owner action).
 */
export async function updateReviewReply(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { reply } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query(
      "UPDATE `reviews` SET `reply` = ? WHERE `id` = ? AND `business_id` = ?",
      [reply || null, id, businessId]
    );
    res.json({ status: "success", message: "Review reply updated successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a review (owner action).
 */
export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query(
      "DELETE FROM `reviews` WHERE `id` = ? AND `business_id` = ?",
      [id, businessId]
    );
    res.json({ status: "success", message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { rating, comment, customer_name } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    // 1. Fetch review to get customer_id
    const reviewData: any[] = await query(
      "SELECT customer_id FROM `reviews` WHERE `id` = ? AND `business_id` = ?",
      [id, businessId]
    );

    if (reviewData.length === 0) {
      res.status(404).json({ status: "error", message: "Review not found." });
      return;
    }

    const customerId = reviewData[0].customer_id;

    // 2. If customer_name is provided, update customer first_name & last_name
    if (customer_name) {
      const parts = customer_name.trim().split(/\s+/);
      const firstName = parts[0] || "Customer";
      const lastName = parts.slice(1).join(" ") || "";
      await query(
        "UPDATE `customers` SET `first_name` = ?, `last_name` = ? WHERE `id` = ? AND `business_id` = ?",
        [firstName, lastName, customerId, businessId]
      );
    }

    // 3. Update rating and comment in reviews table
    await query(
      `UPDATE \`reviews\`
       SET \`rating\` = COALESCE(?, \`rating\`),
           \`comment\` = COALESCE(?, \`comment\`)
       WHERE \`id\` = ? AND \`business_id\` = ?`,
      [
        rating !== undefined ? Number(rating) : null,
        comment !== undefined ? comment : null,
        id,
        businessId
      ]
    );

    res.json({ status: "success", message: "Review updated successfully." });
  } catch (error) {
    next(error);
  }
}

