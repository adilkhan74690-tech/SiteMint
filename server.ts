import dotenv from "dotenv";
dotenv.config();

import http from "http";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./server/app.ts";
import { initSocket } from "./server/services/socketService.ts";

const PORT = 3000;

async function startServer() {
  // 1. Create native HTTP server wrapping our Express application instance
  const server = http.createServer(app);

  // 2. Attach Socket.IO real-time notification engine
  initSocket(server);

  // 3. Mount Vite assets pipeline conditionally based on current environment
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`⚡ SiteMint Server running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((error) => {
  console.error("🔥 Server startup fatal error:", error);
  process.exit(1);
});
