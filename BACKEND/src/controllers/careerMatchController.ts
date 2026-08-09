import { Request, Response } from "express";
import { z } from "zod";
import { CustomRequest } from "../middleware/validateJWTMiddleware";
import { extractText } from "../services/extractTextService";
import { canSpend } from "../services/quotaService";
import {
  careerMatchCacheKey,
  getCareerMatchCache,
  saveCareerMatchCache,
} from "../services/careerMatchCacheService";
import { searchLiveMarket } from "../services/careerMatchService";
import { analyzeCareerMatch } from "../services/careerMatchAnalysisService";
import {
  getLiveMarketStatus,
  LiveMarketLimitError,
  releaseLiveMarketSearch,
  reserveLiveMarketSearch,
} from "../services/liveMarketQuotaService";
import { InvalidAiResponseError } from "../lib/aiResponseValidation";
import { isGroqRateLimit } from "../lib/groqChat";
import { normalizeJobDescription } from "../lib/jobDescriptionNormalizer";

const inputSchema = z.object({
  cvText: z.string().trim().min(100).max(30000),
  targetJobTitle: z.string().trim().max(100),
  experienceLevel: z.enum(["", "Fresh", "Junior", "Mid", "Senior", "Lead"]),
  jobDescription: z.string().trim().max(20000),
  useLiveMarket: z.boolean(),
  language: z.enum(["en", "ar"]),
}).strict();

const bodyString = (value: unknown, max: number) => typeof value === "string" ? value.slice(0, max) : "";
const bodyLanguage = (value: unknown): "en" | "ar" => value === "ar" ? "ar" : "en";

export async function careerMatchLimitsController(req: Request, res: Response): Promise<void> {
  const userId = (req as CustomRequest).user?.userId;
  if (!userId) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "Unauthorized" });
    return;
  }
  try {
    res.json(await getLiveMarketStatus(userId));
  } catch (error) {
    console.error("[career-match] limits error:", error);
    res.status(500).json({ message: "Could not load live market limits." });
  }
}

export async function careerMatchController(req: Request, res: Response): Promise<void> {
  const userId = (req as CustomRequest).user?.userId;
  const file = req.file as Express.Multer.File | undefined;
  if (!userId) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "Unauthorized" });
    return;
  }

  let reservationPeriod: string | null = null;
  try {
    const inlineText = bodyString(req.body?.cvText, 30000);
    const cvText = file ? (await extractText(file.buffer, file.mimetype)).text.slice(0, 30000) : inlineText;
    const parsed = inputSchema.safeParse({
      cvText,
      targetJobTitle: bodyString(req.body?.targetJobTitle, 100),
      experienceLevel: bodyString(req.body?.experienceLevel, 20),
      jobDescription: normalizeJobDescription(bodyString(req.body?.jobDescription, 20000)).plainText,
      useLiveMarket: req.body?.useLiveMarket === true || req.body?.useLiveMarket === "true",
      language: bodyLanguage(req.body?.language),
    });
    if (!parsed.success) {
      res.status(400).json({ message: "Provide a readable CV and valid Career Match options." });
      return;
    }

    const input = parsed.data;
    const vacancyMode = input.jobDescription.length > 0;
    const useLiveMarket = input.useLiveMarket && !vacancyMode;
    const key = careerMatchCacheKey({ ...input, useLiveMarket });
    const cached = await getCareerMatchCache(userId, key);
    if (cached) {
      res.json({ ...cached, liveMarketStatus: await getLiveMarketStatus(userId), cached: true });
      return;
    }

    const creditGate = await canSpend({ userId, ip: req.ip || "unknown" });
    if (!creditGate.ok) {
      res.status(429).json({ code: creditGate.code, message: creditGate.message });
      return;
    }

    if (useLiveMarket) {
      const reservation = await reserveLiveMarketSearch(userId);
      reservationPeriod = reservation.period;
    }

    const analysis = await analyzeCareerMatch(input);
    const marketSnapshot = useLiveMarket && analysis.mode === "role_discovery"
      ? await searchLiveMarket(analysis.roles.map((role) => role.title), input.language)
      : null;
    const payload = { analysis, marketSnapshot };
    await saveCareerMatchCache(userId, key, payload, useLiveMarket);
    reservationPeriod = null;

    res.json({ ...payload, liveMarketStatus: await getLiveMarketStatus(userId), cached: false });
  } catch (error) {
    if (reservationPeriod) await releaseLiveMarketSearch(userId, reservationPeriod);
    if (error instanceof LiveMarketLimitError) {
      res.status(429).json({ code: "LIVE_MARKET_LIMIT", message: error.message, liveMarketStatus: error.status });
      return;
    }
    if (error instanceof InvalidAiResponseError) {
      console.warn("[career-match] invalid AI response", { reason: error.reason, mode: req.body?.jobDescription ? "vacancy_match" : "role_discovery" });
      res.status(502).json({
        code: "PROVIDER_INVALID_RESPONSE",
        reason: error.reason,
        message: "Career Match could not verify the AI result. Please try again. No live-search allowance was used.",
      });
      return;
    }
    if (isGroqRateLimit(error)) {
      res.status(503).json({ code: "PROVIDER_BUSY", message: "Career Match is busy right now. No live-search allowance was used; please retry shortly." });
      return;
    }
    console.error("[career-match] analysis error:", error);
    res.status(500).json({ code: "CAREER_MATCH_FAILED", message: "Career Match failed. No live-search allowance was used." });
  }
}