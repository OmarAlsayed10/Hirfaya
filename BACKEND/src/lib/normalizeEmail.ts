// Postgres unique constraints compare case-sensitively, so "Ada@x.com" and
// "ada@x.com" would register as two accounts and neither would find the other at
// login. Every email lookup and write goes through this so one address is one row.
export const normalizeEmail = (email: unknown): string =>
  String(email ?? "").trim().toLowerCase();
