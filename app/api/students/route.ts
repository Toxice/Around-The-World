import { NextResponse } from "next/server";
import { getAllStudentsWithSummary } from "@/lib/db/repositories/studentRepository";

export async function GET() {
  try {
    const students = await getAllStudentsWithSummary();
    return NextResponse.json(students);
  } catch (err) {
    console.error("GET /api/students error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
