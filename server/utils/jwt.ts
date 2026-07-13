import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "sitemint-default-access-secret-2026";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "sitemint-default-refresh-secret-2026";

export interface TokenPayload {
  userId: string | number;
  businessId: string | number;
  email: string;
  role: "owner" | "manager" | "staff" | "SUPER_ADMIN" | "OWNER" | "MANAGER" | "STAFF" | "CUSTOMER" | string;
}

/**
 * Generate a cryptographically secure JWT Access Token.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

/**
 * Generate a cryptographically secure JWT Refresh Token.
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

/**
 * Verify a JWT Access Token and decode its payload.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify a JWT Refresh Token and decode its payload.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
