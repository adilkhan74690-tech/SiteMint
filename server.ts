import dotenv from "dotenv";
dotenv.config();

import http from "http";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./server/app.ts";
import { initSocket } from "./server/services/socketService.ts";
import { initializeDatabase } from "./server/config/database.ts";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Initialize and check database and schemas before starting server
  try {
    await initializeDatabase();
  } catch (dbError) {
    console.error("❌ Critical: Database initialization failed. Stopping startup process.", dbError);
    process.exit(1);
  }

  // 1. Create native HTTP server wrapping our Express application instance
  const server = http.createServer(app);

  // 2. Attach Socket.IO real-time notification engine
  initSocket(server);

  // 3. Mount Vite assets pipeline conditionally based on current environment
  const isProduction = process.env.NODE_ENV === "production" || __filename.includes("server.cjs") || __dirname.includes("dist");
  if (!isProduction) {
    console.log("🛠️  Development mode detected. Injecting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });

    // Vite handles client-side asset compiling and route fallback
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Production mode detected. Serving compiled static distribution assets...");
    const distPath = path.join(process.cwd(), "dist");

    // Serve production static assets from /dist
    app.use(express.static(distPath));

    // Fallback all secondary requests to Single-Page App index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 4. Start listening on unified port 3000
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(`⚡ SiteMint Server running on port ${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((error) => {
  console.error("🔥 Server startup fatal error:", error);
  process.exit(1);
});
