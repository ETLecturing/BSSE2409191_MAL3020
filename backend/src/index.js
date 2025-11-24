import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Allow frontend & LAN devices
app.use(
  cors({
    origin: "*", // allow all for LAN and mobile devices
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


// Only start server + DB if NOT in testing mode

let server = null;
export let io = null;

if (process.env.NODE_ENV !== "test") {
  console.log("🌐 Normal mode detected — starting server & DB");

  // Connect to real MongoDB
  connectDB();

  // Create HTTP server
  server = http.createServer(app);

  // WebSocket setup
  io = new Server(server, {
    cors: {
      origin: "*", // allow all devices on same WiFi network
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 WebSocket Client Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 WebSocket Client Disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 5000;

  // Listen on ALL network interfaces for LAN support
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server & WebSocket running on LAN port ${PORT}`);
  });
} else {
  console.log("🧪 TEST MODE: Server & WebSockets Disabled");
}


// REST API ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API Running ✔ (LAN Ready, Test Safe, WebSocket Enabled)");
});

// Debugging only
console.log("NODE_ENV:", process.env.NODE_ENV);

// Export only the app for Supertest (no server)
export default app;
