import { Request, Response, NextFunction } from "express";
import { query, getConnection } from "../config/database.js";

/**
 * Fetch a Business Tenant's core branding, theme settings, and associated template configs.
 */
export async function getBusinessSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { subdomain, domain, business_id } = req.query;

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

  if (!businessId) {
    res.status(401).json({ status: "error", message: "User session lacks business tenant context." });
    return;
  }

  if (!name || !subdomain || !upi_id || !business_type) {
    res.status(400).json({ status: "error", message: "Name, subdomain, upi_id, and business_type are required." });
    return;
  }

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // Check if the subdomain is taken by another business
    const [subdomainCheck]: any = await connection.execute(
      "SELECT id FROM `businesses` WHERE `subdomain` = ? AND `id` != ?",
      [subdomain, businessId]
    );

    if (subdomainCheck.length > 0) {
      res.status(409).json({
        status: "error",
        message: "This subdomain/business slug is already in use by another tenant."
      });
      await connection.rollback();
      return;
    }

    // 1. Update Business details
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
        businessId
      ]
    );

    // 2. Insert or update theme settings
    const [currentTheme]: any = await connection.execute(
      "SELECT id FROM `theme_settings` WHERE `business_id` = ?",
      [businessId]
    );

    const activeTemplateId = template_id || 1;
    if (currentTheme.length === 0) {
      await connection.execute(
        `INSERT INTO \`theme_settings\` (\`business_id\`, \`template_id\`, \`primary_color\`, \`secondary_color\`, \`font_family\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          businessId,
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
          businessId
        ]
      );
    }

    // Write activity log
    await connection.execute(
      `INSERT INTO \`activity_logs\` (\`business_id\`, \`action\`, \`details\`) 
       VALUES (?, 'business_onboarding_completed', ?)`,
      [businessId, JSON.stringify({ name, subdomain, business_type, upi_id })]
    );

    await connection.commit();

    res.json({
      status: "success",
      message: "Business onboarded successfully."
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
}
