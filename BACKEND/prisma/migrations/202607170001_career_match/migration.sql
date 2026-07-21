ALTER TABLE "User"
ADD COLUMN "liveMarketSearches" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "liveMarketPeriod" TEXT;

CREATE TABLE "CareerMatchCache" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cacheKey" TEXT NOT NULL,
  "response" JSONB NOT NULL,
  "usesLiveSearch" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CareerMatchCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CareerMatchCache_userId_cacheKey_key"
ON "CareerMatchCache"("userId", "cacheKey");

CREATE INDEX "CareerMatchCache_expiresAt_idx"
ON "CareerMatchCache"("expiresAt");

ALTER TABLE "CareerMatchCache"
ADD CONSTRAINT "CareerMatchCache_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;