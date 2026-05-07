import { NextRequest, NextResponse } from "next/server";

function pcmToWav(pcmBase64: string, sampleRate = 24000): Buffer {
  const pcm = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body as { text: string };

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (process.env.MOCK_AI === "true") {
      return NextResponse.json({ mock: true });
    }

    const geminiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Gemini TTS error:", res.status, await res.text());
      return NextResponse.json({ error: "TTS service error" }, { status: 502 });
    }

    const data = await res.json();
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
      return NextResponse.json({ error: "No audio in response" }, { status: 502 });
    }

    const wav = pcmToWav(inlineData.data);

    return new NextResponse(wav, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("POST /api/tts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
