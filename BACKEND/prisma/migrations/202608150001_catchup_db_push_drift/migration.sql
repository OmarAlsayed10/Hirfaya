-- Catch-up migration.
--
-- These columns and tables reached the running database through `prisma db push`, so they
-- exist in production but were never recorded in the migration history. A fresh database
-- built from migrations alone (CI, a new environment, a restored backup) was therefore
-- missing them. Every statement is idempotent so this applies cleanly to both a database
-- that already has the objects and one that does not.

ALTER TABLE "CV" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "CV" ADD COLUMN IF NOT EXISTS "template" TEXT NOT NULL DEFAULT 'classic-cv';
ALTER TABLE "CV" ADD COLUMN IF NOT EXISTS "sectionOrder" JSONB;
ALTER TABLE "CV" ADD COLUMN IF NOT EXISTS "customSections" JSONB;
ALTER TABLE "CV" ADD COLUMN IF NOT EXISTS "fontScale" DOUBLE PRECISION NOT NULL DEFAULT 1;

ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "checklist" JSONB;
ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "screeningAnswers" JSONB;
ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "reminderAt" TIMESTAMP(3);
ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "workspaceData" JSONB;
ALTER TABLE "JobMatch" ADD COLUMN IF NOT EXISTS "selectedCvVariant" TEXT;

ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "reviewedByEmail" TEXT;

-- One InstaPay transfer must fund exactly one request. Without this unique index an
-- approved reference could be resubmitted and credited again, on any account — the
-- protection existed in schema.prisma but had never been recorded as a migration.
CREATE UNIQUE INDEX IF NOT EXISTS "payment_requests_referenceNumber_key" ON "payment_requests"("referenceNumber");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetOtp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetOtpExpiry" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryExpectation" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryCurrency" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "visaStatus" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "noticePeriod" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "workPreference" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "relocationOpen" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Review_status_createdAt_idx" ON "Review"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");

-- Extraction telemetry: measurements about how well the uploaded file was read, never CV
-- content. Added as separate ALTERs so a database that already has the table from an
-- earlier db push picks the columns up too, rather than being skipped by CREATE TABLE.
CREATE TABLE IF NOT EXISTS "AnalysisEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisEvent_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "producer" TEXT;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "creator" TEXT;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "pages" INTEGER;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "charsPerPage" INTEGER;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "lineClustering" DOUBLE PRECISION;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "experienceFound" BOOLEAN;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "datesParsed" BOOLEAN;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "suspect" BOOLEAN;
ALTER TABLE "AnalysisEvent" ADD COLUMN IF NOT EXISTS "score" INTEGER;
CREATE INDEX IF NOT EXISTS "AnalysisEvent_createdAt_idx" ON "AnalysisEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AnalysisEvent_suspect_idx" ON "AnalysisEvent"("suspect");
CREATE INDEX IF NOT EXISTS "AnalysisEvent_datesParsed_idx" ON "AnalysisEvent"("datesParsed");

CREATE TABLE IF NOT EXISTS "SkillRoadmap" (
    "id" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'skill',
    "officialDocs" JSONB,
    "playground" JSONB,
    "projectIdeas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "courseLinks" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SkillRoadmap_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SkillRoadmap_skillKey_key" ON "SkillRoadmap"("skillKey");
CREATE INDEX IF NOT EXISTS "SkillRoadmap_skillKey_idx" ON "SkillRoadmap"("skillKey");

CREATE TABLE IF NOT EXISTS "UserSkillProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillRoadmapId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "learnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserSkillProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserSkillProgress_userId_skillRoadmapId_key" ON "UserSkillProgress"("userId", "skillRoadmapId");
CREATE INDEX IF NOT EXISTS "UserSkillProgress_userId_status_idx" ON "UserSkillProgress"("userId", "status");

CREATE TABLE IF NOT EXISTS "ai_cache" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_cache_pkey" PRIMARY KEY ("key")
);

-- ADD CONSTRAINT has no IF NOT EXISTS, so each foreign key is guarded by name.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Review_userId_fkey') THEN
    ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserSkillProgress_userId_fkey') THEN
    ALTER TABLE "UserSkillProgress" ADD CONSTRAINT "UserSkillProgress_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserSkillProgress_skillRoadmapId_fkey') THEN
    ALTER TABLE "UserSkillProgress" ADD CONSTRAINT "UserSkillProgress_skillRoadmapId_fkey"
      FOREIGN KEY ("skillRoadmapId") REFERENCES "SkillRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
