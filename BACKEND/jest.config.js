module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Both layouts are in use — tests beside their source and tests under __tests__.
  // Matching only the latter silently skipped the payment, pricing and entitlement suites.
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};
