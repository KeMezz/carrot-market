import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function main() {
  Array.from({ length: 500 }, (_, i) => i).forEach(async (item) => {
    await client.stream.create({
      data: {
        name: String(item),
        description: `this is ${item}`,
        price: item,
        user: {
          connect: {
            id: 12,
          },
        },
      },
    });
    console.log(`${item}/500`);
  });
}

main()
  .catch(console.error)
  .finally(() => client.$disconnect);
