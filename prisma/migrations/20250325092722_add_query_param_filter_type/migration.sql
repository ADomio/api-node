-- AlterEnum
ALTER TYPE "FilterTypes" ADD VALUE 'query_param';

-- AlterTable
ALTER TABLE "filters" ADD COLUMN     "param_name" TEXT;
