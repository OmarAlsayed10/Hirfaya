import { Request } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { CustomRequest } from "./validateJWTMiddleware";

export const isAdminRequest = (req: Request): boolean => {
  if ((req as CustomRequest).user?.role === "admin") return true;

  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_Key!) as { role?: string };
    return decoded.role === "admin";
  } catch {
    return false;
  }
};


// In a multi-node deployment swap MemoryStore for a Redis store here.
const json = (message: string) => ({ message });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: isAdminRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many auth attempts. Try again in 15 minutes."),
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip: isAdminRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many OTP requests. Try again in 1 hour."),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  skip: isAdminRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("AI request limit reached. Try again in 1 hour."),
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip: isAdminRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many payment attempts. Try again in 1 hour."),
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: isAdminRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many requests. Please slow down."),
});
