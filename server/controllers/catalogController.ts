import { Request, Response, NextFunction } from "express";
import { query } from "../config/database.js";

/**
 * 1. PRODUCTS WORKFLOWS
 */

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  let businessId = req.query.business_id || req.user?.businessId;
  const { subdomain } = req.query;

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
    const products = await query(
      "SELECT * FROM `products` WHERE `business_id` = ? AND `is_active` = TRUE ORDER BY `id` DESC",
      [businessId]
    );
    res.json({ status: "success", data: products });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { name, description, price, compare_at_price, sku, inventory_qty, is_active, image_url } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  if (!name || price === undefined) {
    res.status(400).json({ status: "error", message: "Product name and price are required." });
    return;
  }

  // Generate URL-friendly slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  try {
    const [result]: any = await query(
      `INSERT INTO \`products\` (\`business_id\`, \`name\`, \`slug\`, \`description\`, \`price\`, \`compare_at_price\`, \`sku\`, \`inventory_qty\`, \`is_active\`, \`image_url\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        businessId,
        name,
        slug,
        description !== undefined ? description : null,
        Number(price),
        compare_at_price !== undefined ? Number(compare_at_price) : null,
        sku !== undefined ? sku : null,
        inventory_qty !== undefined ? Number(inventory_qty) : 0,
        is_active !== false,
        image_url || null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Product added successfully.",
      data: { id: result.insertId, slug }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { name, description, price, compare_at_price, sku, inventory_qty, is_active, image_url } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query(
      `UPDATE \`products\` 
       SET \`name\` = COALESCE(?, \`name\`),
           \`description\` = COALESCE(?, \`description\`),
           \`price\` = COALESCE(?, \`price\`),
           \`compare_at_price\` = COALESCE(?, \`compare_at_price\`),
           \`sku\` = COALESCE(?, \`sku\`),
           \`inventory_qty\` = COALESCE(?, \`inventory_qty\`),
           \`is_active\` = COALESCE(?, \`is_active\`),
           \`image_url\` = COALESCE(?, \`image_url\`)
       WHERE \`id\` = ? AND \`business_id\` = ?`,
      [
        name !== undefined ? name : null,
        description !== undefined ? description : null,
        price !== undefined ? Number(price) : null,
        compare_at_price !== undefined ? Number(compare_at_price) : null,
        sku !== undefined ? sku : null,
        inventory_qty !== undefined ? Number(inventory_qty) : null,
        is_active !== undefined ? is_active : null,
        image_url !== undefined ? image_url : null,
        id,
        businessId
      ]
    );

    res.json({ status: "success", message: "Product updated successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. SERVICES WORKFLOWS
 */

export async function listServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  let businessId = req.query.business_id || req.user?.businessId;
  const { subdomain } = req.query;

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
    const services = await query(
      "SELECT * FROM `services` WHERE `business_id` = ? AND `is_active` = TRUE ORDER BY `sort_order` ASC, `id` DESC",
      [businessId]
    );
    res.json({ status: "success", data: services });
  } catch (error) {
    next(error);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { name, description, duration_minutes, price, capacity, is_active, image_url,
          offer_price, category, featured_badge, sort_order, availability } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  if (!name || !duration_minutes || price === undefined) {
    res.status(400).json({ status: "error", message: "Service name, duration, and price are required." });
    return;
  }

  try {
    const [result]: any = await query(
      `INSERT INTO \`services\` (\`business_id\`, \`name\`, \`description\`, \`duration_minutes\`, \`price\`, \`capacity\`, \`is_active\`, \`image_url\`,
                                 \`offer_price\`, \`category\`, \`featured_badge\`, \`sort_order\`, \`availability\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        businessId,
        name,
        description !== undefined ? description : null,
        Number(duration_minutes),
        Number(price),
        capacity !== undefined ? Number(capacity) : 1,
        is_active !== false,
        image_url || null,
        offer_price !== undefined ? Number(offer_price) : null,
        category || null,
        featured_badge || null,
        sort_order !== undefined ? Number(sort_order) : 0,
        availability || null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Service added successfully.",
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;
  const { name, description, duration_minutes, price, capacity, is_active, image_url,
          offer_price, category, featured_badge, sort_order, availability } = req.body;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query(
      `UPDATE \`services\` 
       SET \`name\` = COALESCE(?, \`name\`),
           \`description\` = COALESCE(?, \`description\`),
           \`duration_minutes\` = COALESCE(?, \`duration_minutes\`),
           \`price\` = COALESCE(?, \`price\`),
           \`capacity\` = COALESCE(?, \`capacity\`),
           \`is_active\` = COALESCE(?, \`is_active\`),
           \`image_url\` = COALESCE(?, \`image_url\`),
           \`offer_price\` = COALESCE(?, \`offer_price\`),
           \`category\` = COALESCE(?, \`category\`),
           \`featured_badge\` = COALESCE(?, \`featured_badge\`),
           \`sort_order\` = COALESCE(?, \`sort_order\`),
           \`availability\` = COALESCE(?, \`availability\`)
       WHERE \`id\` = ? AND \`business_id\` = ?`,
      [
        name !== undefined ? name : null,
        description !== undefined ? description : null,
        duration_minutes !== undefined ? Number(duration_minutes) : null,
        price !== undefined ? Number(price) : null,
        capacity !== undefined ? Number(capacity) : null,
        is_active !== undefined ? is_active : null,
        image_url !== undefined ? image_url : null,
        offer_price !== undefined ? Number(offer_price) : null,
        category !== undefined ? category : null,
        featured_badge !== undefined ? featured_badge : null,
        sort_order !== undefined ? Number(sort_order) : null,
        availability !== undefined ? availability : null,
        id,
        businessId
      ]
    );

    res.json({ status: "success", message: "Service updated successfully." });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query("DELETE FROM `products` WHERE `id` = ? AND `business_id` = ?", [id, businessId]);
    res.json({ status: "success", message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  const businessId = req.user?.businessId;
  const { id } = req.params;

  if (!businessId) {
    res.status(401).json({ status: "error", message: "Unauthorized tenant." });
    return;
  }

  try {
    await query("DELETE FROM `services` WHERE `id` = ? AND `business_id` = ?", [id, businessId]);
    res.json({ status: "success", message: "Service deleted successfully." });
  } catch (error) {
    next(error);
  }
}
