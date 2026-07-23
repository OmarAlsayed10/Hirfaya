import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { countDistinctCountries } from "../lib/countryNormalize";

export const communityController = async (_req: Request, res: Response) => {
  try {
    const [cvsCreated, cvsAnalyzed, approvedReviews, jobLocations, jobMatchLocations] = await Promise.all([
      prisma.cV.count(),
      prisma.analysisEvent.count(),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          displayName: true,
          rating: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.job.findMany({ select: { location: true } }),
      prisma.jobMatch.findMany({ select: { location: true }, distinct: ["location"] }),
    ]);

    const allLocations = [
      ...jobLocations.map((j: { location: string | null }) => j.location),
      ...jobMatchLocations.map((j: { location: string | null }) => j.location),
    ];
    const countries = countDistinctCountries(allLocations);

    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
      ? Math.round((approvedReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : null;

    res.json({
      cvsCreated,
      cvsAnalyzed,
      averageRating,
      reviewCount,
      countries,
      reviews: approvedReviews,
    });
  } catch (error) {
    console.error("Community metrics error:", error);
    res.status(500).json({ message: "Failed to load community data." });
  }
};
