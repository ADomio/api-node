-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "traffic_source_id" INTEGER;

-- CreateTable
CREATE TABLE "traffic_sources" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "queryParams" JSONB NOT NULL,
    "custom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "traffic_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "traffic_sources_name_key" ON "traffic_sources"("name");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_traffic_source_id_fkey" FOREIGN KEY ("traffic_source_id") REFERENCES "traffic_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
