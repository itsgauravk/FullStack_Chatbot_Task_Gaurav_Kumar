import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { rateLimit } from "express-rate-limit";
import enquiryRoutes from "./routes/enquiries";

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

const tooMany = { message: "Too many requests. Please try again later." };

// Visitors: at most 20 enquiries per 15 minutes from one address
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

// Admin routes: at most 30 failed attempts per 15 minutes (slows password guessing)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/enquiries", (req: Request, res: Response, next: NextFunction) =>
  req.method === "POST" ? submitLimiter(req, res, next) : adminLimiter(req, res, next)
);
app.use("/api/enquiries", enquiryRoutes);

// Unknown route
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Any other error (for example, broken JSON) - no technical details exposed
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const isBadJson = err instanceof SyntaxError;
  res
    .status(isBadJson ? 400 : 500)
    .json({ message: isBadJson ? "Invalid request" : "Something went wrong" });
});

async function start() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing in the .env file");
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", (err as Error).message);
    process.exit(1);
  }
}

start();
