import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";

/**
 * Fetch overall platform administrative metrics
 */
export async function getAdminMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const totalBusinessesRes = await query("SELECT COUNT(*) as count FROM `businesses`");
    const totalUsersRes = await query("SELECT COUNT(*) as count FROM `users`");
    const totalCustomersRes = await query("SELECT COUNT(*) as count FROM `customers`");
    const totalRevenueRes = await query("SELECT SUM(amount) as sum FROM `payment_transactions` WHERE `status` = 'success'");
    const activeSubRes = await query("SELECT COUNT(*) as count FROM `subscriptions` WHERE `status` = 'active'");
    const trialRes = await query("SELECT COUNT(*) as count FROM `subscriptions` WHERE `status` = 'trial'");
    const cancelledRes = await query("SELECT COUNT(*) as count FROM `subscriptions` WHERE `status` = 'cancelled'");
    const expiredRes = await query("SELECT COUNT(*) as count FROM `subscriptions` WHERE `status` = 'expired' OR (`status` = 'trial' AND `renewal_date` < NOW())");
    const pendingPaymentsRes = await query("SELECT COUNT(*) as count FROM `payment_transactions` WHERE `status` = 'pending'");
    const monthlyRevRes = await query(`
      SELECT SUM(amount) as sum FROM \`payment_transactions\` 
      WHERE \`status\` = 'success' 
      AND MONTH(\`created_at\`) = MONTH(CURRENT_DATE()) 
      AND YEAR(\`created_at\`) = YEAR(CURRENT_DATE())
    `);
    const publishedRes = await query("SELECT COUNT(*) as count FROM `businesses` WHERE `is_published` = 1");
    const pendingRes = await query("SELECT COUNT(*) as count FROM `businesses` WHERE `is_published` = 0 OR `is_published` IS NULL");

    res.json({
      status: "success",
      data: {
        totalBusinesses: totalBusinessesRes[0]?.count || 0,
        totalUsers: totalUsersRes[0]?.count || 0,
        totalCustomers: totalCustomersRes[0]?.count || 0,
        totalRevenue: totalRevenueRes[0]?.sum || 0,
        activeSubscriptions: activeSubRes[0]?.count || 0,
        trialAccounts: trialRes[0]?.count || 0,
        cancelledSubscriptions: cancelledRes[0]?.count || 0,
        expiredTrials: expiredRes[0]?.count || 0,
        pendingPayments: pendingPaymentsRes[0]?.count || 0,
        monthlyRevenue: monthlyRevRes[0]?.sum || 0,
        publishedWebsites: publishedRes[0]?.count || 0,
        pendingWebsites: pendingRes[0]?.count || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all registered tenant businesses (supports keyword searching)
 */
export async function getBusinesses(req: Request, res: Response, next: NextFunction): Promise<void> {
  const searchTerm = req.query.search || "";
  try {
    let sql = `
      SELECT b.*, u.email as owner_email, u.full_name as owner_name, s.plan_id as current_plan, s.status as subscription_status, s.renewal_date
      FROM \`businesses\` b 
      LEFT JOIN \`users\` u ON u.business_id = b.id AND u.role = 'owner'
      LEFT JOIN \`subscriptions\` s ON s.business_id = b.id
    `;
    const params = [];
    if (searchTerm) {
      sql += " WHERE b.name LIKE ? OR b.subdomain LIKE ? OR u.email LIKE ?";
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
    sql += " ORDER BY b.id DESC";
    
    const list = await query(sql, params);
    res.json({ status: "success", data: list });
  } catch (error) {
    next(error);
  }
}

/**
 * Suspend/Activate/Trial status update of business tenants
 */
export async function updateBusinessStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ status: "error", message: "Status is required." });
    return;
  }

  try {
    await query("UPDATE `businesses` SET `status` = ? WHERE `id` = ?", [status, id]);
    res.json({ status: "success", message: "Business status updated successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * Hard delete a business and clean all child FK constraints
 */
export async function deleteBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  try {
    await query("DELETE FROM `payments` WHERE `business_id` = ?", [id]);
    await query("DELETE FROM `bookings` WHERE `business_id` = ?", [id]);
    await query("DELETE FROM `order_items` WHERE `order_id` IN (SELECT id FROM `orders` WHERE `business_id` = ?)", [id]);
    await query("DELETE FROM `orders` WHERE `business_id` = ?", [id]);
    await query("DELETE FROM `catalog_products` WHERE `business_id` = ?", [id]);
    await query("DELETE FROM `customers` WHERE `business_id` = ?", [id]);
    await query("DELETE FROM `users` WHERE `business_id` = ?", [id]);
    await query("DELETE FROM `businesses` WHERE `id` = ?", [id]);
    
    res.json({ status: "success", message: "Business deleted successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * Announcements CRUD Endpoints
 */
export async function listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await query("SELECT * FROM `announcements` ORDER BY id DESC");
    res.json({ status: "success", data: list });
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ status: "error", message: "Title and content are required." });
    return;
  }
  try {
    await query("INSERT INTO `announcements` (`title`, `content`) VALUES (?, ?)", [title, content]);
    res.status(201).json({ status: "success", message: "Announcement created successfully." });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  try {
    await query("DELETE FROM `announcements` WHERE `id` = ?", [id]);
    res.json({ status: "success", message: "Announcement deleted successfully." });
  } catch (error) {
    next(error);
  }
}
