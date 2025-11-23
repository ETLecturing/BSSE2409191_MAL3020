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

// Allow frontend + LAN access
app.use(
  cors({
    origin: "*", // allow all for LAN testing
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Only connect DB + start server if NOT running tests

let server = null;
export let io = null;

if (process.env.NODE_ENV !== "test") {
  console.log("🌐 Normal mode detected — starting server & DB");

  // Connect to real DB
  connectDB();

  // Create server with WebSocket support
  server = http.createServer(app);

  // Create WebSocket instance
  io = new Server(server, {
    cors: {
      origin: "*", // allow any device on LAN
      methods: ["GET", "POST"],
    },
  });

  // WebSocket events
  io.on("connection", (socket) => {
    console.log("🟢 Client Connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Client Disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(` Server with WebSocket running on port ${PORT}`);
  });
} else {
  console.log(" TEST MODE: Server & WebSockets disabled");
}

// REST API ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API Running ✔ (Test-Safe, WebSocket-Ready)");
});

// Export ONLY the app for unit/integration testing
console.log("NODE_ENV:", process.env.NODE_ENV);

export default app;
