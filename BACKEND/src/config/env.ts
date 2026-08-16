const REQUIRED = [
  "DATABASE_URL",
  "JWT_SECRET_Key",
  "CLIENT_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "ADMIN_EMAIL",
  "INSTAPAY_BANK_NAME",
  "INSTAPAY_ACCOUNT_NAME",
  "INSTAPAY_ACCOUNT_NUMBER",
  "CREDENTIAL_ENCRYPTION_KEY",
  // Credit pricing refuses to quote without it, so an unset value turns every credit
  // purchase into a 503 that looks like an outage rather than a missing variable.
  "USD_TO_EGP_RATE",
] as const;

export const parseTrustProxyHops = (value = process.env.TRUST_PROXY_HOPS): number => {
  const configuredValue = value ?? "0";
  const hops = Number(configuredValue);
  if (!/^\d+$/.test(configuredValue) || !Number.isSafeInteger(hops)) {
    throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.");
  }
  return hops;
};

export function validateEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
