/*
  Warnings:

  - Added the required column `accountNo` to the `Restaurants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regNo` to the `Restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Restaurants" ADD COLUMN     "accountNo" VARCHAR(255) NOT NULL,
ADD COLUMN     "regNo" VARCHAR(255) NOT NULL;
