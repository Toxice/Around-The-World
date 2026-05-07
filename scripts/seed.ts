import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const DEMO_STUDENT_CODES = [
  "S001", "S002", "S003", "S004", "S005",
  "S006", "S007", "S008", "S009", "S010",
];

async function seed() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  console.log(`Seeding students...`);
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
