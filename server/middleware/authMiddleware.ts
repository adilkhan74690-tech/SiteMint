import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt.js";

// Extend Express Request interface to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate requests via JWT access tokens.
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      message: "Authentication token is missing. Please provide a valid Bearer token in headers."
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      status: "error",
      message: "Authentication token has expired or is invalid.",
      code: "TOKEN_EXPIRED"
    });
  }
}

/**
 * Middleware to restrict access to specific roles.
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "User is not authenticated."
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        message: "Access denied. Your role does not possess the permissions required to perform this action."
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to guarantee strict tenant-level database query isolation.
 */
export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      message: "User context not identified."
    });
    return;
  }

  // Set header or confirm that any tenant parameter in query/body matches the authenticated user's tenant
  const requestBusinessId = req.headers["x-business-id"] || req.query.business_id || req.body.business_id;

  if (requestBusinessId && Number(requestBusinessId) !== Number(req.user.businessId)) {
    res.status(403).json({
      status: "error",
      message: "Access Denied. Cross-tenant data inspection is strictly prohibited."
    });
    return;
  }

  next();
}
