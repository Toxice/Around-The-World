import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Mock mode: return placeholder transcript
    if (process.env.MOCK_AI === "true") {
      return NextResponse.json({ transcript: "I would like to order the sushi please." });
    }

    const whisperUrl = process.env.WHISPER_API_URL;
    const whisperKey = process.env.WHISPER_API_KEY;

    if (!whisperUrl) {
      return NextResponse.json({ error: "Whisper STT not configured" }, { status: 503 });
    }

    const upstream = new FormData();
    upstream.append("file", audio, audio.name);
    upstream.append("model", "whisper-1");

    const res = await fetch(whisperUrl, {
      method: "POST",
      headers: whisperKey ? { Authorization: `Bearer ${whisperKey}` } : {},
      body: upstream,
    });

    if (!res.ok) {
      console.error("Whisper error:", res.status);
      return NextResponse.json({ error: "STT service error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ transcript: data.text ?? "" });
  } catch (err) {
    console.error("POST /api/stt error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
