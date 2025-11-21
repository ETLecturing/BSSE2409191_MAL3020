import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./db.js";
import menuRoutes from "./routes/menu.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/restaurantdb";

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Backend running on http://localhost:${PORT}`)
  );
});
