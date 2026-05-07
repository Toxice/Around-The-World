import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const DEMO_CODES = ["S001", "S002", "S003", "S004", "S005", "S006", "S007", "S008", "S009", "S010"];

export async function POST() {
  // Only allow in non-production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    let upserted = 0;
    for (const code of DEMO_CODES) {
      await prisma.student.upsert({
        where: { studentCode: code },
        update: {},
        create: { studentCode: code },
      });
      upserted++;
    }
    return NextResponse.json({ message: `Seeded ${upserted} students` });
  } catch (err) {
    console.error("POST /api/admin/seed error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
