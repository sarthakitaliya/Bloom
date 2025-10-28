/*
  Warnings:

  - You are about to drop the `Snapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Snapshot" DROP CONSTRAINT "Snapshot_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "currentSnapshotAt" TIMESTAMP(3),
ADD COLUMN     "currentSnapshotS3Key" TEXT;

-- DropTable
DROP TABLE "public"."Snapshot";

-- DropEnum
DROP TYPE "public"."SnapshotType";
