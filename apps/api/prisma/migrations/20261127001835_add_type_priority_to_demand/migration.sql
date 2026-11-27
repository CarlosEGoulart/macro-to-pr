/*
  Warnings:

  - Added the required column `priority` to the `Demand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Demand` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeDemand" AS ENUM ('feature', 'bug', 'refactor');

-- CreateEnum
CREATE TYPE "PriorityDemand" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "Demand" ADD COLUMN     "priority" "PriorityDemand" NOT NULL,
ADD COLUMN     "type" "TypeDemand" NOT NULL;
