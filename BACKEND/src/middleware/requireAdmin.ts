import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomRequest } from "./validateJWTMiddleware";
import prisma from "../lib/prisma";

const deny = (res: Response): void => {
  res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required." });
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as CustomRequest).user;
  if (!user) {
    deny(res);
    return;
  }

  // The JWT carries a role for 24h, so a demoted admin would keep access until
  // it expires. Admin routes are low traffic, so re-read the live role.
  const current = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { role: true },
  });

  if (current?.role !== "admin") {
    deny(res);
    return;
  }

  next();
};
