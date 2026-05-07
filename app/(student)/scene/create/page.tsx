"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,160,255,0.15) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "rgba(10,25,60,0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,119,182,0.25)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#90CFFF" }}
          >
            ←
          </button>
          <div>
            <p className="text-sm font-bold text-white">Create Room</p>
            <p className="text-xs" style={{ color: "#90CFFF" }}>Build a custom room</p>
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

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-4 py-8 gap-6">
        {/* Icon */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
            style={{
              background: "rgba(0,119,182,0.15)",
              border: "1px solid rgba(0,180,216,0.3)",
            }}
          >
            ✦
          </div>
          <p className="text-sm text-center" style={{ color: "#90CFFF" }}>
            Describe the room you want to create
          </p>
        </div>

        {/* Prompt card */}
        <div
          className="flex flex-col gap-4 p-5 rounded-2xl"
          style={{
            background: "rgba(10,25,60,0.7)",
            border: "1px solid rgba(0,119,182,0.3)",
          }}
        >
          <label
            htmlFor="room-prompt"
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#4895EF" }}
          >
            Room Prompt
          </label>
          <textarea
            id="room-prompt"
            rows={5}
            placeholder="e.g. A coffee shop where two engineers discuss their latest robotics project…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none transition-all"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(0,119,182,0.35)",
              color: "#FFFFFF",
            }}
          />
        </div>

        {/* Create button */}
        <button
          disabled={!prompt.trim()}
          onClick={() => router.push("/scene/create/done")}
          className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #0077B6 0%, #1640A8 100%)",
            boxShadow: prompt.trim() ? "0 4px 16px rgba(0,119,182,0.45)" : "none",
          }}
        >
          Create Room →
        </button>
      </div>
    </div>
  );
}
