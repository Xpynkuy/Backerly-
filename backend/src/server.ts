import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { PORT } from "./config/env";
import router from "./routes/routes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import postActionRoutes from "./routes/postActionRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import statsRoutes from "./routes/statsRoutes";
import payoutRoutes from "./routes/payoutRoutes";
import path from "path";
import { authenticate } from "./middleware/authMIddleware";
import { getFeed } from "./controllers/postController";
 
const app = express();
 
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://backerlyproject.ru", "https://www.backerlyproject.ru"]
    : ["http://localhost:5173", "http://localhost:3000"];
 
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
 
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Backerly API",
    environment: process.env.NODE_ENV,
  });
});
 
app.use("/api/auth", router);
app.use("/api/users", userRoutes);
app.use("/api/users", postRoutes);
app.use("/api/feed", authenticate, getFeed);
app.use("/api/posts", postActionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
 
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});
 
const startServer = async () => {
  try {
    await connectDB();
 
    app.listen(PORT, () => {
      console.log(`SERVER RUNNING AT ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server", error);
    process.exit(1);
  }
};
 
startServer();