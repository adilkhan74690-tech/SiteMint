import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { query, getConnection, isConfigured } from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

/**
 * Handle multi-tenant registration of a new Business and its Owner.
 */
export async function registerBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { contact_email, full_name, password } = req.body;

  if (!contact_email || !full_name || !password) {
    res.status(400).json({
      status: "error",
      message: "Please provide all required fields: contact_email, full_name, and password."
    });
    return;
  }

  const hashedPassword = await hashPassword(password);

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // Verify if the email is already in use
    const [existingUsers]: any = await connection.execute(
      "SELECT id FROM `users` WHERE `email` = ?",
      [contact_email]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({
        status: "error",
        message: "An owner or employee is already registered with this email address."
      });
      await connection.rollback();
      return;
    }

    // Insert the User (Owner) with a NULL business context
    const [userResult]: any = await connection.execute(
      `INSERT INTO \`users\` (\`business_id\`, \`email\`, \`password_hash\`, \`full_name\`, \`role\`, \`status\`) 
       VALUES (NULL, ?, ?, ?, 'owner', 'active')`,
      [contact_email, hashedPassword, full_name]
    );
    const userId = userResult.insertId;

    await connection.commit();

    const accessToken = generateAccessToken({
      userId,
      businessId: null as any,
      email: contact_email,
      role: "owner"
    });

    const refreshToken = generateRefreshToken({
      userId,
      businessId: null as any,
      email: contact_email,
      role: "owner"
    });

    // Save refresh token to user record
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
      message: "Owner registered successfully.",
      data: {
        user: { id: userId, email: contact_email, full_name, role: "owner" },
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
    let sql = "SELECT u.*, b.status as business_status, b.owner_id as business_owner_id, b.is_completed as business_is_completed FROM `users` u LEFT JOIN `businesses` b ON u.business_id = b.id WHERE u.email = ?";
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

    // Auto-link existing business if business_id is null to prevent context loss
    if (user.role === "owner" && !user.business_id) {
      const existingBiz: any = await query("SELECT id, status, owner_id, is_completed FROM `businesses` WHERE `owner_id` = ? LIMIT 1", [user.id]);
      if (existingBiz.length > 0) {
        user.business_id = existingBiz[0].id;
        user.business_status = existingBiz[0].status;
        user.business_owner_id = existingBiz[0].owner_id;
        user.business_is_completed = existingBiz[0].is_completed;
        await query("UPDATE `users` SET `business_id` = ? WHERE `id` = ?", [user.business_id, user.id]);
      }
    }

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

    const onboarded = !!(user.business_id && (user.business_owner_id || user.business_is_completed));

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
          onboarded
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

/**
 * Get dynamic profile details and onboarding status of the current user
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ status: "error", message: "Unauthorized context." });
    return;
  }

  try {
    const users: any = await query(
      `SELECT u.*, b.status as business_status, b.owner_id as business_owner_id, b.is_completed as business_is_completed 
       FROM \`users\` u 
       LEFT JOIN \`businesses\` b ON u.business_id = b.id 
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ status: "error", message: "User registry not found." });
      return;
    }

    let user = users[0];

    // Auto-link existing business if business_id is null to prevent context loss
    if (user.role === "owner" && !user.business_id) {
      const existingBiz: any = await query("SELECT id, status, owner_id, is_completed FROM `businesses` WHERE `owner_id` = ? LIMIT 1", [user.id]);
      if (existingBiz.length > 0) {
        user.business_id = existingBiz[0].id;
        user.business_status = existingBiz[0].status;
        user.business_owner_id = existingBiz[0].owner_id;
        user.business_is_completed = existingBiz[0].is_completed;
        await query("UPDATE `users` SET `business_id` = ? WHERE `id` = ?", [user.business_id, user.id]);
      }
    }

    const onboarded = !!(user.business_id && (user.business_owner_id || user.business_is_completed));

    res.json({
      status: "success",
      data: {
        user: {
          id: user.id,
          business_id: user.business_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          status: user.status,
          onboarded
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
