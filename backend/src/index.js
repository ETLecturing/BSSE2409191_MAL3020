import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./db.js";
import menuRoutes from "./routes/menu.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/menu", menuRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/restaurantdb";

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Backend running on http://localhost:${PORT}`)
  );
});
