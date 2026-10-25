import { PrismaClient } from "@prisma/client";

// Never choose an arbitrary account when legacy mixed-case duplicates exist.
// The manual lower(email) unique index also serializes first-time signups.
export async function findLoginUser(db: PrismaClient, email: string): Promise<{ id: number } | null> {
  // email is normalized by parseIdentity. Prisma's insensitive equals uses
  // ILIKE, where valid email characters '_' and '%' would act as wildcards.
  // Bind the value and compare literally, including for legacy mixed-case rows.
  const lookup = () => db.$queryRaw<{ id: number }[]>`
    SELECT id FROM "User"
    WHERE email IS NOT NULL AND lower(email) = ${email}
    ORDER BY id LIMIT 2`;
  const matches = await lookup();
  if (matches.length) return matches.length === 1 ? matches[0] : null;
  try {
    return await db.user.create({ data: { name: "Anonymous", email }, select: { id: true } });
  } catch (error) {
    if ((error as { code?: string })?.code !== "P2002") throw error;
    const raced = await lookup();
    return raced.length === 1 ? raced[0] : null;
  }
}
