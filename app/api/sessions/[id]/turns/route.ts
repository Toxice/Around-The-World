import { NextRequest, NextResponse } from "next/server";
import { getSessionById, addScoreToSession, incrementTurnCount } from "@/lib/db/repositories/sessionRepository";
import { createTurn } from "@/lib/db/repositories/turnRepository";
import { createBadge } from "@/lib/db/repositories/badgeRepository";
import { getMockAiResponse } from "@/lib/mock/mockAiResponse";
import { ClaudeResponse } from "@/types";
import { buildSystemPrompt, AI_MODEL, AI_TEMPERATURE } from "@/lib/config/ai";
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
    let aiResponse: ClaudeResponse;
    if (process.env.MOCK_AI === "true") {
      aiResponse = getMockAiResponse(message);
    } else {
      const geminiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
      if (!geminiKey) {
        return NextResponse.json({ error: "AI not configured" }, { status: 503 });
      }

      const systemPrompt = buildSystemPrompt({
        character: session.character,
        location: session.location,
        situation: session.situation,
        missionText: session.missionText,
      });

      const contents = [
        ...session.turns.flatMap((t) => [
          { role: "user",  parts: [{ text: t.studentMessage }] },
          { role: "model", parts: [{ text: t.characterReply }] },
        ]),
        { role: "user", parts: [{ text: message }] },
      ];

      const model = AI_MODEL;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: AI_TEMPERATURE,
            },
          }),
        }
      );

      if (!res.ok) {
        console.error("Gemini error:", res.status, await res.text());
        return NextResponse.json({ error: "AI service error" }, { status: 502 });
      }

      const data = await res.json();
      try {
        aiResponse = JSON.parse(data.candidates[0].content.parts[0].text) as ClaudeResponse;
      } catch {
        console.error("Failed to parse Gemini JSON response");
        return NextResponse.json({ error: "AI response parse error" }, { status: 502 });
      }
    }

    const { teacher_analytics: ta, gamification: gm } = aiResponse;

    // Persist turn
    await createTurn({
      sessionId,
      turnNumber,
      studentMessage: message,
      characterReply: aiResponse.character_reply,
      analyticsJson: ta,
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
