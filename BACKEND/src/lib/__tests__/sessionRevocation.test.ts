import {
  revokeSessions,
  isSessionRevoked,
} from "../sessionRevocationCache";

describe("Session Revocation Cache", () => {
  const userId = "test-user-123";

  test("accepts session for an unknown / non-revoked user", () => {
    expect(isSessionRevoked("unknown-user", Date.now())).toBe(false);
  });

  test("rejects token issued before revocation timestamp", () => {
    const revokedAt = new Date(1700000000000);
    revokeSessions(userId, revokedAt);

    const olderSessionStart = 1699999999000;
    expect(isSessionRevoked(userId, olderSessionStart)).toBe(true);
  });

  test("accepts token issued after revocation timestamp", () => {
    const revokedAt = new Date(1700000000000);
    revokeSessions(userId, revokedAt);

    const newerSessionStart = 1700000001000;
    expect(isSessionRevoked(userId, newerSessionStart)).toBe(false);
  });

  test("rejects token without sessionStart timestamp when user is revoked", () => {
    const revokedAt = new Date(1700000000000);
    revokeSessions(userId, revokedAt);

    expect(isSessionRevoked(userId, undefined)).toBe(true);
  });

  // Without eviction the map grows with every logout for the lifetime of the process.
  // A revocation older than the longest-lived token can no longer reject anything.
  test("drops revocations older than the maximum token lifetime", () => {
    const longAgo = new Date(1700000000000);
    revokeSessions("stale-user", longAgo);
    expect(isSessionRevoked("stale-user", longAgo.getTime() - 1000)).toBe(true);

    const wellAfterTokenExpiry = new Date(longAgo.getTime() + 25 * 60 * 60 * 1000);
    revokeSessions("another-user", wellAfterTokenExpiry);

    expect(isSessionRevoked("stale-user", longAgo.getTime() - 1000)).toBe(false);
  });
});
