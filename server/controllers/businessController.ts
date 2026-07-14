import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { query, getConnection } from "../config/database.js";
import { verifyAccessToken, generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

/**
 * Fetch a Business Tenant's core branding, theme settings, and associated template configs.
 */
export async function getBusinessSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  let { subdomain, domain, business_id } = req.query;

  // Extract bearer token from Authorization header if available to auto-resolve business ID
  const authHeader = req.headers.authorization;
  let decodedUser: any = null;
  if (!business_id && authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      decodedUser = verifyAccessToken(token);
      business_id = String(decodedUser.businessId);
    } catch (e) {
      // Ignore invalid/expired token and proceed with other parameters
    }
  }

  if (!subdomain && !domain && !business_id) {
    res.status(400).json({
      status: "error",
      message: "Please specify either business_id, subdomain, or domain in query parameters."
    });
    return;
  }

  try {
    let biz: any[] = [];
    if (business_id) {
      biz = await query("SELECT * FROM `businesses` WHERE `id` = ?", [business_id]);
    } else if (subdomain) {
      biz = await query("SELECT * FROM `businesses` WHERE `subdomain` = ?", [subdomain]);
    } else if (domain) {
      biz = await query("SELECT * FROM `businesses` WHERE `custom_domain` = ?", [domain]);
    }

    if (biz.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Business tenant registry not found."
      });
      return;
    }

    const business = biz[0];

    // Fetch the name of the user to welcome back
    let ownerName = "Owner";
    const userId = decodedUser?.userId;
    if (userId) {
      const users: any[] = await query("SELECT full_name FROM `users` WHERE `id` = ? LIMIT 1", [userId]);
      if (users.length > 0) {
        ownerName = users[0].full_name;
      }
    } else {
      const owners: any[] = await query("SELECT full_name FROM `users` WHERE `business_id` = ? AND `role` = 'owner' LIMIT 1", [business.id]);
      if (owners.length > 0) {
        ownerName = owners[0].full_name;
      }
    }

    // Get theme settings and joined template data
    const themes: any[] = await query(
      `SELECT ts.*, t.code as template_code, t.name as template_name, t.category as template_category 
       FROM \`theme_settings\` ts 
       JOIN \`templates\` t ON ts.template_id = t.id 
       WHERE ts.business_id = ?`,
      [business.id]
    );

    const theme = themes.length > 0 ? themes[0] : null;

    res.json({
      status: "success",
      data: {
        business,
        owner_name: ownerName,
        theme_settings: theme ? {
          primary_color: theme.primary_color,
          secondary_color: theme.secondary_color,
          font_family: theme.font_family,
          custom_css: theme.custom_css,
          custom_settings_json: theme.custom_settings_json,
          template: {
            code: theme.template_code,
            name: theme.template_name,
            category: theme.template_category
          }
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update business branding and custom CSS configurations.
 */
export async function updateThemeSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { primary_color, secondary_color, font_family, custom_css, custom_settings_json, template_id } = req.body;
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    // Check if theme settings exist
    const currentTheme: any[] = await query("SELECT id FROM `theme_settings` WHERE `business_id` = ?", [businessId]);

    if (currentTheme.length === 0) {
      // Create theme setting if absent
      const activeTemplateId = template_id || 1;
      await query(
        `INSERT INTO \`theme_settings\` (\`business_id\`, \`template_id\`, \`primary_color\`, \`secondary_color\`, \`font_family\`, \`custom_css\`, \`custom_settings_json\`)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          businessId,
          activeTemplateId,
          primary_color || "#10B981",
          secondary_color || "#111827",
          font_family || "Inter",
          custom_css || null,
          custom_settings_json ? JSON.stringify(custom_settings_json) : null
        ]
      );
    } else {
      // Update existing theme setting
      await query(
        `UPDATE \`theme_settings\` 
         SET \`primary_color\` = COALESCE(?, \`primary_color\`), 
             \`secondary_color\` = COALESCE(?, \`secondary_color\`), 
             \`font_family\` = COALESCE(?, \`font_family\`), 
             \`custom_css\` = COALESCE(?, \`custom_css\`), 
             \`custom_settings_json\` = COALESCE(?, \`custom_settings_json\`) 
         WHERE \`business_id\` = ?`,
        [
          primary_color,
          secondary_color,
          font_family,
          custom_css,
          custom_settings_json ? JSON.stringify(custom_settings_json) : null,
          businessId
        ]
      );
    }

    res.json({
      status: "success",
      message: "Tenant theme settings updated successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch available template designs curated by SiteMint.
 */
export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const templates = await query("SELECT * FROM `templates` WHERE `is_active` = TRUE");
    res.json({
      status: "success",
      data: templates
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Onboard business details and selected layout/theme settings.
 */
export async function onboardBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  const {
    name,
    business_type,
    contact_phone,
    address,
    description,
    subdomain,
    upi_id,
    logo_url,
    template_id,
    primary_color,
    secondary_color,
    font_family
  } = req.body;
  
  const businessId = req.user?.businessId;

  if (!name || !subdomain || !upi_id || !business_type) {
    res.status(400).json({ status: "error", message: "Name, subdomain, upi_id, and business_type are required." });
    return;
  }

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    let activeBusinessId = businessId;

    if (!activeBusinessId) {
      // 1. Verify subdomain uniqueness during onboarding
      const [subdomainCheck]: any = await connection.execute(
        "SELECT id FROM `businesses` WHERE `subdomain` = ?",
        [subdomain]
      );

      if (subdomainCheck.length > 0) {
        res.status(409).json({
          status: "error",
          message: "This subdomain/business slug is already in use by another tenant."
        });
        await connection.rollback();
        return;
      }

      // 2. Create the new Business
      const businessUuid = crypto.randomUUID();
      const [bizResult]: any = await connection.execute(
        `INSERT INTO \`businesses\` (\`uuid\`, \`name\`, \`subdomain\`, \`contact_email\`, \`contact_phone\`, \`status\`, \`owner_id\`, \`is_completed\`) 
         VALUES (?, ?, ?, ?, ?, 'trial', ?, TRUE)`,
        [businessUuid, name, subdomain, req.user?.email, contact_phone || null, req.user?.userId]
      );
      activeBusinessId = bizResult.insertId;

      // 3. Bind user profile to new business
      await connection.execute(
        "UPDATE `users` SET `business_id` = ? WHERE `id` = ?",
        [activeBusinessId, req.user?.userId]
      );

      // Create active starter trial subscription (30 days validity)
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + 30);
      await connection.execute(
        `INSERT INTO \`subscriptions\` (\`business_id\`, \`plan_id\`, \`status\`, \`renewal_date\`)
         VALUES (?, 'starter', 'trial', ?)`,
        [activeBusinessId, renewalDate]
      );
    } else {
      // Check subdomain conflicts against other tenants
      const [subdomainCheck]: any = await connection.execute(
        "SELECT id FROM `businesses` WHERE `subdomain` = ? AND `id` != ?",
        [subdomain, activeBusinessId]
      );

      if (subdomainCheck.length > 0) {
        res.status(409).json({
          status: "error",
          message: "This subdomain/business slug is already in use by another tenant."
        });
        await connection.rollback();
        return;
      }

      // Update current business profile
      await connection.execute(
        `UPDATE \`businesses\` 
         SET \`name\` = ?, \`business_type\` = ?, \`contact_phone\` = ?, \`address\` = ?, \`description\` = ?, \`subdomain\` = ?, \`upi_id\` = ?, \`logo_url\` = ?
         WHERE \`id\` = ?`,
        [
          name,
          business_type,
          contact_phone || null,
          address || null,
          description || null,
          subdomain,
          upi_id,
          logo_url || null,
          activeBusinessId
        ]
      );

      // Check if subscription exists, if not, create default starter trial
      const [existingSubs]: any = await connection.execute(
        "SELECT id FROM `subscriptions` WHERE `business_id` = ?",
        [activeBusinessId]
      );
      if (existingSubs.length === 0) {
        const renewalDate = new Date();
        renewalDate.setDate(renewalDate.getDate() + 30);
        await connection.execute(
          `INSERT INTO \`subscriptions\` (\`business_id\`, \`plan_id\`, \`status\`, \`renewal_date\`)
           VALUES (?, 'starter', 'trial', ?)`,
          [activeBusinessId, renewalDate]
        );
      }
    }

    // 4. Create or update theme variables settings
    const [currentTheme]: any = await connection.execute(
      "SELECT id FROM `theme_settings` WHERE `business_id` = ?",
      [activeBusinessId]
    );

    const activeTemplateId = template_id || 1;
    if (currentTheme.length === 0) {
      await connection.execute(
        `INSERT INTO \`theme_settings\` (\`business_id\`, \`template_id\`, \`primary_color\`, \`secondary_color\`, \`font_family\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          activeBusinessId,
          activeTemplateId,
          primary_color || "#10B981",
          secondary_color || "#111827",
          font_family || "Inter"
        ]
      );
    } else {
      await connection.execute(
        `UPDATE \`theme_settings\` 
         SET \`template_id\` = ?, \`primary_color\` = ?, \`secondary_color\` = ?, \`font_family\` = ?
         WHERE \`business_id\` = ?`,
        [
          activeTemplateId,
          primary_color || "#10B981",
          secondary_color || "#111827",
          font_family || "Inter",
          activeBusinessId
        ]
      );
    }

    // 5. Append system operational logs
    await connection.execute(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'business_onboarding_completed', ?)`,
      [activeBusinessId, JSON.stringify({ name, subdomain, business_type, upi_id })]
    );

    await connection.commit();

    // Generate new Access and Refresh tokens containing the new businessId!
    const tokenPayload = {
      userId: req.user?.userId || 0,
      businessId: activeBusinessId,
      email: req.user?.email || "",
      role: req.user?.role || "owner"
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to user record
    await connection.execute(
      "UPDATE `users` SET `refresh_token` = ? WHERE `id` = ?",
      [refreshToken, req.user?.userId]
    );

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      status: "success",
      message: "Business onboarded successfully.",
      data: {
        business_id: activeBusinessId,
        token: accessToken
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
 * Publish the business website.
 */
export async function publishBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const userId = req.user?.userId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    await query("UPDATE `businesses` SET `is_published` = TRUE WHERE `id` = ?", [businessId]);
    
    // Log activity
    await query(
      "INSERT INTO `activity_logs` (`business_id`, `user_id`, `action`, `details`) VALUES (?, ?, 'website_published', ?)",
      [businessId, userId || null, "Website successfully published to edge network."]
    );

    res.json({
      status: "success",
      message: "Website published successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all customers for the business with aggregate stats.
 */
export async function listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    const customers = await query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM \`bookings\` b WHERE b.customer_id = c.id) as bookings_count,
              (SELECT COALESCE(SUM(total_amount), 0) FROM \`orders\` o WHERE o.customer_id = c.id) as total_spent
       FROM \`customers\` c
       WHERE c.business_id = ?
       ORDER BY c.created_at DESC`,
      [businessId]
    );

    res.json({
      status: "success",
      data: customers
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all staff members for the business.
 */
export async function listStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    const staff = await query(
      "SELECT id, email, full_name, role, status, staff_title, staff_photo_url, working_days, working_hours, services_assigned FROM `users` WHERE `business_id` = ? AND `role` != 'owner' ORDER BY id ASC",
      [businessId]
    );

    res.json({
      status: "success",
      data: staff
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add a new staff member to the business.
 */
export async function addStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { email, full_name, role, staff_title, staff_photo_url, working_days, working_hours, services_assigned } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  if (!email || !full_name || !role) {
    res.status(400).json({ status: "error", message: "Required fields: email, full_name, role." });
    return;
  }

  try {
    const dummyPasswordHash = "$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhashdu"; // bcrypt default format dummy
    await query(
      "INSERT INTO `users` (`business_id`, `email`, `password_hash`, `full_name`, `role`, `status`, `staff_title`, `staff_photo_url`, `working_days`, `working_hours`, `services_assigned`) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)",
      [
        businessId,
        email,
        dummyPasswordHash,
        full_name,
        role,
        staff_title || null,
        staff_photo_url || null,
        working_days || null,
        working_hours || null,
        services_assigned || null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Staff member added successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update staff member details.
 */
export async function updateStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { email, full_name, role, staff_title, staff_photo_url, working_days, working_hours, services_assigned } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    await query(
      "UPDATE `users` SET `email` = ?, `full_name` = ?, `role` = ?, `staff_title` = ?, `staff_photo_url` = ?, `working_days` = ?, `working_hours` = ?, `services_assigned` = ? WHERE `id` = ? AND `business_id` = ?",
      [
        email,
        full_name,
        role,
        staff_title || null,
        staff_photo_url || null,
        working_days || null,
        working_hours || null,
        services_assigned || null,
        id,
        businessId
      ]
    );

    res.json({
      status: "success",
      message: "Staff member updated successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a staff member from the business.
 */
export async function deleteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    await query("DELETE FROM `users` WHERE `id` = ? AND `business_id` = ?", [id, businessId]);

    res.json({
      status: "success",
      message: "Staff member deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update all business settings in MySQL in a single transaction.
 */
export async function updateBusinessSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  const {
    name, logo_url, banner_url, description, contact_phone, contact_email, address,
    google_maps_location, business_type, subdomain, upi_id, social_links, working_hours,
    seo_title, seo_description, favicon_url, is_published,
    primary_color, secondary_color, font_family, custom_settings_json
  } = req.body;

  try {
    // 1. Update businesses table
    await query(
      `UPDATE \`businesses\`
       SET \`name\` = COALESCE(?, \`name\`),
           \`logo_url\` = ?,
           \`banner_url\` = ?,
           \`description\` = ?,
           \`contact_phone\` = ?,
           \`contact_email\` = COALESCE(?, \`contact_email\`),
           \`address\` = ?,
           \`google_maps_location\` = ?,
           \`business_type\` = ?,
           \`subdomain\` = COALESCE(?, \`subdomain\`),
           \`upi_id\` = ?,
           \`social_links\` = ?,
           \`working_hours\` = ?,
           \`seo_title\` = ?,
           \`seo_description\` = ?,
           \`favicon_url\` = ?,
           \`is_published\` = ?
       WHERE \`id\` = ?`,
      [
        name !== undefined ? name : null,
        logo_url !== undefined ? logo_url : null,
        banner_url !== undefined ? banner_url : null,
        description !== undefined ? description : null,
        contact_phone !== undefined ? contact_phone : null,
        contact_email !== undefined ? contact_email : null,
        address !== undefined ? address : null,
        google_maps_location !== undefined ? google_maps_location : null,
        business_type !== undefined ? business_type : null,
        subdomain !== undefined ? subdomain : null,
        upi_id !== undefined ? upi_id : null,
        social_links !== undefined ? (typeof social_links === 'string' ? social_links : JSON.stringify(social_links)) : null,
        working_hours !== undefined ? (typeof working_hours === 'string' ? working_hours : JSON.stringify(working_hours)) : null,
        seo_title !== undefined ? seo_title : null,
        seo_description !== undefined ? seo_description : null,
        favicon_url !== undefined ? favicon_url : null,
        is_published !== undefined ? (is_published ? 1 : 0) : 0,
        businessId
      ]
    );

    // 2. Update theme settings
    const currentTheme: any[] = await query("SELECT id FROM `theme_settings` WHERE `business_id` = ?", [businessId]);
    if (currentTheme.length === 0) {
      await query(
        `INSERT INTO \`theme_settings\` (\`business_id\`, \`template_id\`, \`primary_color\`, \`secondary_color\`, \`font_family\`, \`custom_settings_json\`)
         VALUES (?, 1, ?, ?, ?, ?)`,
        [
          businessId,
          primary_color || "#10B981",
          secondary_color || "#111827",
          font_family || "Inter",
          custom_settings_json ? (typeof custom_settings_json === 'string' ? custom_settings_json : JSON.stringify(custom_settings_json)) : null
        ]
      );
    } else {
      await query(
        `UPDATE \`theme_settings\`
         SET \`primary_color\` = COALESCE(?, \`primary_color\`),
             \`secondary_color\` = COALESCE(?, \`secondary_color\`),
             \`font_family\` = COALESCE(?, \`font_family\`),
             \`custom_settings_json\` = COALESCE(?, \`custom_settings_json\`)
         WHERE \`business_id\` = ?`,
        [
          primary_color !== undefined ? primary_color : null,
          secondary_color !== undefined ? secondary_color : null,
          font_family !== undefined ? font_family : null,
          custom_settings_json !== undefined ? (typeof custom_settings_json === 'string' ? custom_settings_json : JSON.stringify(custom_settings_json)) : null,
          businessId
        ]
      );
    }

    res.json({
      status: "success",
      message: "Business settings saved successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Take a business website offline / unpublish.
 */
export async function unpublishBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const userId = req.user?.userId;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  try {
    await query("UPDATE `businesses` SET `is_published` = FALSE WHERE `id` = ?", [businessId]);
    
    // Log activity
    await query(
      "INSERT INTO `activity_logs` (`business_id`, `user_id`, `action`, `details`) VALUES (?, ?, 'website_unpublished', ?)",
      [businessId, userId || null, "Website successfully unpublished / taken offline."]
    );

    res.json({
      status: "success",
      message: "Website unpublished successfully."
    });
  } catch (error) {
    next(error);
  }
}
