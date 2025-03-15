-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('country', 'device', 'browser', 'language', 'os', 'ip_range', 'referrer', 'keyword', 'utm_source', 'utm_medium', 'utm_campaign');

-- CreateEnum
CREATE TYPE "FilterOperation" AS ENUM ('equals', 'contains', 'not_equals', 'regex');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "code" TEXT NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expenses" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "target_url" TEXT NOT NULL,
    "status" "StreamStatus" NOT NULL DEFAULT 'active',
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filters" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stream_id" INTEGER NOT NULL,
    "type" "FilterType" NOT NULL,
    "operation" "FilterOperation" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "filters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_code_key" ON "campaigns"("code");

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filters" ADD CONSTRAINT "filters_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
