-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('Draft', 'AwaitingPlanApproval', 'AwaitingNewPlan', 'PlanApproved', 'InExecution', 'ReadyForPR', 'Concluded');

-- CreateTable
CREATE TABLE "Demand" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "status" "DemandStatus" NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
