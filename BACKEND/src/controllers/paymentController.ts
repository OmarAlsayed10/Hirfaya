import { Request, Response } from "express";
import { CustomRequest } from "../middleware/validateJWTMiddleware";
import {
  getActivePlans,
  getPlanById,
  buildInstapayDetails,
  submitPaymentRequest,
  getLatestPaymentStatus,
  rejectPaymentRequest,
  listPendingPayments,
} from "../services/paymentService";
import {
  approvePaymentRequestAtomically,
  customCreditQuote,
  customInstapayDetails,
  submitCustomPaymentRequest,
} from "../services/creditPurchaseService";
import { assertCommercialPriceIsSafe, PricingConfigurationError } from "../services/creditPricingService";
import { emailService } from "../services/emailService";
import prisma from "../lib/prisma";
import { displayName } from "../lib/displayName";

const PAYMENT_REFERENCE_PATTERN = /^[A-Za-z0-9._\/-]{1,100}$/;

const normalizedPaymentReference = (reference: unknown): string | null => {
  if (typeof reference !== "string") return null;
  const normalized = reference.trim();
  return PAYMENT_REFERENCE_PATTERN.test(normalized) ? normalized : null;
};

// ─── Plans ────────────────────────────────────────────────────────────────────

export const listPlansController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const plans = await getActivePlans();
  res.status(200).json({ plans });
};

// ─── InstaPay ─────────────────────────────────────────────────────────────────

export const instapayDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { planId } = req.params;

  const plan = await getPlanById(planId);
  if (!plan) {
    res.status(404).json({ message: "Plan not found." });
    return;
  }

  res.status(200).json(buildInstapayDetails(plan));
};

export const creditQuoteController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quote = customCreditQuote(req.body.amountEGP);
    if ("code" in quote) {
      res.status(422).json({
        ...quote,
        message: "Choose an amount that buys a whole number of credits.",
      });
      return;
    }
    res.status(200).json(quote);
  } catch (err) {
    if (err instanceof RangeError) {
      res.status(400).json({ code: "INVALID_CUSTOM_AMOUNT", message: err.message });
      return;
    }
    if (err instanceof PricingConfigurationError) {
      res.status(503).json({
        code: "PRICING_UNAVAILABLE",
        message: "Credit purchasing is temporarily unavailable.",
      });
      return;
    }
    throw err;
  }
};

export const customInstapayDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json(customInstapayDetails(req.body.amountEGP));
  } catch (err) {
    if (
      err instanceof RangeError ||
      (err instanceof Error && err.message === "INVALID_CREDIT_QUOTE")
    ) {
      res.status(422).json({
        code: "INVALID_CREDIT_QUOTE",
        message: "Enter an amount that buys a whole number of credits.",
      });
      return;
    }
    if (err instanceof PricingConfigurationError) {
      res.status(503).json({ code: "PRICING_UNAVAILABLE", message: "Credit purchasing is temporarily unavailable." });
      return;
    }
    throw err;
  }
};

export const submitPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as CustomRequest).user!;
  const { planId, customAmountEGP } = req.body;
  const paymentReference = normalizedPaymentReference(req.body.referenceNumber);
  const screenshot = req.file;
  const hasPlan = typeof planId === "string" && planId.length > 0;
  const hasCustomAmount = customAmountEGP !== undefined && customAmountEGP !== null;

  if (hasPlan === hasCustomAmount || !paymentReference || !screenshot) {
    res.status(400).json({
      code: "INVALID_PAYMENT_SUBMISSION",
      message: "Choose either a plan or a custom credit amount, then provide a valid reference and screenshot.",
    });
    return;
  }

  try {
    const request = hasCustomAmount
      ? await submitCustomPaymentRequest({
          userId: user.userId,
          amountEGP: customAmountEGP,
          referenceNumber: paymentReference,
          screenshotUrl: screenshot.path,
        })
      : await submitPaymentRequest(
          user.userId,
          planId,
          paymentReference,
          screenshot.path
        );

    // The payment is already recorded — a failed admin email must NOT fail the request.
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (dbUser) {
        await emailService.sendPaymentReceivedToAdmin({
          requestId: request.id,
          userEmail: dbUser.email,
          userName: displayName(dbUser.firstName, dbUser.lastName),
          referenceNumber: paymentReference,
          amount: request.amountSnapshot.toString(),
          screenshotUrl: screenshot.path,
        });
      }
    } catch (mailErr) {
      console.error("Admin notification email failed (payment still recorded):", mailErr);
    }

    res.status(201).json({
      message:
        "Payment submitted. We will review it within 24 hours.",
      requestId: request.id,
      status: request.status,
      plan: {
        displayName: request.plan?.displayName ?? "+" + request.grantCreditsSnapshot + " Credits",
        durationDays: request.plan?.durationDays ?? 0,
      },
    });
  } catch (err: any) {
    if (err.message === "PENDING_EXISTS") {
      res.status(409).json({
        message:
          "You already have a pending payment request. Please wait for it to be reviewed.",
      });
      return;
    }
    if (err.message === "PLAN_NOT_FOUND") {
      res.status(404).json({ message: "Selected plan not found." });
      return;
    }
    console.error("Payment submit error:", err);
    if (err.message === "INVALID_CREDIT_QUOTE" || err instanceof RangeError) {
      res.status(422).json({
        code: "INVALID_CREDIT_QUOTE",
        message: "Enter an amount that buys a whole number of credits.",
      });
      return;
    }
    if (err instanceof PricingConfigurationError) {
      res.status(503).json({
        code: "PRICING_UNAVAILABLE",
        message: "Credit purchasing is temporarily unavailable.",
      });
      return;
    }
    res.status(500).json({ message: "Failed to submit payment." });
  }
};

export const paymentStatusController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as CustomRequest).user!;
  const record = await getLatestPaymentStatus(user.userId);
  res.status(200).json({ paymentRequest: record });
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminListPendingController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const requests = await listPendingPayments();
  res.status(200).json({ requests });
};

export const adminApproveController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const approved = await approvePaymentRequestAtomically(id);



    await emailService.sendPaymentApproved(
      approved.user.email,
      approved.user.firstName
    );

    res.status(200).json({
      message: "Payment approved and the purchase was applied.",
      userId: approved.user.id,
      plan: approved.displayName,
      expiresAt: approved.user.proExpiresAt,
    });
  } catch (err: any) {
    if (err.message === "NOT_FOUND") {
      res.status(404).json({ message: "Payment request not found." });
      return;
    }
    if (err.message === "NOT_PENDING") {
      res.status(409).json({ message: "Payment request is not in PENDING state." });
      return;
    }
    console.error("Admin approve error:", err);
    res.status(500).json({ message: "Failed to approve payment." });
  }
};

export const adminRejectController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ message: "Rejection reason is required." });
    return;
  }

  try {
    const rejected = await rejectPaymentRequest(id, reason);

    await emailService.sendPaymentRejected(
      rejected.user.email,
      rejected.user.firstName,
      reason
    );

    res.status(200).json({
      message: "Payment rejected. User has been notified.",
      requestId: rejected.id,
    });
  } catch (err: any) {
    if (err.message === "NOT_FOUND") {
      res.status(404).json({ message: "Payment request not found." });
      return;
    }
    if (err.message === "NOT_PENDING") {
      res.status(409).json({ message: "Payment request is not in PENDING state." });
      return;
    }
    console.error("Admin reject error:", err);
    res.status(500).json({ message: "Failed to reject payment." });
  }
};
