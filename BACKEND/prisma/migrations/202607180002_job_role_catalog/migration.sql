ALTER TABLE "JobPreference"
ADD COLUMN "roleIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TYPE "JobRoleSuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "JobCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobRoleSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "note" TEXT,
    "status" "JobRoleSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobRoleSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobCategory_name_key" ON "JobCategory"("name");
CREATE UNIQUE INDEX "JobRole_categoryId_name_key" ON "JobRole"("categoryId", "name");
CREATE INDEX "JobRole_categoryId_active_idx" ON "JobRole"("categoryId", "active");
CREATE INDEX "JobRoleSuggestion_status_createdAt_idx" ON "JobRoleSuggestion"("status", "createdAt");
CREATE INDEX "JobRoleSuggestion_userId_createdAt_idx" ON "JobRoleSuggestion"("userId", "createdAt");

ALTER TABLE "JobRole"
ADD CONSTRAINT "JobRole_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "JobCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobRoleSuggestion"
ADD CONSTRAINT "JobRoleSuggestion_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "JobCategory" ("id", "name", "updatedAt") VALUES
('cat-technology', 'Software & Technology', CURRENT_TIMESTAMP),
('cat-life-sciences', 'Biology & Life Sciences', CURRENT_TIMESTAMP),
('cat-healthcare', 'Healthcare', CURRENT_TIMESTAMP),
('cat-business', 'Business & Finance', CURRENT_TIMESTAMP),
('cat-engineering', 'Engineering', CURRENT_TIMESTAMP),
('cat-education', 'Education & Research', CURRENT_TIMESTAMP);

INSERT INTO "JobRole" ("id", "categoryId", "name", "updatedAt") VALUES
('role-frontend-developer', 'cat-technology', 'Frontend Developer', CURRENT_TIMESTAMP),
('role-backend-developer', 'cat-technology', 'Backend Developer', CURRENT_TIMESTAMP),
('role-full-stack-developer', 'cat-technology', 'Full Stack Developer', CURRENT_TIMESTAMP),
('role-mobile-developer', 'cat-technology', 'Mobile Developer', CURRENT_TIMESTAMP),
('role-devops-engineer', 'cat-technology', 'DevOps Engineer', CURRENT_TIMESTAMP),
('role-data-engineer', 'cat-technology', 'Data Engineer', CURRENT_TIMESTAMP),
('role-qa-engineer', 'cat-technology', 'QA Engineer', CURRENT_TIMESTAMP),
('role-ui-ux-designer', 'cat-technology', 'UI/UX Designer', CURRENT_TIMESTAMP),
('role-cybersecurity-analyst', 'cat-technology', 'Cybersecurity Analyst', CURRENT_TIMESTAMP),
('role-biologist', 'cat-life-sciences', 'Biologist', CURRENT_TIMESTAMP),
('role-molecular-biologist', 'cat-life-sciences', 'Molecular Biologist', CURRENT_TIMESTAMP),
('role-microbiologist', 'cat-life-sciences', 'Microbiologist', CURRENT_TIMESTAMP),
('role-biotechnologist', 'cat-life-sciences', 'Biotechnologist', CURRENT_TIMESTAMP),
('role-bioinformatics-analyst', 'cat-life-sciences', 'Bioinformatics Analyst', CURRENT_TIMESTAMP),
('role-laboratory-technician', 'cat-life-sciences', 'Laboratory Technician', CURRENT_TIMESTAMP),
('role-research-assistant', 'cat-life-sciences', 'Research Assistant', CURRENT_TIMESTAMP),
('role-doctor', 'cat-healthcare', 'Doctor', CURRENT_TIMESTAMP),
('role-nurse', 'cat-healthcare', 'Nurse', CURRENT_TIMESTAMP),
('role-pharmacist', 'cat-healthcare', 'Pharmacist', CURRENT_TIMESTAMP),
('role-medical-lab-scientist', 'cat-healthcare', 'Medical Laboratory Scientist', CURRENT_TIMESTAMP),
('role-physiotherapist', 'cat-healthcare', 'Physiotherapist', CURRENT_TIMESTAMP),
('role-accountant', 'cat-business', 'Accountant', CURRENT_TIMESTAMP),
('role-financial-analyst', 'cat-business', 'Financial Analyst', CURRENT_TIMESTAMP),
('role-business-analyst', 'cat-business', 'Business Analyst', CURRENT_TIMESTAMP),
('role-sales-representative', 'cat-business', 'Sales Representative', CURRENT_TIMESTAMP),
('role-marketing-specialist', 'cat-business', 'Marketing Specialist', CURRENT_TIMESTAMP),
('role-hr-specialist', 'cat-business', 'HR Specialist', CURRENT_TIMESTAMP),
('role-project-manager', 'cat-business', 'Project Manager', CURRENT_TIMESTAMP),
('role-civil-engineer', 'cat-engineering', 'Civil Engineer', CURRENT_TIMESTAMP),
('role-mechanical-engineer', 'cat-engineering', 'Mechanical Engineer', CURRENT_TIMESTAMP),
('role-electrical-engineer', 'cat-engineering', 'Electrical Engineer', CURRENT_TIMESTAMP),
('role-chemical-engineer', 'cat-engineering', 'Chemical Engineer', CURRENT_TIMESTAMP),
('role-architect', 'cat-engineering', 'Architect', CURRENT_TIMESTAMP),
('role-teacher', 'cat-education', 'Teacher', CURRENT_TIMESTAMP),
('role-lecturer', 'cat-education', 'Lecturer', CURRENT_TIMESTAMP),
('role-academic-researcher', 'cat-education', 'Academic Researcher', CURRENT_TIMESTAMP),
('role-instructional-designer', 'cat-education', 'Instructional Designer', CURRENT_TIMESTAMP);

UPDATE "JobPreference" AS preference
SET "roleIds" = ARRAY[role."id"]
FROM "JobRole" AS role
WHERE LOWER(TRIM(preference."role")) = LOWER(role."name");
