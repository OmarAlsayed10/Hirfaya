import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../middleware/validateJWTMiddleware";
import prisma from "../lib/prisma";
import { hasPaidAccess } from "../services/entitlementService";
import {
  createCV,
  getCVsByUser,
  getCVById,
  updateCV,
  deleteCV,
  setPrimaryCV,
  getPrimaryCV,
} from "../services/cvBuilderService";

// Create CV
export const saveCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customReq = req as CustomRequest;
    const { title, template, sectionOrder, customSections, fontScale, personalInfo, experience, education, projects, skills } = customReq.body;
    const userId = customReq.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Read entitlement from the DB, not the token: a 24h JWT would keep a user who
    // just upgraded stuck at 2 CVs, and leave a lapsed one saving without limit.
    const account = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, planTier: true, proExpiresAt: true },
    });

    // A valid token whose user row is gone (account deleted in another tab) is an auth
    // failure, not a free-tier save — letting it fall through only defers the error to a
    // foreign-key violation at insert time.
    if (!account) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!hasPaidAccess(account)) {
      const userCVs = await getCVsByUser(userId);
      if (!Array.isArray(userCVs)) {
        res.status(500).json({ message: "Failed to fetch user CVs." });
        return;
      }
      if (userCVs.length >= 2) {
        res
          .status(403)
          .json({ message: "Normal Users can only save up to 2 CVs." });
        return;
      }
    }
    const result = await createCV({
      userId,
      title,
      template,
      sectionOrder,
      customSections,
      fontScale,
      personalInfo,
      experience,
      education,
      projects,
      skills,
    });

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// Get CVs by User ID
export const getUserCVs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customReq = req as CustomRequest;
    const userId = customReq.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await getCVsByUser(userId);
    // res.status(result.status).json(result);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get CV by ID
export const getCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as CustomRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { cvId } = req.params;
    const result = await getCVById(cvId, userId);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// Update CV
export const editCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as CustomRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { cvId } = req.params;
    const cvData = req.body;
    const result = await updateCV(cvId, userId, cvData);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// Delete CV
export const removeCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as CustomRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { cvId } = req.params;
    const result = await deleteCV(cvId, userId);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

// The user's primary CV (used by "pick from profile" flows).
export const getPrimary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as CustomRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const cv = await getPrimaryCV(userId);
    res.status(200).json({ cv: cv ?? null });
  } catch (error) {
    next(error);
  }
};

// Set a CV as the user's primary (used by Job Radar).
export const makePrimaryCV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as CustomRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { cvId } = req.params;
    const result = await setPrimaryCV(cvId, userId);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
