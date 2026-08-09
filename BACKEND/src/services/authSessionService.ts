import { Response } from "express";
import jwt from "jsonwebtoken";

type TokenUser = {
  id: string;
  email: string;
  role: string;
  planTier?: string;
  proExpiresAt: Date | null;
};

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const createAuthToken = (user: TokenUser): string =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      planTier: user.planTier ?? "basic",
      proExpiresAt: user.proExpiresAt ? user.proExpiresAt.getTime() : null,
    },
    process.env.JWT_SECRET_Key!,
    { expiresIn: "1d" },
  );

export const setAuthCookie = (response: Response, token: string): void => {
  response.cookie("token", token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (response: Response): void => {
  response.clearCookie("token", AUTH_COOKIE_OPTIONS);
};

export const issueAuthToken = (response: Response, user: TokenUser): string => {
  const token = createAuthToken(user);
  setAuthCookie(response, token);
  return token;
};
