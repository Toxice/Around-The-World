"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/context/SessionContext";

const ROOM_META: Record<string, { title: string; icon: string; accent: string }> = {
  "3d-printing": { title: "3D Printing", icon: "🖨️", accent: "#A78BFA" },
  "robotics":    { title: "Robotics",    icon: "🤖", accent: "#FB923C" },
  "python":      { title: "Programming in Python", icon: "🐍", accent: "#22D3EE" },
};

const ROOM_SESSION: Record<string, {
  location: string; situation: string;
  character: string; characterEmoji: string;
  missionText: string; voiceEnvKey: string;
}> = {
  "3d-printing": {
    location: "United States", situation: "School",
    character: "Ms. Rivera", characterEmoji: "👩‍🏫",
    missionText: "Talk to your teacher about your 3D printing project.",
    voiceEnvKey: "ELEVENLABS_VOICE_US_TEACHER",
  },
  "robotics": {
    location: "United States", situation: "School",
    character: "Mr. Chen", characterEmoji: "👨‍🏫",
    missionText: "Discuss your robotics project with your teacher.",
    voiceEnvKey: "ELEVENLABS_VOICE_US_TEACHER",
  },
  "python": {
    location: "United States", situation: "School",
    character: "Ms. Johnson", characterEmoji: "👩‍💻",
    missionText: "Ask your teacher for help with your Python assignment.",
    voiceEnvKey: "ELEVENLABS_VOICE_US_TEACHER",
  },
};

function PrintingRoom({ onStartConversation, loading }: { onStartConversation: () => void; loading: boolean }) {
  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Classroom background */}
      <Image
        src="/room-3d-printing.jpeg"
        alt="3D Printing classroom"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Slight dark vignette so character and UI pop */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)",
        }}
      />

      {/* Clickable character — positioned bottom-centre */}
      <button
        onClick={onStartConversation}
        disabled={loading}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group disabled:opacity-60 disabled:cursor-wait"
        aria-label="Talk to the teacher"
      >
        {/* Speech bubble hint */}
        <div
          className="px-4 py-2 rounded-2xl text-xs font-bold text-white transition-all duration-200 group-hover:scale-105"
          style={{
            background: "rgba(0,10,40,0.82)",
            border: "1.5px solid rgba(0,200,255,0.55)",
            boxShadow: "0 4px 20px rgba(0,100,200,0.4)",
          }}
        >
          Tap to start conversation ✨
        </div>
        {/* Bubble tail */}
        <div style={{
          width: 0, height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid rgba(0,200,255,0.55)",
          marginTop: -2,
        }} />

        {/* Character image */}
        <div
          className="relative transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
          style={{
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
            width: 160,
            height: 180,
          }}
        >
          <Image
            src="/character-teacher.png"
            alt="Teacher character"
            fill
            className="object-contain object-bottom"
          />
          {/* Glow ring under feet */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 90,
              height: 16,
              background: "radial-gradient(ellipse, rgba(0,200,255,0.45) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>
      </button>
    </div>
  );
}

function GenericRoom({ meta }: { meta: { title: string; icon: string; accent: string } }) {
  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-4"
      style={{ background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{
          background: "rgba(0,119,182,0.12)",
          border: "1px solid rgba(0,119,182,0.25)",
        }}
      >
        {meta.icon}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-bold text-white text-base">{meta.title}</p>
        <p className="text-sm" style={{ color: "#90CFFF" }}>No messages yet. Start the conversation!</p>
      </div>
    </div>
  );
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const { session, startSession } = useSession();
  const [loading, setLoading] = useState(false);
  const roomId = typeof params.room === "string" ? params.room : "";
  const meta = ROOM_META[roomId] ?? { title: roomId, icon: "💬", accent: "#48CAE4" };
  const is3DPrinting = roomId === "3d-printing";

  async function handleStartConversation() {
    const cfg = ROOM_SESSION[roomId];
    if (!cfg) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: session.studentCode,
          location: cfg.location,
          situation: cfg.situation,
          character: cfg.character,
          missionText: cfg.missionText,
        }),
      });
      if (!res.ok) { setLoading(false); return; }
      const { sessionId } = await res.json();
      startSession(sessionId, cfg.character, cfg.characterEmoji, cfg.missionText, cfg.voiceEnvKey);
      router.push("/conversation");
    } catch {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={is3DPrinting ? {} : { background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      {/* Header */}
      <header
        className="relative z-20 flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "rgba(10,25,60,0.82)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(0,119,182,0.25)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#90CFFF" }}
          >
            ←
          </button>
          <span style={{ fontSize: 22 }}>{meta.icon}</span>
          <div>
            <p className="text-sm font-bold text-white">{meta.title}</p>
            <p className="text-xs" style={{ color: "#90CFFF" }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ background: "#22C55E" }}
              />
              {is3DPrinting ? "Ready" : "Empty"}
            </p>
          </div>
        </div>
        <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto" aria-label="Voya">
          <text x="2" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">vo</text>
          <text x="90" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">y</text>
          <circle cx="103" cy="38" r="8" fill="#00C8FF" />
          <circle cx="123" cy="38" r="8" fill="#00C8FF" />
          <text x="133" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">a</text>
        </svg>
      </header>

      {/* Room content */}
      {is3DPrinting ? (
        <PrintingRoom onStartConversation={handleStartConversation} loading={loading} />
      ) : (
        <GenericRoom meta={meta} />
      )}

      {/* Chat input bar — only for generic rooms */}
      {!is3DPrinting && (
        <div
          className="relative z-10 shrink-0 px-4 py-4 flex gap-3 items-center"
          style={{
            background: "rgba(10,25,60,0.85)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(0,119,182,0.2)",
          }}
        >
          <div
            className="flex-1 h-12 rounded-2xl px-4 flex items-center text-sm"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(0,119,182,0.3)",
              color: "#475569",
            }}
          >
            Type a message…
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg"
            style={{
              background: "rgba(0,119,182,0.2)",
              border: "1px solid rgba(0,119,182,0.3)",
              color: "#48CAE4",
            }}
          >
            ↑
          </div>
        </div>
      )}
    </div>
  );
}
