import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { estimateTextPageCount, extractText } from "../services/extractTextService";
import { aiResponse, hasAiResponse } from "../services/aiService";
import { scoreCVWithBreakdown, hasScore } from "../services/cvScoring";
import { canSpend, canAnonAnalyze, consumeAnonAnalyze } from "../services/quotaService";
import { runWithUser } from "../lib/creditContext";
import { isGroqRateLimit } from "../lib/groqChat";
import prisma from "../lib/prisma";
import { InvalidAiResponseError } from "../lib/aiResponseValidation";

export const analyzeCVController = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const cvText = (
    typeof req.body?.cvText === "string" ? req.body.cvText : ""
  ).slice(0, 30000);

  console.log("[cv-analyze] request received", {
    hasFile: !!file,
    fileName: file?.originalname ?? null,
    mimeType: file?.mimetype ?? null,
    inlineTextLength: cvText.length,
  });

  if (!file && cvText.trim().length < 30) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const level = (
    typeof req.body?.level === "string" ? req.body.level : ""
  ).slice(0, 20);

  try {
    const extracted = file
      ? await extractText(file.buffer, file.mimetype)
      : { text: cvText, pageCount: estimateTextPageCount(cvText) };
    const extractedText = extracted.text.slice(0, 30000);
    const pageCount = extracted.pageCount;

    if (file && extractedText.trim().length < 100) {
      res.status(400).json({
        message: "Couldn't read enough text from this file. Upload a text-based PDF or Word CV, not a scan or image.",
      });
      return;
    }

    // Identify the requester (optional — /analyze stays public) for per-user quota.
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    let userId: string | undefined;
    let isPro = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_Key!) as {
          userId: string;
        };
        userId = decoded.userId;
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, proExpiresAt: true },
        });
        isPro =
          dbUser?.role === "pro user" ||
          (!!dbUser?.proExpiresAt &&
            dbUser.proExpiresAt.getTime() > Date.now());
      } catch {
        /* anonymous — fall through to IP */
      }
    }
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // A repeat of the exact same CV+role+level is served from cache — free, no quota spent.
    const cached =
      hasScore(extractedText, "", level) &&
      hasAiResponse(extractedText);
    if (!cached) {
      const gate = userId ? await canSpend({ userId, ip }) : await canAnonAnalyze(ip);
      if (!gate.ok) {
        res.status(429).json({ code: gate.code, message: gate.message });
        return;
      }
    }

    // aiResponse and scoring are independent — run them concurrently to cut latency.
    // Logged-in callers are billed real credits inside groqChat via the ALS context.
    const [ai, score] = await runWithUser(userId, () =>
      Promise.all([
        aiResponse(extractedText),
        scoreCVWithBreakdown(extractedText, "", level),
      ])
    );

    if (!cached && !userId) await consumeAnonAnalyze(ip);
    const {
      sectionsToImprove,
      positiveFeedback,
      neutralFeedback,
      negativeFeedback,
      interviewQuestions,
      atsCheckerNotes,
      matchJobTitle,
    } = ai;
    const {
      total: qualityScore,
      categories: scoreBreakdown,
      dimensions,
      levelContext,
    } = score;

    console.log("[cv-analyze] scoring summary", {
      qualityScore,
      impactDimension:
        dimensions.find((d) => d.name === "Impact & Results")?.score ?? null,
      workExperienceCategory:
        scoreBreakdown.find((c) => c.name === "Work Experience")?.earned ??
        null,
    });

    // Record analysis event for home page live metrics
    try {
      await prisma.analysisEvent.create({
        data: {
          userId: userId ?? null,
          ip,
        },
      });
    } catch (e) {
      console.error("[cv-analyze] failed to record AnalysisEvent", e);
    }

    // Per-dimension details are a Pro perk — free users see the scores, not the fixes.
    const gatedDimensions = dimensions.map((d) =>
      isPro ? d : { name: d.name, score: d.score, details: [] as string[] },
    );

    res.status(200).json({
      message: "CV analyzed successfully",
      originalFile: file
        ? { name: file.originalname, type: file.mimetype, size: file.size }
        : {
            name: "Primary CV",
            type: "text/plain",
            size: extractedText.length,
          },
      extractedText,
      pageCount,
      level,
      qualityScore,
      scoreBreakdown,
      dimensions: gatedDimensions,
      detailsLocked: !isPro,
      levelContext,
      sectionsToImprove,
      positiveFeedback,
      neutralFeedback,
      negativeFeedback,
      interviewQuestions,
      atsCheckerNotes,
      matchJobTitle,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    if (error instanceof InvalidAiResponseError) {
      res.status(502).json({
        code: "PROVIDER_INVALID_RESPONSE",
        message: "The AI returned an invalid analysis. Please retry.",
      });
      return;
    }
    if (isGroqRateLimit(error)) {
      res.status(503).json({
        code: "PROVIDER_BUSY",
        message:
          "The analysis service is busy right now. Please try again in a moment.",
      });
      return;
    }
    console.error("CV analyze error:", error);
    res.status(500).json({ code: "ANALYSIS_FAILED", message: "Failed to analyze CV" });
  }
};
