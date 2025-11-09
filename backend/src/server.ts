import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connentDB } from "./config/db";
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

connentDB()
  .then(() => {
    app.use("/api/auth", router);
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.log("Failed to start server", error);
    process.exit(1);
  });
