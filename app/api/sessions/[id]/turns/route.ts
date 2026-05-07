import { NextRequest, NextResponse } from "next/server";
import { getSessionById, addScoreToSession, incrementTurnCount } from "@/lib/db/repositories/sessionRepository";
import { createTurn, getTurnsBySession } from "@/lib/db/repositories/turnRepository";
import { createBadge } from "@/lib/db/repositories/badgeRepository";
import { getMockAiResponse } from "@/lib/mock/mockAiResponse";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { message } = parsed.data;
    const turnNumber = session.turns.length + 1;

    // Call AI (mock or real)
    let aiResponse;
    if (process.env.MOCK_AI === "true") {
      aiResponse = getMockAiResponse(message);
    } else {
      // Forward to partner Claude proxy
      const proxyUrl = process.env.CLAUDE_PROXY_URL;
      if (!proxyUrl) {
        return NextResponse.json({ error: "AI proxy not configured" }, { status: 503 });
      }
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLAUDE_API_KEY ?? ""}`,
        },
        body: JSON.stringify({
          message,
          session_context: {
            location: session.location,
            situation: session.situation,
            character: session.character,
            mission: session.missionText,
            turn_number: turnNumber,
          },
        }),
      });
      if (!res.ok) {
        console.error("Claude proxy error:", res.status);
        // Graceful degradation: return mock
        aiResponse = getMockAiResponse(message);
      } else {
        aiResponse = await res.json();
      }
    }

    const { teacher_analytics: ta, gamification: gm } = aiResponse;

    // Persist turn
    await createTurn({
      sessionId,
      turnNumber,
      studentMessage: message,
      characterReply: aiResponse.character_reply,
      analyticsJson: JSON.stringify(ta),
      pointsEarned: gm.points_earned,
      characterMood: gm.character_mood,
      wordCount: ta.word_count,
      confidenceScore: ta.confidence_score,
      struggleDetected: ta.struggle_detected,
    });

    await addScoreToSession(sessionId, gm.points_earned);
    await incrementTurnCount(sessionId);

    // Persist any new badges
    for (const badge of gm.achievements ?? []) {
      await createBadge(sessionId, badge);
    }

    return NextResponse.json({
      characterReply: aiResponse.character_reply,
      pointsEarned: gm.points_earned,
      characterMood: gm.character_mood,
      achievements: gm.achievements ?? [],
      missionComplete: aiResponse.mission_complete ?? false,
    });
  } catch (err) {
    console.error("POST /api/sessions/[id]/turns error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
