import { z } from "zod";

export class InvalidAiResponseError extends Error {
  constructor(message = "The AI provider returned an invalid response.") {
    super(message);
    this.name = "InvalidAiResponseError";
  }
}

export function parseAiResponse<T>(raw: string, schema: z.ZodType<T>): T {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new InvalidAiResponseError("The AI provider returned malformed JSON.");
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    // Do not log the response: it can contain the user's CV. Paths are enough to debug the contract.
    console.error(
      "AI response schema validation failed:",
      parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code })),
    );
    throw new InvalidAiResponseError();
  }

  return parsed.data;
}

export const untrustedCandidatePayload = (
  cvText: string,
  targetRole = "",
  jobDescription = "",
): string => JSON.stringify({ cvText, targetRole, jobDescription });
