import { NextRequest, NextResponse } from "next/server";
import { getSessionById, completeSession } from "@/lib/db/repositories/sessionRepository";
import { SessionResults } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Aggregate confidence from turns
    const turns = session.turns;
    const avgConfidence =
      turns.length > 0
        ? turns.reduce((sum: number, t) => sum + t.confidenceScore, 0) / turns.length
        : 0;

    // Aggregate teacher brief from last turn
    let teacherBrief = "";
    if (turns.length > 0) {
      const lastTurn = turns[turns.length - 1];
      const analytics = lastTurn.analyticsJson as Record<string, unknown>;
      teacherBrief = (analytics.teacher_brief as string) ?? "";
    }

    // Mark session completed if not already
    if (!session.completedAt) {
      await completeSession(sessionId, session.totalScore, avgConfidence, turns.length);
    }

    const result: SessionResults = {
      totalScore: session.totalScore,
      finalConfidence: session.finalConfidence ?? avgConfidence,
      badges: session.badges.map((b) => ({
        badgeName: b.badgeName,
        awardedAt: b.awardedAt.toISOString(),
      })),
      teacherBrief,
      turnCount: turns.length,
      location: session.location,
      situation: session.situation,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/sessions/[id]/results error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
