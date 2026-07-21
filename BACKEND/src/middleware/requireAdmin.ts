import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomRequest } from "./validateJWTMiddleware";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as CustomRequest).user;
  if (!user || user.role !== "admin") {
    res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required." });
    return;
  }
  next();
};
