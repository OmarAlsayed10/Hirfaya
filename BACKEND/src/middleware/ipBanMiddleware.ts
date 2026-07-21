import { Request, Response, NextFunction } from "express";
import { isIpBanned } from "../lib/banCache";

const clientIp = (req: Request): string =>
  req.ip || req.socket.remoteAddress || "unknown";

export const blockBannedIp = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (isIpBanned(clientIp(req))) {
    res.status(403).json({ message: "Access denied." });
    return;
  }
  next();
};
