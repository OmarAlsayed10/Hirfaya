CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Job_title_trgm_idx"
ON "Job" USING GIN ("title" gin_trgm_ops);

CREATE INDEX "Job_description_trgm_idx"
ON "Job" USING GIN ("description" gin_trgm_ops);

CREATE INDEX "Job_location_trgm_idx"
ON "Job" USING GIN ("location" gin_trgm_ops);

CREATE INDEX "Job_remote_postedAt_idx"
ON "Job" ("remote", "postedAt" DESC);