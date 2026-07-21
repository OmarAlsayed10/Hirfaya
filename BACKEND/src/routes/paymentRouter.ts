import { Router } from "express";
import {
  listPlansController,
  instapayDetailsController,
  submitPaymentController,
  paymentStatusController,
  creditQuoteController,
  customInstapayDetailsController,
  adminListPendingController,
  adminApproveController,
  adminRejectController,
} from "../controllers/paymentController";
import { authenticateToken } from "../middleware/validateJWTMiddleware";
import { requireAdmin } from "../middleware/requireAdmin";
import { paymentLimiter } from "../middleware/rateLimitMiddleware";
import { uploadPaymentScreenshot } from "../services/importService";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/plans", listPlansController);

// ─── Authenticated user ───────────────────────────────────────────────────────
router.post("/credit-quote", authenticateToken, creditQuoteController);
router.post("/instapay/details/custom", authenticateToken, customInstapayDetailsController);

router.get(
  "/instapay/details/:planId",
  authenticateToken,
  instapayDetailsController
);

router.post(
  "/instapay/submit",
  authenticateToken,
  paymentLimiter,
  uploadPaymentScreenshot.single("screenshot"),
  submitPaymentController
);

router.get("/status", authenticateToken, paymentStatusController);

// ─── Admin (role-based JWT) ───────────────────────────────────────────────────
router.get("/admin/pending", authenticateToken, requireAdmin, adminListPendingController);
router.patch("/admin/:id/approve", authenticateToken, requireAdmin, adminApproveController);
router.patch("/admin/:id/reject", authenticateToken, requireAdmin, adminRejectController);

export default router;
