import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "./config/passportConfig";
import authRouter from "./routes/authRouter";
import cvRouter from "./routes/cvRouter";
import cvBuilderRouter from "./routes/cvBuilderRouter";
import cookieParser from "cookie-parser";
import chatBotRouter from "./routes/chatBotRouter";
import paymentRouter from "./routes/paymentRouter";
import prisma from "./lib/prisma";
dotenv.config();

const app = express();
const port = process.env.PORT

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/api/ai", cvRouter);
app.use("/cvbuilder", cvBuilderRouter);
app.use("/api/chatbot", chatBotRouter);
app.use("/payment", paymentRouter);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not found");
  process.exit(1);
}

prisma.$connect()
  .then(() => {
    console.log("PostgreSQL connected!");
    app.listen(port, () => {
      console.log(`Server is running at: http://localhost:${port}`);
    });
  })
  .catch((e: any) => {
    console.error("Failed to connect:", e);
    process.exit(1);
  });

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});