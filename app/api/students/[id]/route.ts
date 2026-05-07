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
        try {
          const analytics = JSON.parse(turn.analyticsJson);
          for (const err of analytics.grammar_errors_frequent ?? []) {
            grammarErrorMap.set(err, (grammarErrorMap.get(err) ?? 0) + 1);
          }
          for (const v of analytics.target_vocabulary_used ?? []) {
            vocabularySet.add(v);
          }
          for (const m of analytics.missed_opportunities ?? []) {
            missedOpportunitiesSet.add(m);
          }
          if (analytics.teacher_brief) teacherBrief = analytics.teacher_brief;
          if (analytics.struggle_detected) struggleDetected = true;
        } catch {}
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
