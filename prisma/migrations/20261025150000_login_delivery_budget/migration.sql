-- Preflight case-folded collisions first. This fails without merging accounts.
CREATE UNIQUE INDEX "User_email_lower_key" ON "User" (lower("email")) WHERE "email" IS NOT NULL;
CREATE TABLE "LoginBudget" (
  "id" INTEGER NOT NULL PRIMARY KEY CHECK ("id" = 1),
  "events" JSONB NOT NULL
);
