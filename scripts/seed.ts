import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const DEMO_STUDENT_CODES = [
  "S001", "S002", "S003", "S004", "S005",
  "S006", "S007", "S008", "S009", "S010",
];

async function seed() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter } as any);

  console.log(`Seeding students into: ${url}`);
  let upserted = 0;
  for (const code of DEMO_STUDENT_CODES) {
    await prisma.student.upsert({
      where: { studentCode: code },
      update: {},
      create: { studentCode: code },
    });
    upserted++;
  }

  await prisma.$disconnect();
  console.log(`Done. Upserted ${upserted} students.`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
