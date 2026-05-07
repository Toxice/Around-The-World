import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId } = body as { text: string; voiceId?: string };

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Mock mode: return empty audio indicator
    if (process.env.MOCK_AI === "true") {
      return NextResponse.json({ audioUrl: null, mock: true });
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const voice = voiceId ?? process.env.ELEVENLABS_DEFAULT_VOICE ?? "21m00Tcm4TlvDq8ikWAM";

    if (!elevenLabsKey) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!res.ok) {
      console.error("ElevenLabs error:", res.status);
      return NextResponse.json({ error: "TTS service error" }, { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("POST /api/tts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
