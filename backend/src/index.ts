// Installation steps:
// cd backend
// npm install
// cp .env.example .env
// Fill in your API keys in .env
// npm run dev

import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { adviceRouter } from "./routes/advice";
import { hairstyleRouter } from "./routes/hairstyle";
import { logger } from "./middleware/logger";
import { handleMulterError } from "./middleware/upload";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(
  cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);
// Keep JSON/urlencoded parsers before routes; multer handles multipart bodies per-route.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(logger);

app.use("/api/hairstyle", hairstyleRouter);
app.use("/api/advice", adviceRouter);

app.use(handleMulterError);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
