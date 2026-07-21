import { Response } from "express";
import { isGroqRateLimit } from "./groqChat";

// Single place for the "an AI handler threw" response: log server-side, map quota /
// Groq rate-limit to 429, and return a generic 500 message otherwise — so internal
// error details never leak to the client.
export function sendAiError(
  res: Response,
  error: unknown,
  label: string,
  failMessage: string,
): void {
  console.error(`${label}:`, error);
  if ((error as { isQuotaError?: boolean })?.isQuotaError || isGroqRateLimit(error)) {
    res.status(429).json({ message: "You have hit your limit. Contact admin." });
    return;
  }
  res.status(500).json({ message: failMessage });
}
