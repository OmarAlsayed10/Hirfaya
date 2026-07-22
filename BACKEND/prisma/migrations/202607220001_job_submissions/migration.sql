CREATE TYPE "JobSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "JobSubmission" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "location" TEXT,
  "remote" BOOLEAN NOT NULL DEFAULT false,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "JobSubmissionStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "JobSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "JobSubmission_status_createdAt_idx" ON "JobSubmission"("status", "createdAt");
CREATE INDEX "JobSubmission_userId_createdAt_idx" ON "JobSubmission"("userId", "createdAt");