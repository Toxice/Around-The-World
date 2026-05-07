import { NextRequest, NextResponse } from "next/server";
import { findStudentByCode } from "@/lib/db/repositories/studentRepository";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  try {
    const student = await findStudentByCode(code.toUpperCase());
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ id: student.id, studentCode: student.studentCode });
  } catch (err) {
    console.error("GET /api/students/lookup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
