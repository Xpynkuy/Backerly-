-- AlterTable
ALTER TABLE "users" ADD COLUMN     "creatorActivatedAt" TIMESTAMP(3),
ADD COLUMN     "isCreator" BOOLEAN NOT NULL DEFAULT false;
