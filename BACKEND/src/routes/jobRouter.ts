import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken, CustomRequest } from "../middleware/validateJWTMiddleware";
import {
  getPreferenceController,
  setPreferenceController,
  getMatchesController,
  updateMatchStatusController,
  refreshMatchesController,
  generateCoverLetterController,
  getAnalyticsController,
  generateVariantsController,
  updateVariantOutcomeController,
} from "../controllers/jobRadarController";
import {
  getJobCatalogController,
  submitRoleSuggestionController,
} from "../controllers/jobCatalogController";
import { submitJobController } from "../controllers/jobSubmissionController";

const recalculationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as CustomRequest).user!.userId,
  message: { code: "JOB_RADAR_REFRESH_LIMIT", message: "Too many refreshes. Try again in a few minutes." },
});

const router = Router();

router.use(authenticateToken);

router.get("/catalog", getJobCatalogController);
router.post("/role-suggestions", submitRoleSuggestionController);
router.post("/submissions", submitJobController);

router.get("/preference", getPreferenceController);
router.post("/preference", recalculationLimiter, setPreferenceController);
router.get("/matches", getMatchesController);
router.patch("/matches/:id/status", updateMatchStatusController);
router.post("/refresh", recalculationLimiter, refreshMatchesController);
router.post("/matches/:id/cover-letter", generateCoverLetterController);
router.get("/analytics", getAnalyticsController);
router.post("/matches/:id/variants", generateVariantsController);
router.patch("/variants/:id/outcome", updateVariantOutcomeController);

export default router;
