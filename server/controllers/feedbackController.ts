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
    const [result]: any = await query(
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
  const { customer_id, product_id, service_id, rating, comment } = req.body;

  if (!businessId || !customer_id || !rating) {
    res.status(400).json({ status: "error", message: "Required parameters missing: business_id, customer_id, and rating (1-5)." });
    return;
  }

  try {
    const [result]: any = await query(
      `INSERT INTO \`reviews\` (\`business_id\`, \`customer_id\`, \`product_id\`, \`service_id\`, \`rating\`, \`comment\`, \`is_approved\`) 
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [
        businessId,
        customer_id,
        product_id ? Number(product_id) : null,
        service_id ? Number(service_id) : null,
        Number(rating),
        comment || null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Feedback submitted successfully. It will display publicly upon moderator approval.",
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
