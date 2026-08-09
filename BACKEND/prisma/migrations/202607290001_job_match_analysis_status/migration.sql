ALTER TABLE "JobMatch"
ADD COLUMN "analysisStatus" TEXT NOT NULL DEFAULT 'available';

ALTER TABLE "JobMatch"
ALTER COLUMN "fitScore" DROP NOT NULL,
ALTER COLUMN "fitScore" DROP DEFAULT;

UPDATE "JobMatch"
SET "analysisStatus" = 'pending', "fitScore" = NULL
WHERE "source" = 'manual';