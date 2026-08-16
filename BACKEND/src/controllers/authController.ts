import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomRequest } from "../middleware/validateJWTMiddleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import prisma from "../lib/prisma";
import { deleteImageFromCloudinary } from "../services/importService";
import { deleteUserAccount } from "../services/accountDeletionService";
import { emailService } from "../services/emailService";
import { hashOTP, otpMatches, OTP_TTL_MS, registerAccount } from "../services/registrationService";
import { confirmPasswordReset, requestPasswordReset } from "../services/passwordResetService";
import { sanitizeProfile } from "../services/profileService";
import { normalizeEmail } from "../lib/normalizeEmail";
import { hasPaidAccess } from "../services/entitlementService";
import { isLocked, nextLockoutState } from "../services/loginLockoutService";
import { revokeSessions } from "../lib/sessionRevocationCache";
import { readTokenClaims } from "../middleware/validateJWTMiddleware";

const PROFILE_FIELDS = ["phone", "location", "title", "linkedin", "github", "portfolio", "summary", "avatarColor", "skills", "onboarded"] as const;
const profileDefault = (k: string) => (k === "onboarded" ? false : k === "skills" ? [] : null);
const pickProfile = (u: Record<string, unknown>) =>
  Object.fromEntries(PROFILE_FIELDS.map((k) => [k, u[k] ?? profileDefault(k)]));

export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const issueToken = (
  user: {
    id: string;
    email: string;
    role: string;
    planTier?: string;
    proExpiresAt: Date | null;
  },
  sessionStart: number = Date.now()
) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      planTier: user.planTier ?? "basic",
      proExpiresAt: user.proExpiresAt ? user.proExpiresAt.getTime() : null,
      sessionStart,
    },
    process.env.JWT_SECRET_Key!,
    { expiresIn: "1d" }
  );

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// ─── Email Auth ───────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  const registration = await registerAccount(req.body);
  res.status(registration.status).json({ message: registration.message });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const message = await requestPasswordReset(req.body?.email);
  res.status(200).json({ message });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const result = await confirmPasswordReset(req.body ?? {});
  res.status(result.status).json({ message: result.message });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  if (user.googleId && !user.passwordHash) {
    res.status(400).json({
      message: "This account uses Google Sign-In. Please log in with Google.",
    });
    return;
  }

  if (!user.emailVerified) {
    res.status(403).json({
      message: "Email not verified. Please check your inbox for the OTP.",
    });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash!);

  // Checked after the hash comparison, not before: an early return would make a locked
  // account answer measurably faster than any other, handing back the account-existence
  // signal the shared "Invalid credentials." message exists to hide. A locked account is
  // also denied without incrementing, so an attacker cannot hold the lock open.
  if (isLocked(user)) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  if (!valid) {
    await prisma.user.update({
      where: { id: user.id },
      data: nextLockoutState(user),
    });
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  const token = issueToken(user);
  setAuthCookie(res, token);

  res.status(200).json({
    message: "Login successful.",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      planTier: user.planTier,
      isPro: hasPaidAccess(user),
      proExpiresAt: user.proExpiresAt ? user.proExpiresAt.getTime() : null,
    },
  });
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ message: "Email and OTP are required." });
    return;
  }

  const emailAddress = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: emailAddress } });

  if (!user || !user.otp || !user.otpExpiry) {
    res.status(400).json({ message: "No pending verification for this email." });
    return;
  }

  if (new Date() > user.otpExpiry) {
    res.status(410).json({ message: "OTP has expired. Please request a new one." });
    return;
  }

  if (!otpMatches(otp, user.otp)) {
    res.status(401).json({ message: "Invalid OTP." });
    return;
  }

  const verified = await prisma.user.update({
    where: { email: emailAddress },
    data: { emailVerified: true, otp: null, otpExpiry: null },
  });

  await emailService.sendWelcome(emailAddress, verified.firstName);

  const token = issueToken(verified);
  setAuthCookie(res, token);

  res.status(200).json({
    message: "Email verified successfully.",
    user: {
      id: verified.id,
      email: verified.email,
      firstName: verified.firstName,
      lastName: verified.lastName,
      role: verified.role,
      planTier: verified.planTier,
      isPro: hasPaidAccess(verified),
      proExpiresAt: verified.proExpiresAt ? verified.proExpiresAt.getTime() : null,
    },
  });
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required." });
    return;
  }

  const emailAddress = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: emailAddress } });

  if (!user || user.emailVerified) {
    // Intentionally vague to prevent email enumeration
    res.status(200).json({ message: "If that email has a pending registration, a new code was sent." });
    return;
  }

  const otp = String(randomInt(100000, 999999));
  await prisma.user.update({
    where: { email: emailAddress },
    data: { otp: hashOTP(otp), otpExpiry: new Date(Date.now() + OTP_TTL_MS) },
  });

  await emailService.sendOTP(emailAddress, user.firstName, otp);

  res.status(200).json({ message: "If that email has a pending registration, a new code was sent." });
};

// ─── Session / Profile ────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  const claims = readTokenClaims(req);
  res.clearCookie("token", AUTH_COOKIE_OPTIONS);

  if (claims?.userId) {
    const now = new Date();
    // Persist before touching the cache so a successful logout is durable. If the write
    // fails the in-memory revocation still holds for this process, but it is lost on
    // restart while the token itself stays valid — worth alerting on, not just noting.
    try {
      await prisma.user.update({
        where: { id: claims.userId },
        data: { sessionsValidFrom: now },
      });
    } catch (err) {
      console.error(
        `[logout] durable revocation failed for user ${claims.userId} — token remains valid until it expires`,
        err
      );
    }
    revokeSessions(claims.userId, now);
  }

  res.status(200).json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;

  if (!customReq.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const dbUser = await prisma.user.findUnique({ where: { id: customReq.user.userId } });
  if (!dbUser) {
    res.clearCookie("token", AUTH_COOKIE_OPTIONS);
    res.status(401).json({
      code: "AUTH_REQUIRED",
      message: "Account no longer exists.",
    });
    return;
  }

  // Capture the caller's IP so an admin can ban it later. Only write when it
  // changed, so a refresh isn't a DB write every time.
  const ip = req.ip || req.socket.remoteAddress || null;
  if (dbUser && ip && dbUser.lastIp !== ip) {
    prisma.user.update({ where: { id: dbUser.id }, data: { lastIp: ip } }).catch(() => {});
  }

  const sessionStart = customReq.user.sessionStart ?? Date.now();
  if (Date.now() - sessionStart < SESSION_MAX_AGE_MS) {
    setAuthCookie(res, issueToken(dbUser, sessionStart));
  }

  res.status(200).json({
    user: {
      ...customReq.user,
      // Role/expiry come from the DB (source of truth) so upgrades reflect on refresh,
      // not only after the user happens to re-login with a fresh token.
      role: dbUser?.role ?? customReq.user.role,
      planTier: dbUser?.planTier ?? "basic",
      // Paid access is a computed answer (tier + expiry + admin), never a stored label —
      // the client must not have to re-derive it and drift from the server's rules.
      isPro: hasPaidAccess(dbUser),
      proExpiresAt: dbUser?.proExpiresAt ?? customReq.user.proExpiresAt,
      firstName: dbUser?.firstName,
      lastName: dbUser?.lastName,
      photo: dbUser?.photo,
      isGoogleUser: !!dbUser?.googleId,
      ...(dbUser ? pickProfile(dbUser as unknown as Record<string, unknown>) : {}),
    },
  });
};

export const issueProToken = (
  res: Response,
  user: { id: string; email: string; role: string; planTier?: string; proExpiresAt: Date | null }
): string => {
  const token = issueToken(user);
  setAuthCookie(res, token);
  return token;
};


export const updateProfile = async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  const { firstName, lastName, onboarded } = req.body;

  if (!customReq.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: customReq.user.userId },
    });
    if (!dbUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const nextFirstName =
      typeof firstName === "string" && firstName.trim()
        ? firstName.trim()
        : dbUser.firstName;
    const nextLastName =
      typeof lastName === "string" ? lastName.trim() : dbUser.lastName;
    const nameChanged =
      dbUser.firstName !== nextFirstName || dbUser.lastName !== nextLastName;
    const now = new Date();

    if (nameChanged && dbUser.lastNameChange) {
      const daysSince =
        (now.getTime() - dbUser.lastNameChange.getTime()) / (1000 * 3600 * 24);
      if (daysSince < 30) {
        res.status(400).json({
          message: `Name can only be changed once every 30 days. Remaining: ${Math.ceil(
            30 - daysSince
          )} days.`,
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: customReq.user.userId },
      data: {
        ...sanitizeProfile(req.body as Record<string, unknown>),
        firstName: nextFirstName,
        lastName: nextLastName,
        ...(nameChanged ? { lastNameChange: now } : {}),
        ...(onboarded === true ? { onboarded: true } : {}),
      },
    });
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;

  if (!customReq.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const deleted = await deleteUserAccount(customReq.user.userId);
    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.clearCookie("token", AUTH_COOKIE_OPTIONS);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};
export const updateProfilePhoto = async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  if (!customReq.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!req.file?.path) {
    res.status(400).json({ message: "No photo provided" });
    return;
  }

  const userId = customReq.user.userId;
  const newPhoto = req.file.path;
  let newPhotoIsCurrent = false;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { photo: true },
    });
    if (!currentUser) {
      await deleteImageFromCloudinary(newPhoto);
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { photo: newPhoto },
    });
    newPhotoIsCurrent = true;

    if (currentUser.photo && currentUser.photo !== newPhoto) {
      try {
        await deleteImageFromCloudinary(currentUser.photo);
      } catch (error) {
        // Restore the old link so the failed Cloudinary cleanup remains tracked.
        await prisma.user.update({
          where: { id: userId },
          data: { photo: currentUser.photo },
        });
        newPhotoIsCurrent = false;
        throw error;
      }
    }

    res.status(200).json({
      message: "Photo updated successfully",
      photo: updatedUser.photo,
    });
  } catch (error) {
    if (!newPhotoIsCurrent) {
      try {
        await deleteImageFromCloudinary(newPhoto);
      } catch (cleanupError) {
        console.error("New photo cleanup error:", cleanupError);
      }
    }
    console.error("Photo update error:", error);
    res.status(500).json({ message: "Failed to update photo" });
  }
};

export const deleteProfilePhoto = async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  if (!customReq.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: customReq.user.userId } });

    if (dbUser?.photo) {
      await deleteImageFromCloudinary(dbUser.photo);
    }

    await prisma.user.update({
      where: { id: customReq.user.userId },
      data: { photo: null },
    });
    res.status(200).json({ message: "Photo removed successfully" });
  } catch (error) {
    console.error("Photo delete error:", error);
    res.status(500).json({ message: "Failed to remove photo" });
  }
};