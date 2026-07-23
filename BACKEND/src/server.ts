import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { validateEnv } from "./config/env";
validateEnv(); // fail-fast: crash before anything starts if a secret is missing

import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import "./config/passportConfig";
import authRouter from "./routes/authRouter";
import cvRouter from "./routes/cvRouter";
import cvBuilderRouter from "./routes/cvBuilderRouter";
import chatBotRouter from "./routes/chatBotRouter";
import paymentRouter from "./routes/paymentRouter";
import jobRouter from "./routes/jobRouter";
import documentRouter from "./routes/documentRouter";
import adminRouter from "./routes/adminRouter";
import blogRouter from "./routes/blogRouter";
import quotaRouter from "./routes/quotaRouter";
import reviewRouter from "./routes/reviewRouter";
import communityRouter from "./routes/communityRouter";
import { generalLimiter, aiLimiter } from "./middleware/rateLimitMiddleware";
import { isGroqRateLimit } from "./lib/groqChat";
import { blockBannedIp } from "./middleware/ipBanMiddleware";
import { startCronJobs } from "./services/cronService";
import { loadBanCache } from "./lib/banCache";
import prisma from "./lib/prisma";

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(passport.initialize());

app.use(generalLimiter);
app.use(blockBannedIp);

app.use("/auth", authRouter);
app.use("/api/ai", aiLimiter, cvRouter);
app.use("/cvbuilder", cvBuilderRouter);
app.use("/api/chatbot", aiLimiter, chatBotRouter);
app.use("/payment", paymentRouter);
app.use("/job-radar", jobRouter);
app.use("/documents", documentRouter);
app.use("/admin", adminRouter);
app.use("/blogs", blogRouter);
app.use("/quota", quotaRouter);
app.use("/reviews", reviewRouter);
app.use("/community", communityRouter);

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  if (isGroqRateLimit(err)) {
    res.status(429).json({ message: "You have hit your limit. Contact admin." });
    return;
  }
  const status = err.status || 500;
  // Only surface the message for intentional 4xx client errors; never leak
  // internal 5xx error details (stack, DB messages) to the client.
  res.status(status).json({
    message:
      status < 500
        ? err.message || "Request failed."
        : "An unexpected error occurred.",
  });
});

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not found");
  process.exit(1);
}

async function start() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected!");
    await loadBanCache();
  } catch (e) {
    // ponytail: don't kill the whole server on a transient DB hiccup — Prisma
    // reconnects on the next query, and DB-free routes (CV analyze/enhance) still work.
    console.error("DB connect failed at boot — starting anyway, will retry on demand:", e);
  }
  startCronJobs();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
