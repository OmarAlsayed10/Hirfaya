import rateLimit from "express-rate-limit";

// In a multi-node deployment swap MemoryStore for a Redis store here.
const json = (message: string) => ({ message });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many auth attempts. Try again in 15 minutes."),
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many OTP requests. Try again in 1 hour."),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("AI request limit reached. Try again in 1 hour."),
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many payment attempts. Try again in 1 hour."),
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: json("Too many requests. Please slow down."),
});
