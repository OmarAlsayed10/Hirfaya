import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/passportConfig";
import prisma from "../lib/prisma";

import {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  issueProToken,
  updateProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  deleteAccount,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/validateJWTMiddleware";
import {
  listGitCredentialsController,
  saveGitCredentialController,
  deleteGitCredentialController,
} from "../controllers/gitHostCredentialController";
import { uploadAvatar } from "../services/importService";
import { authLimiter, otpLimiter } from "../middleware/rateLimitMiddleware";

const router = Router();

// ─── Email Auth ───────────────────────────────────────────────────────────────
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-otp", otpLimiter, verifyOTP);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", otpLimiter, resetPassword);

// ─── Session ──────────────────────────────────────────────────────────────────
router.post("/logout", logout);
router.get("/verify-token", authenticateToken, getCurrentUser);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.patch("/profile", authenticateToken, updateProfile);
router.post(
  "/profile/photo",
  authenticateToken,
  uploadAvatar.single("photo"),
  updateProfilePhoto
);
router.delete("/profile/photo", authenticateToken, deleteProfilePhoto);
router.delete("/account", authenticateToken, deleteAccount);

router.get("/git-credentials", authenticateToken, listGitCredentialsController);
router.post("/git-credentials", authenticateToken, saveGitCredentialController);
router.delete("/git-credentials/:host", authenticateToken, deleteGitCredentialController);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  session: false,
  }),
  async (req: any, res) => {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!dbUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Sets the httpOnly auth cookie on the response; the token never travels
      // in the redirect URL (where it would leak via history / Referer / logs).
      issueProToken(res, dbUser);

      res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
