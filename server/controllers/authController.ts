import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { query, getConnection, isConfigured } from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

/**
 * Handle multi-tenant registration of a new Business and its Owner.
 */
export async function registerBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { name, subdomain, contact_email, contact_phone, full_name, password } = req.body;

  if (!name || !subdomain || !contact_email || !full_name || !password) {
    res.status(400).json({
      status: "error",
      message: "Please provide all required fields: name, subdomain, contact_email, full_name, and password."
    });
    return;
  }

  const hashedPassword = await hashPassword(password);
  const businessUuid = crypto.randomUUID();

  // Live database transaction
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Insert the Business
    const [bizResult]: any = await connection.execute(
      `INSERT INTO \`businesses\` (\`uuid\`, \`name\`, \`subdomain\`, \`contact_email\`, \`contact_phone\`, \`status\`) 
       VALUES (?, ?, ?, ?, ?, 'trial')`,
      [businessUuid, name, subdomain, contact_email, contact_phone || null]
    );
    const businessId = bizResult.insertId;

    // 2. Insert the User (Owner)
    const [userResult]: any = await connection.execute(
      `INSERT INTO \`users\` (\`business_id\`, \`email\`, \`password_hash\`, \`full_name\`, \`role\`, \`status\`) 
       VALUES (?, ?, ?, ?, 'owner', 'active')`,
      [businessId, contact_email, hashedPassword, full_name]
    );
    const userId = userResult.insertId;

    // 3. Create Default Theme Settings (Defaulting to Template Code 'gym' / Template ID 1)
    // Find template ID or insert a default template if none exist
    let [templates]: any = await connection.execute("SELECT id FROM templates LIMIT 1");
    let templateId;
    if (templates.length > 0) {
      templateId = templates[0].id;
    } else {
      const [newTemplateResult]: any = await connection.execute(
        `INSERT INTO \`templates\` (\`code\`, \`name\`, \`category\`, \`is_active\`) 
         VALUES ('gym', 'Apex Gym', 'Fitness', TRUE)`
      );
      templateId = newTemplateResult.insertId;
    }

    await connection.execute(
      `INSERT INTO \`theme_settings\` (\`business_id\`, \`template_id\`, \`primary_color\`, \`secondary_color\`, \`font_family\`) 
       VALUES (?, ?, '#10B981', '#111827', 'Inter')`,
      [businessId, templateId]
    );

    await connection.commit();

    const accessToken = generateAccessToken({
      userId,
      businessId,
      email: contact_email,
      role: "owner"
    });

    const refreshToken = generateRefreshToken({
      userId,
      businessId,
      email: contact_email,
      role: "owner"
    });

    // Save refresh token to user
    await connection.execute(
      "UPDATE `users` SET `refresh_token` = ? WHERE `id` = ?",
      [refreshToken, userId]
    );

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      status: "success",
      message: "Business and owner registered successfully.",
      data: {
        business: { id: businessId, uuid: businessUuid, name, subdomain, contact_email },
        user: { id: userId, email: contact_email, full_name, role: "owner" },
        token: accessToken
      }
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    
    // Gracefully handle duplicate entries (MySQL code 1062 or code "ER_DUP_ENTRY")
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      const errorMsg = error.message || "";
      if (errorMsg.includes("subdomain")) {
        res.status(409).json({
          status: "error",
          message: "The requested subdomain is already registered by another tenant. Please select a different subdomain."
        });
        return;
      }
      if (errorMsg.includes("email") || errorMsg.includes("users")) {
        res.status(409).json({
          status: "error",
          message: "An owner or employee is already registered with this email address."
        });
        return;
      }
      res.status(409).json({
        status: "error",
        message: "Registration conflict: A business or user with these details is already registered."
      });
      return;
    }
    
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Staff and Owner Authenticate/Login Controller
 */
export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email, password, subdomain } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Please provide both email and password."
    });
    return;
  }  try {
    let sql = "SELECT u.*, b.status as business_status, b.upi_id as business_upi FROM `users` u LEFT JOIN `businesses` b ON u.business_id = b.id WHERE u.email = ?";
    let params = [email];

    if (subdomain && subdomain !== "undefined" && subdomain !== "null") {
      sql += " AND b.subdomain = ?";
      params.push(subdomain);
    }

    const users: any = await query(sql, params);

    if (users.length === 0) {
      res.status(401).json({
        status: "error",
        message: "Invalid email, password, or subdomain registry."
      });
      return;
    }

    const user = users[0];

    if (user.business_status === "suspended") {
      res.status(403).json({
        status: "error",
        message: "This business tenant has been suspended. Please contact customer support."
      });
      return;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        status: "error",
        message: "Invalid credentials."
      });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      businessId: user.business_id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Persist refresh token
    await query("UPDATE `users` SET `refresh_token` = ? WHERE `id` = ?", [refreshToken, user.id]);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      status: "success",
      message: "Logged in successfully.",
      data: {
        token: accessToken,
        user: {
          id: user.id,
          business_id: user.business_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          status: user.status,
          onboarded: !!user.business_upi
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh Access Token using Refresh Token
 */
export async function refreshSessionToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const refreshToken = req.cookies.refreshToken || req.body.refresh_token;

  if (!refreshToken) {
    res.status(400).json({
      status: "error",
      message: "Refresh token is missing. Please provide it in cookies or request body."
    });
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const users: any = await query(
      "SELECT id, refresh_token FROM `users` WHERE `id` = ?",
      [decoded.userId]
    );

    if (users.length === 0 || users[0].refresh_token !== refreshToken) {
      res.status(401).json({
        status: "error",
        message: "Invalid or revoked session refresh token."
      });
      return;
    }

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      businessId: decoded.businessId,
      email: decoded.email,
      role: decoded.role
    });

    res.json({
      status: "success",
      data: { token: newAccessToken }
    });
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Refresh token is expired or altered."
    });
  }
}

/**
 * Revoke and Log out User Session
 */
export async function logoutUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const refreshToken = req.cookies.refreshToken || req.body.refresh_token;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await query("UPDATE `users` SET `refresh_token` = NULL WHERE `id` = ?", [decoded.userId]);
    } catch (e) {
      // Ignore token verification errors during logout
    }
  }

  res.clearCookie("refreshToken");
  res.json({
    status: "success",
    message: "Logged out and invalidated session successfully."
  });
}
