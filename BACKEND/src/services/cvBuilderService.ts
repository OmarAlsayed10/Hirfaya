import { StatusCodes } from "http-status-codes";
import { CVParams } from "../types/cvBuilder.types";
import prisma from "../lib/prisma";

// Create CV
export const createCV = async (cvData: CVParams & { userId: string }) => {
  try {
    const cv = await prisma.cV.create({
      data: {
        userId: cvData.userId,
        personalInfo: cvData.personalInfo ?? {},
        experience: cvData.experience ?? [],
        education: cvData.education ?? [],
        projects: cvData.projects ?? [],
        skills: cvData.skills ?? { skills: [], languages: "", certifications: "" },
      },
    });
    return {
      status: StatusCodes.CREATED,
      message: "CV created successfully",
      cv,
    };
  } catch (error) {
    return {
      status: StatusCodes.BAD_REQUEST,
      error: { message: "Failed to create CV" },
    };
  }
};

// Get CVs by User ID
export const getCVsByUser = async (userId: string) => {
  try {
    const cvs = await prisma.cV.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return cvs || [];
  } catch (error) {
    return {
      status: StatusCodes.BAD_REQUEST,
      error: { message: "Failed to fetch CVs" },
    };
  }
};

// Get CV by ID — scoped to its owner so users cannot read others' CVs.
export const getCVById = async (cvId: string, userId: string) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: { id: cvId, userId },
    });
    if (!cv) {
      return {
        status: StatusCodes.NOT_FOUND,
        error: { message: "CV not found" },
      };
    }
    return {
      status: StatusCodes.OK,
      cv,
    };
  } catch (error) {
    return {
      status: StatusCodes.BAD_REQUEST,
      error: { message: "Failed to fetch CV" },
    };
  }
};

// Update CV — only if it belongs to the requesting user.
export const updateCV = async (cvId: string, userId: string, cvData: Partial<CVParams>) => {
  try {
    const result = await prisma.cV.updateMany({
      where: { id: cvId, userId },
      data: {
        ...(cvData.personalInfo && { personalInfo: cvData.personalInfo ?? {} }),
        ...(cvData.experience && { experience: cvData.experience ?? [] }),
        ...(cvData.education && { education: cvData.education ?? [] }),
        ...(cvData.projects && { projects: cvData.projects ?? [] }),
        ...(cvData.skills && { skills: cvData.skills ?? { skills: [], languages: "", certifications: "" } }),
      },
    });
    if (result.count === 0) {
      return { status: StatusCodes.NOT_FOUND, error: { message: "CV not found" } };
    }
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    return {
      status: StatusCodes.OK,
      message: "CV updated successfully",
      cv,
    };
  } catch (error: any) {
    return {
      status: StatusCodes.BAD_REQUEST,
      error: { message: "Failed to update CV" },
    };
  }
};

// Delete CV — only if it belongs to the requesting user.
export const deleteCV = async (cvId: string, userId: string) => {
  try {
    const result = await prisma.cV.deleteMany({
      where: { id: cvId, userId },
    });
    if (result.count === 0) {
      return { status: StatusCodes.NOT_FOUND, error: { message: "CV not found" } };
    }
    return {
      status: StatusCodes.OK,
      message: "CV deleted successfully",
    };
  } catch (error: any) {
    return {
      status: StatusCodes.BAD_REQUEST,
      error: { message: "Failed to delete CV" },
    };
  }
};

// Marks one CV primary for its owner and clears the flag on the user's other CVs.
export const setPrimaryCV = async (cvId: string, userId: string) => {
  const owned = await prisma.cV.findFirst({ where: { id: cvId, userId } });
  if (!owned) {
    return { status: StatusCodes.NOT_FOUND, error: { message: "CV not found" } };
  }
  await prisma.$transaction([
    prisma.cV.updateMany({ where: { userId, isPrimary: true }, data: { isPrimary: false } }),
    prisma.cV.update({ where: { id: cvId }, data: { isPrimary: true } }),
  ]);
  return { status: StatusCodes.OK, message: "Primary CV updated" };
};

// The user's primary CV, falling back to their most recent one.
export const getPrimaryCV = async (userId: string) => {
  const primary = await prisma.cV.findFirst({ where: { userId, isPrimary: true } });
  if (primary) return primary;
  return prisma.cV.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
};
