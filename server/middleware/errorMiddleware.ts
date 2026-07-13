import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Express Global Error Handling Middleware
 */
export function globalErrorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected system error occurred on the server.";

  console.error("🔥 Global Error Handler caught exception:", {
    path: req.path,
    method: req.method,
    message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
  });

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
}
