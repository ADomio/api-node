-- DropForeignKey
ALTER TABLE "campaign_expenses" DROP CONSTRAINT "campaign_expenses_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "campaign_profits" DROP CONSTRAINT "campaign_profits_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "streams" DROP CONSTRAINT "streams_campaign_id_fkey";

-- AddForeignKey
ALTER TABLE "campaign_expenses" ADD CONSTRAINT "campaign_expenses_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_profits" ADD CONSTRAINT "campaign_profits_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
