import { Router } from "express";
import { exportCVController } from "../controllers/cvExportController";
import { uploadToMemory, uploadMdToMemory } from "../services/importService";
import { importCVController } from "../controllers/cvImportController";
import { analyzeCVController } from "../controllers/cvAnalaysController";
import { aiWritingAssist } from "../controllers/AIWritingController";
import { GrammarController } from "../controllers/grammarCheckerController";
import { adjustCVController } from "../controllers/cvAdjustController";
import { exportAdjustedCVController } from "../controllers/exportAdjustedCVController";
import { cvChatController, interviewAnswersController } from "../controllers/cvChatController";
import { parseCvController, polishEntryController, conversationalBuildController, importCvController, optimizeCvLengthController, editFieldWithAIController, generateSmartSkillsController } from "../controllers/cvBuilderAssistController";
import { authenticateToken } from "../middleware/validateJWTMiddleware";
import { requireProUser } from "../middleware/roleMiddleware";
import { requireCredits, withUserContext } from "../middleware/creditMiddleware";
import { careerMatchController, careerMatchLimitsController } from "../controllers/careerMatchController";

import { importProjectFromUrlController, importProjectFromFileController } from "../controllers/projectImportController";
import { validateUrlMiddleware, validateFileMiddleware } from "../middleware/projectImportValidator";
import { projectImportLimiter } from "../middleware/projectImportLimiter";

const router = Router();
router.get("/exports/:cvId", authenticateToken, exportCVController);
router.post("/upload-cv", authenticateToken, uploadToMemory.single("cv"), importCVController);

router.post("/analyze", uploadToMemory.single("cv"), analyzeCVController);
router.get("/career-match/limits", authenticateToken, careerMatchLimitsController);
router.post("/career-match", authenticateToken, withUserContext, uploadToMemory.single("cv"), careerMatchController);
router.post("/import-cv", authenticateToken, requireCredits, withUserContext, uploadToMemory.single("cv"), importCvController);

router.post(
  "/import-project-url",
  authenticateToken,
  projectImportLimiter,
  validateUrlMiddleware,
  requireCredits,
  withUserContext,
  importProjectFromUrlController
);

router.post(
  "/import-project-file",
  authenticateToken,
  projectImportLimiter,
  uploadMdToMemory.single("readme"),
  validateFileMiddleware,
  requireCredits,
  withUserContext,
  importProjectFromFileController
);

router.post(
  "/ai-writing-assist",
  authenticateToken,
  requireProUser,
  requireCredits,
  withUserContext,
  aiWritingAssist
);
router.post(
  "/grammarcheck",
  authenticateToken,
  requireProUser,
  requireCredits,
  withUserContext,
  GrammarController
);
router.post(
  "/adjust-cv",
  authenticateToken,
  requireProUser,
  requireCredits,
  withUserContext,
  adjustCVController
);
router.post(
  "/export-adjusted-cv",
  authenticateToken,
  requireProUser,
  exportAdjustedCVController
);
router.post(
  "/cv-chat",
  authenticateToken,
  requireProUser,
  requireCredits,
  withUserContext,
  cvChatController
);
router.post(
  "/interview-answers",
  authenticateToken,
  requireProUser,
  requireCredits,
  withUserContext,
  interviewAnswersController
);
router.post("/parse-cv", authenticateToken, requireProUser, requireCredits, withUserContext, parseCvController);
router.post("/polish-entry", authenticateToken, requireProUser, requireCredits, withUserContext, polishEntryController);
router.post("/conversational-build", authenticateToken, requireProUser, requireCredits, withUserContext, conversationalBuildController);
router.post("/optimize-cv-length", authenticateToken, requireProUser, requireCredits, withUserContext, optimizeCvLengthController);
router.post("/edit-field-ai", authenticateToken, requireProUser, requireCredits, withUserContext, editFieldWithAIController);
router.post("/generate-smart-skills", authenticateToken, requireProUser, requireCredits, withUserContext, generateSmartSkillsController);

export default router;
