import { NextRequest, NextResponse } from "next/server";
import { findStudentByCode } from "@/lib/db/repositories/studentRepository";
import { createSession } from "@/lib/db/repositories/sessionRepository";
import { z } from "zod";

const schema = z.object({
  studentCode: z.string().min(1),
  location: z.string().min(1),
  situation: z.string().min(1),
  character: z.string().min(1),
  missionText: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { studentCode, location, situation, character, missionText } = parsed.data;

    const student = await findStudentByCode(studentCode);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const session = await createSession({
      studentId: student.id,
      location,
      situation,
      character,
      missionText,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
