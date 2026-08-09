import { Router } from "express";
import {
  saveCV,
  getUserCVs,
  getCV,
  editCV,
  removeCV,
  makePrimaryCV,
  getPrimary,
} from "../controllers/cvBuilderController";
import { exportCvPdfController } from "../controllers/cvPdfExportController";
import { authenticateToken } from "../middleware/validateJWTMiddleware";

const router = Router();

router.post("/save", authenticateToken, saveCV);

router.post("/export-pdf", authenticateToken, exportCvPdfController);

router.get("/user", authenticateToken, getUserCVs);

router.get("/primary", authenticateToken, getPrimary);

router.patch("/:cvId/primary", authenticateToken, makePrimaryCV);

router.get("/:cvId", authenticateToken, getCV);

router.put("/:cvId", authenticateToken, editCV);

router.delete("/:cvId", authenticateToken, removeCV);

export default router;
