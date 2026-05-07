import { NextRequest, NextResponse } from "next/server";
import { getSessionById, completeSession } from "@/lib/db/repositories/sessionRepository";
import { SessionResults } from "@/types";

async function fetchHolisticBrief(session: NonNullable<Awaited<ReturnType<typeof getSessionById>>>): Promise<string> {
  const proxyUrl = process.env.CLAUDE_PROXY_URL;
  if (!proxyUrl || process.env.MOCK_AI === "true") return "";

  // Build the full conversation transcript for Claude to analyze
  const transcript = session.turns.map((t) =>
    `Student: ${t.studentMessage}\n${session.character}: ${t.characterReply}`
  ).join("\n\n");

  try {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLAUDE_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        analyze_full_session: true,
        session_context: {
          location: session.location,
          situation: session.situation,
          character: session.character,
          mission: session.missionText,
        },
        full_transcript: transcript,
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    return data.teacher_brief ?? data.summary ?? "";
  } catch {
    return "";
  }
}

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

    const turns = session.turns;
    const avgConfidence =
      turns.length > 0
        ? turns.reduce((sum, t) => sum + t.confidenceScore, 0) / turns.length
        : 0;

    // Use stored holistic brief if session already completed, otherwise generate it now
    let teacherBrief = session.finalTeacherBrief ?? "";

    if (!session.completedAt) {
      // First time hitting results — generate holistic brief from full transcript
      teacherBrief = await fetchHolisticBrief(session);

      // Fall back to last turn's brief if holistic call failed or mock mode
      if (!teacherBrief && turns.length > 0) {
        try {
          const analytics = JSON.parse(turns[turns.length - 1].analyticsJson);
          teacherBrief = analytics.teacher_brief ?? "";
        } catch {}
      }

      await completeSession(sessionId, session.totalScore, avgConfidence, turns.length, teacherBrief);
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
