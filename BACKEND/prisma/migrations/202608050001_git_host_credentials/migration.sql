-- CreateEnum
CREATE TYPE "GitHost" AS ENUM ('GITHUB', 'GITLAB');

-- CreateTable
CREATE TABLE "git_host_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "host" "GitHost" NOT NULL,
    "token" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "git_host_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "git_host_credentials_userId_host_key" ON "git_host_credentials"("userId", "host");

-- AddForeignKey
ALTER TABLE "git_host_credentials" ADD CONSTRAINT "git_host_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
