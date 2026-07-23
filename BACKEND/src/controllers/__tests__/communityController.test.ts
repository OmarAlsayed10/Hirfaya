import { communityController } from "../communityController";
import prisma from "../../lib/prisma";

jest.mock("../../lib/prisma", () => ({
  __esModule: true,
  default: {
    cV: { count: jest.fn() },
    analysisEvent: { count: jest.fn() },
    review: { findMany: jest.fn() },
    job: { findMany: jest.fn() },
    jobMatch: { findMany: jest.fn() },
  },
}));

describe("communityController", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("returns live metrics and approved reviews", async () => {
    (prisma.cV.count as any).mockResolvedValue(150);
    (prisma.analysisEvent.count as any).mockResolvedValue(75);
    (prisma.review.findMany as any).mockResolvedValue([
      { id: "r1", displayName: "Alice S.", rating: 5, description: "Awesome!", createdAt: new Date() },
      { id: "r2", displayName: "Bob K.", rating: 4, description: "Great tool!", createdAt: new Date() },
    ]);
    (prisma.job.findMany as any).mockResolvedValue([
      { location: "Cairo, Egypt" },
      { location: "Dubai, UAE" },
    ]);
    (prisma.jobMatch.findMany as any).mockResolvedValue([
      { location: "New York, USA" },
    ]);

    await communityController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      cvsCreated: 150,
      cvsAnalyzed: 75,
      averageRating: 4.5,
      reviewCount: 2,
      countries: 3,
      reviews: expect.arrayContaining([
        expect.objectContaining({ id: "r1", rating: 5 }),
        expect.objectContaining({ id: "r2", rating: 4 }),
      ]),
    });
  });

  it("handles empty reviews correctly", async () => {
    (prisma.cV.count as any).mockResolvedValue(0);
    (prisma.analysisEvent.count as any).mockResolvedValue(0);
    (prisma.review.findMany as any).mockResolvedValue([]);
    (prisma.job.findMany as any).mockResolvedValue([]);
    (prisma.jobMatch.findMany as any).mockResolvedValue([]);

    await communityController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      cvsCreated: 0,
      cvsAnalyzed: 0,
      averageRating: null,
      reviewCount: 0,
      countries: 0,
      reviews: [],
    });
  });
});
