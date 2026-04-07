/*
  Warnings:

  - The `status` column on the `Donation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `donorMessage` on table `Donation` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymanetStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "donorMessage" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymanetStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "PaymentStatus";
