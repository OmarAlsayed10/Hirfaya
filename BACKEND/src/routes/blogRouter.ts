import { Router } from "express";
import {
  listPublishedBlogsController,
  getBlogController,
} from "../controllers/blogController";

const router = Router();

router.get("/", listPublishedBlogsController);
router.get("/:slug", getBlogController);

export default router;
