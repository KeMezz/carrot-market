-- AlterTable
-- Additive only: counts failed verification attempts per login code.
-- Existing rows get 0; code running before this change never reads or writes the column.
ALTER TABLE "Token" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
