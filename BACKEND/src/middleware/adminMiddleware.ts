import { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";

export const requireAdminSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const provided = req.headers["x-admin-secret"];
  const expected = process.env.ADMIN_SECRET!;

  if (
    typeof provided !== "string" ||
    provided.length !== expected.length ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
};
