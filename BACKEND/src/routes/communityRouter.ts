import { Router } from "express";
import { communityController } from "../controllers/communityController";

const router = Router();

router.get("/", communityController);

export default router;
