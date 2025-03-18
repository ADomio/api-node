/*
  Warnings:

  - You are about to drop the column `expenses` on the `campaigns` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `campaigns` table. All the data in the column will be lost.
  - The `status` column on the `campaigns` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `streams` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `filters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `operation` on the `filters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Statuses" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "FilterTypes" AS ENUM ('country', 'device', 'browser', 'language', 'os', 'ip_range', 'referrer', 'keyword', 'utm_source', 'utm_medium', 'utm_campaign');

-- CreateEnum
CREATE TYPE "FilterOperations" AS ENUM ('equals', 'contains', 'not_equals', 'regex');

-- CreateEnum
CREATE TYPE "Currencies" AS ENUM ('usd', 'eur', 'rub');

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "expenses",
DROP COLUMN "profit",
ADD COLUMN     "currency" "Currencies" NOT NULL DEFAULT 'usd',
DROP COLUMN "status",
ADD COLUMN     "status" "Statuses" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "filters" DROP COLUMN "type",
ADD COLUMN     "type" "FilterTypes" NOT NULL,
DROP COLUMN "operation",
ADD COLUMN     "operation" "FilterOperations" NOT NULL;

-- AlterTable
ALTER TABLE "streams" DROP COLUMN "status",
ADD COLUMN     "status" "Statuses" NOT NULL DEFAULT 'active';

-- DropEnum
DROP TYPE "FilterOperation";

-- DropEnum
DROP TYPE "FilterType";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "campaign_expenses" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "campaign_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_profits" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaign_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "campaign_profits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campaign_expenses" ADD CONSTRAINT "campaign_expenses_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_profits" ADD CONSTRAINT "campaign_profits_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
