import { NextRequest, NextResponse } from "next/server";
import { getStudentDetail } from "@/lib/db/repositories/studentRepository";
import { StudentDetail, SessionSummary, GrammarError } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await getStudentDetail(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Aggregate grammar errors and vocabulary across all sessions
    const grammarErrorMap = new Map<string, number>();
    const vocabularySet = new Set<string>();
    const missedOpportunitiesSet = new Set<string>();

    const sessions: SessionSummary[] = student.sessions.map((s) => {
      let teacherBrief = "";
      let struggleDetected = false;

      // Aggregate analytics from all turns in this session
      for (const turn of s.turns) {
        const analytics = turn.analyticsJson as Record<string, unknown>;
        for (const err of (analytics.grammar_errors_frequent as string[]) ?? []) {
          grammarErrorMap.set(err, (grammarErrorMap.get(err) ?? 0) + 1);
        }
        for (const v of (analytics.target_vocabulary_used as string[]) ?? []) {
          vocabularySet.add(v);
        }
        for (const m of (analytics.missed_opportunities as string[]) ?? []) {
          missedOpportunitiesSet.add(m);
        }
        if (analytics.teacher_brief) teacherBrief = analytics.teacher_brief as string;
        if (analytics.struggle_detected) struggleDetected = true;
      }

      return {
        id: s.id,
        location: s.location,
        situation: s.situation,
        completedAt: s.completedAt!.toISOString(),
        totalScore: s.totalScore,
        finalConfidence: s.finalConfidence ?? 0,
        struggleDetected,
        teacherBrief,
        badges: s.badges.map((b) => b.badgeName),
      };
    });

    const grammarErrors: GrammarError[] = Array.from(grammarErrorMap.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count);

    const detail: StudentDetail = {
      studentCode: student.studentCode,
      totalSessions: sessions.length,
      sessions,
      grammarErrors,
      vocabularyUsed: Array.from(vocabularySet),
      missedOpportunities: Array.from(missedOpportunitiesSet),
    };

    return NextResponse.json(detail);
  } catch (err) {
    console.error("GET /api/students/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
