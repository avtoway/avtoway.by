/*
  Warnings:

  - You are about to drop the `partner_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partner_socials` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "partners" ADD COLUMN "instagram" TEXT;
ALTER TABLE "partners" ADD COLUMN "telegram" TEXT;
ALTER TABLE "partners" ADD COLUMN "vk" TEXT;
ALTER TABLE "partners" ADD COLUMN "youtube" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "partner_photos";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "partner_socials";
PRAGMA foreign_keys=on;
