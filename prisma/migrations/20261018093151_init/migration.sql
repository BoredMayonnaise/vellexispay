-- CreateEnum
CREATE TYPE "TierName" AS ENUM ('draft', 'standard', 'premium');

-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL,
    "name" "TierName" NOT NULL,
    "loadPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "costPer1k" INTEGER NOT NULL,
    "contextLimit" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteLog" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "modelId" TEXT,
    "requested" "TierName" NOT NULL,
    "served" "TierName" NOT NULL,
    "shed" BOOLEAN NOT NULL DEFAULT false,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tier_name_key" ON "Tier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_providerId_key" ON "Model"("providerId");

-- CreateIndex
CREATE INDEX "Model_tierId_enabled_idx" ON "Model"("tierId", "enabled");

-- CreateIndex
CREATE INDEX "RouteLog_createdAt_idx" ON "RouteLog"("createdAt");

-- CreateIndex
CREATE INDEX "RouteLog_tierId_shed_idx" ON "RouteLog"("tierId", "shed");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteLog" ADD CONSTRAINT "RouteLog_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteLog" ADD CONSTRAINT "RouteLog_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;
