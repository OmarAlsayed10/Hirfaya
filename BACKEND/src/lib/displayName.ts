export const displayName = (firstName?: string | null, lastName?: string | null): string =>
  [firstName, lastName].map((part) => part?.trim()).filter(Boolean).join(" ");
