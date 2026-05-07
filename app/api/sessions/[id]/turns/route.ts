import { NextRequest, NextResponse } from "next/server";
import { getSessionById, addScoreToSession, incrementTurnCount } from "@/lib/db/repositories/sessionRepository";
import { createTurn } from "@/lib/db/repositories/turnRepository";
import { createBadge } from "@/lib/db/repositories/badgeRepository";
import { getMockAiResponse } from "@/lib/mock/mockAiResponse";
import { ClaudeResponse } from "@/types";
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

      const systemPrompt = `You are ${session.character}, a character in an English language learning conversation app.
Location: ${session.location}
Situation: ${session.situation}
Student's mission: ${session.missionText}

Stay fully in character. Respond naturally as ${session.character} would in this situation.
Keep replies concise (1-3 sentences). Gently encourage the student if they struggle.

You MUST respond with valid JSON only — no markdown, no code fences. Use this exact structure:
{
  "character_reply": "your in-character response",
  "teacher_analytics": {
    "grammar_points_observed": ["list of grammar patterns the student used"],
    "grammar_errors_frequent": ["list of grammar mistakes, empty if none"],
    "target_vocabulary_used": ["relevant vocabulary words the student used"],
    "missed_opportunities": ["better phrases the student could have used, empty if none"],
    "confidence_score": 0.0,
    "word_count": 0,
    "struggle_detected": false,
    "teacher_brief": "one sentence summary for the teacher"
  },
  "gamification": {
    "points_earned": 10,
    "character_mood": "😊",
    "achievements": []
  },
  "mission_complete": false
}

Rules:
- confidence_score: 0.0–1.0 based on fluency and correctness
- points_earned: 5–30 depending on quality; reward polite/complex language
- character_mood: single emoji reflecting how the character feels
- achievements: award badges like "Polite Customer" or "Vocabulary Star" only for exceptional moments
- mission_complete: true only when the student has clearly accomplished their mission`;

      const contents = [
        ...session.turns.flatMap((t) => [
          { role: "user",  parts: [{ text: t.studentMessage }] },
          { role: "model", parts: [{ text: t.characterReply }] },
        ]),
        { role: "user", parts: [{ text: message }] },
      ];

      const model = process.env.GOOGLE_AI_MODEL ?? "gemini-flash-latest";
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
              temperature: 0.7,
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
