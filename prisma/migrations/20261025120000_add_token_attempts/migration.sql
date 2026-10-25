-- AlterTable
-- Additive only: counts verification attempts per login challenge (5 also marks consumed/failed delivery).
-- Existing rows get 0; code running before this change never reads or writes the column.
ALTER TABLE "Token" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
