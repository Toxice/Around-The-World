"use client";

import { useRouter } from "next/navigation";

const ROOMS = [
  {
    id: "3d-printing",
    title: "3D Printing",
    icon: "🖨️",
    description: "Discuss models, slicing & fabrication",
    color: "rgba(139,92,246,0.2)",
    border: "rgba(139,92,246,0.4)",
    accent: "#A78BFA",
  },
  {
    id: "robotics",
    title: "Robotics",
    icon: "🤖",
    description: "Talk sensors, motors & automation",
    color: "rgba(249,115,22,0.2)",
    border: "rgba(249,115,22,0.4)",
    accent: "#FB923C",
  },
  {
    id: "python",
    title: "Programming in Python",
    icon: "🐍",
    description: "Code, debug & build with Python",
    color: "rgba(6,182,212,0.2)",
    border: "rgba(6,182,212,0.4)",
    accent: "#22D3EE",
  },
] as const;

export default function ChooseRoomPage() {
  const router = useRouter();

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
            <p className="text-sm font-bold text-white">Choose Room</p>
            <p className="text-xs" style={{ color: "#90CFFF" }}>Select a topic to join</p>
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

      {/* Rooms */}
      <div className="relative z-10 flex-1 flex flex-col gap-4 px-4 py-6">
        {ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => router.push(`/scene/choose/${room.id}`)}
            className="w-full flex items-center gap-5 p-6 rounded-2xl border transition-all duration-200 active:scale-[0.97] text-left"
            style={{
              background: "linear-gradient(145deg, rgba(13,31,61,0.9) 0%, rgba(10,18,40,0.9) 100%)",
              borderColor: room.border,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{
                background: room.color,
                border: `1px solid ${room.border}`,
              }}
            >
              {room.icon}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="font-bold text-white text-base">{room.title}</span>
              <span className="text-xs leading-relaxed" style={{ color: "#90CFFF" }}>
                {room.description}
              </span>
            </div>
            <span className="text-xl shrink-0" style={{ color: room.accent }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
