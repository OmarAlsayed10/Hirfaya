import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isUserBanned } from "../lib/banCache";

export interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
    proExpiresAt?: Date;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customReq = req as CustomRequest;

  const token =
    customReq.cookies?.token || customReq.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_Key!) as {
      userId: string;
      email: string;
      role: string;
      proExpiresAt: Date;
    };

    if (isUserBanned(decoded.userId)) {
      res.status(403).json({ code: "ACCOUNT_SUSPENDED", message: "Account suspended." });
      return;
    }

    customReq.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      proExpiresAt: decoded.proExpiresAt,
    };

    next();
  } catch (err) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "Invalid or expired token." });
    return;
  }
};
