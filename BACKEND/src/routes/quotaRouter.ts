import { Router } from "express";
import { quotaStatusController } from "../controllers/quotaController";

const router = Router();

router.get("/status", quotaStatusController);

export default router;
