/*
  Warnings:

  - The `githubAccountId` column on the `Developer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `githubAccountId` on the `Repository` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Developer" DROP COLUMN "githubAccountId",
ADD COLUMN     "githubAccountId" UUID;

-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "githubAccountId",
ADD COLUMN     "githubAccountId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "GitHubAccount" (
    "id" UUID NOT NULL,
    "githubUserId" TEXT NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAccount_githubUserId_key" ON "GitHubAccount"("githubUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_githubAccountId_key" ON "Developer"("githubAccountId");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_githubAccountId_fkey" FOREIGN KEY ("githubAccountId") REFERENCES "GitHubAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
