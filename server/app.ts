import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/api.js";
import { globalErrorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Apply production security headers (conditionally disabling strict CSP in dev for Vite integration)
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? undefined // Standard secure defaults
        : false, // Disabled in dev to prevent blocking hot reloads and inline assets
    crossOriginEmbedderPolicy: false
  })
);

// Configure CORS for cross-origin client integration
app.use(
  cors({
    origin: true, // Echo request origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Business-ID"]
  })
);

// Standard request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount the unified multi-tenant API router
app.use("/api", apiRouter);

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    service: "SiteMint Backend Service Engine"
  });
});

// Register global error handler
app.use(globalErrorHandler);

export default app;
