export const displayName = (...parts: Array<string | null | undefined>): string =>
  parts.map((part) => part?.trim()).filter(Boolean).join(" ");
