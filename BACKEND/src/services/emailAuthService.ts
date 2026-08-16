import bcrypt from "bcryptjs";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import prisma from "../lib/prisma";
import { emailService } from "./emailService";
import { normalizeEmail } from "../lib/normalizeEmail";

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MS = 10 * 60 * 1000;

type EmailAuthFailure = { status: 400 | 401 | 403 | 409 | 410; message: string };
type EmailAuthSuccess<T> = { value: T };
type EmailAuthResult<T> = EmailAuthFailure | EmailAuthSuccess<T>;

const hashOtp = (otp: string): string =>
  createHmac("sha256", process.env.JWT_SECRET_Key!).update(otp).digest("hex");

const otpMatches = (input: string, stored: string): boolean => {
  const inputHash = Buffer.from(hashOtp(input));
  const storedHash = Buffer.from(stored);
  return inputHash.length === storedHash.length && timingSafeEqual(inputHash, storedHash);
};

const newOtp = (): { plainText: string; hash: string; expiry: Date } => {
  const plainText = String(randomInt(100000, 999999));
  return { plainText, hash: hashOtp(plainText), expiry: new Date(Date.now() + OTP_TTL_MS) };
};

export const registerEmail = async (input: Record<string, unknown>): Promise<EmailAuthResult<undefined>> => {
  const { firstName, lastName, email, password } = input;
  if (!firstName || !lastName || !email || !password) {
    return { status: 400, message: "All fields are required." };
  }
  if (typeof password !== "string" || password.length < 8) {
    return { status: 400, message: "Password must be at least 8 characters." };
  }

  const emailAddress = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: emailAddress } });
  if (existing?.emailVerified) return { status: 409, message: "Email already registered." };

  const otp = newOtp();
  const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: emailAddress },
    update: { firstName: String(firstName), lastName: String(lastName), passwordHash, otp: otp.hash, otpExpiry: otp.expiry },
    create: { firstName: String(firstName), lastName: String(lastName), email: emailAddress, passwordHash, otp: otp.hash, otpExpiry: otp.expiry, emailVerified: false },
  });
  await emailService.sendOTP(emailAddress, String(firstName), otp.plainText);
  return { value: undefined };
};

export const authenticateEmail = async (input: Record<string, unknown>): Promise<EmailAuthResult<Awaited<ReturnType<typeof prisma.user.findUnique>>>> => {
  const { email, password } = input;
  if (!email || !password) return { status: 400, message: "Email and password are required." };

  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user) return { status: 401, message: "Invalid credentials." };
  if (user.googleId && !user.passwordHash) {
    return { status: 400, message: "This account uses Google Sign-In. Please log in with Google." };
  }
  if (!user.emailVerified) {
    return { status: 403, message: "Email not verified. Please check your inbox for the OTP." };
  }
  if (!(await bcrypt.compare(String(password), user.passwordHash!))) {
    return { status: 401, message: "Invalid credentials." };
  }
  return { value: user };
};

export const verifyEmailOtp = async (input: Record<string, unknown>): Promise<EmailAuthResult<Awaited<ReturnType<typeof prisma.user.update>>>> => {
  const { email, otp } = input;
  if (!email || !otp) return { status: 400, message: "Email and OTP are required." };

  const emailAddress = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: emailAddress } });
  if (!user || !user.otp || !user.otpExpiry) {
    return { status: 400, message: "No pending verification for this email." };
  }
  if (new Date() > user.otpExpiry) {
    return { status: 410, message: "OTP has expired. Please request a new one." };
  }
  if (!otpMatches(String(otp), user.otp)) return { status: 401, message: "Invalid OTP." };

  const verified = await prisma.user.update({
    where: { email: emailAddress },
    data: { emailVerified: true, otp: null, otpExpiry: null },
  });
  await emailService.sendWelcome(emailAddress, verified.firstName);
  return { value: verified };
};

export const resendEmailOtp = async (email: unknown): Promise<void> => {
  if (!email) return;
  const emailAddress = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: emailAddress } });
  if (!user || user.emailVerified) return;

  const otp = newOtp();
  await prisma.user.update({ where: { email: emailAddress }, data: { otp: otp.hash, otpExpiry: otp.expiry } });
  await emailService.sendOTP(emailAddress, user.firstName, otp.plainText);
};
