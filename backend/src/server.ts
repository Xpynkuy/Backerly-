import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import { PORT } from "./config/env";
import router from "./routes/routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5137",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Auth API",
  });
});

app.use("/api/auth", router);

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
