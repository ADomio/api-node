-- DropForeignKey
ALTER TABLE "filters" DROP CONSTRAINT "filters_stream_id_fkey";

-- AddForeignKey
ALTER TABLE "filters" ADD CONSTRAINT "filters_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
