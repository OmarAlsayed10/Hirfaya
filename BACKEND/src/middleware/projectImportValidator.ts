import { Request, Response, NextFunction } from "express";
import { PROJECT_IMPORT_CONSTANTS } from "../config/projectImportConstants";

const ALLOWED_DOMAINS = ["github.com", "gitlab.com", "raw.githubusercontent.com"];

// Private/Local IP ranges for SSRF protection
const BLOCKED_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|0\.|169\.254\.|localhost)/i;

/**
 * Validates and sanitizes a GitHub/GitLab URL string.
 */
export function validateProjectUrl(urlStr: unknown): { isValid: boolean; normalizedUrl?: string; error?: string } {
  if (typeof urlStr !== "string" || !urlStr.trim()) {
    return { isValid: false, error: "Project URL is required." };
  }

  const trimmedUrl = urlStr.trim();
  if (trimmedUrl.length > 2048) {
    return { isValid: false, error: "URL exceeds maximum length of 2048 characters." };
  }

  // Check for path traversal or encoded path traversal
  if (trimmedUrl.includes("..") || trimmedUrl.includes("%2e%2e") || trimmedUrl.includes("%2E%2E")) {
    return { isValid: false, error: "Invalid path traversal sequence in URL." };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    // Protocol must be HTTPS
    if (parsedUrl.protocol !== "https:") {
      return { isValid: false, error: "Only HTTPS URLs are supported." };
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Check SSRF blocked IP patterns
    if (BLOCKED_IP_REGEX.test(hostname)) {
      return { isValid: false, error: "Access to private or local network resources is forbidden." };
    }

    // Must match allowed domain list
    const isDomainAllowed = ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );

    if (!isDomainAllowed) {
      return { isValid: false, error: "Only public repositories on GitHub or GitLab are supported." };
    }

    return { isValid: true, normalizedUrl: parsedUrl.toString() };
  } catch {
    return { isValid: false, error: "Invalid URL format." };
  }
}

/**
 * Express middleware to validate request body URL for project import.
 */
export function validateUrlMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { url } = req.body;
  const validation = validateProjectUrl(url);

  if (!validation.isValid) {
    res.status(400).json({ message: validation.error });
    return;
  }

  req.body.normalizedUrl = validation.normalizedUrl;
  next();
}

/**
 * Express middleware to validate uploaded markdown file.
 */
export function validateFileMiddleware(req: Request, res: Response, next: NextFunction): void {
  const file = (req as Request & { file?: Express.Multer.File }).file;

  if (!file) {
    res.status(400).json({ message: "No markdown file uploaded." });
    return;
  }

  // Size check
  if (file.size > PROJECT_IMPORT_CONSTANTS.MAX_FILE_SIZE_BYTES) {
    res.status(400).json({
      message: `File size exceeds the 500 KB limit. (Uploaded: ${Math.round(file.size / 1024)} KB)`,
    });
    return;
  }

  // Extension check
  const originalName = file.originalname.toLowerCase();
  if (!originalName.endsWith(".md") && !originalName.endsWith(".markdown")) {
    res.status(400).json({ message: "Only Markdown (.md, .markdown) files are permitted." });
    return;
  }

  // MIME type check
  const allowedMimeTypes = ["text/markdown", "text/plain", "text/x-markdown", "application/octet-stream"];
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    res.status(400).json({ message: "Invalid file type. Please upload a plain text Markdown file." });
    return;
  }

  // Null byte / binary check
  const bufferString = file.buffer.toString("utf8");
  if (bufferString.includes("\0")) {
    res.status(400).json({ message: "File contains invalid binary content or null bytes." });
    return;
  }

  next();
}

/**
 * Sanitizes raw README text before passing it to AI.
 * Strips HTML tags, script elements, tracking pixels, and truncates to MAX_README_CHARS.
 */
export function sanitizeReadmeContent(rawText: string): string {
  if (!rawText) return "";

  let sanitized = rawText
    .normalize("NFC")
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove all HTML tags
    .replace(/<[^>]+>/g, "")
    // Remove javascript: URLs
    .replace(/javascript\s*:/gi, "")
    // Remove external image references to prevent tracking pixels (e.g. ![badge](http://...))
    .replace(/!\[.*?\]\((https?:\/\/.*?)\)/gi, "");

  // Truncate to maximum allowed characters
  if (sanitized.length > PROJECT_IMPORT_CONSTANTS.MAX_README_CHARS) {
    sanitized = sanitized.slice(0, PROJECT_IMPORT_CONSTANTS.MAX_README_CHARS);
  }

  return sanitized.trim();
}
