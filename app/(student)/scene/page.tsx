"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

export default function ScenePage() {
  const router = useRouter();
  const { session } = useSession();

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,160,255,0.22) 0%, transparent 65%)" }}
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
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(10,25,60,0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,119,182,0.25)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "#90CFFF" }}
        >
          ←
        </button>
        <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto" aria-label="Voya">
          <text x="2" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">vo</text>
          <text x="90" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">y</text>
          <circle cx="103" cy="38" r="8" fill="#00C8FF" />
          <circle cx="123" cy="38" r="8" fill="#00C8FF" />
          <text x="133" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">a</text>
        </svg>
        <div className="w-8" />
      </header>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 pt-20">
        {/* Location context */}
        {session.location && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 28 }}>{session.locationFlag}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4895EF" }}>
                Location
              </p>
              <p className="text-sm font-bold text-white">{session.location}</p>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col gap-3 text-center">
          <h1 className="text-xl font-bold text-white">Join a Room</h1>
          <p className="text-sm" style={{ color: "#90CFFF" }}>Choose an existing room or create your own</p>
        </div>

        {/* Cards */}
        <div className="w-full flex flex-col gap-4">
          {/* Choose Room */}
          <button
            onClick={() => router.push("/scene/choose")}
            className="w-full flex items-center gap-5 p-6 rounded-2xl border transition-all duration-200 active:scale-[0.97] text-left"
            style={{
              background: "linear-gradient(145deg, rgba(13,31,61,0.9) 0%, rgba(10,18,40,0.9) 100%)",
              borderColor: "rgba(0,180,216,0.4)",
              boxShadow: "0 0 24px rgba(0,119,182,0.2)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{
                background: "rgba(0,119,182,0.2)",
                border: "1px solid rgba(0,180,216,0.35)",
              }}
            >
              🚪
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white text-base">Choose Room</span>
              <span className="text-xs" style={{ color: "#90CFFF" }}>
                Pick from available rooms
              </span>
            </div>
            <span className="ml-auto text-xl" style={{ color: "#48CAE4" }}>›</span>
          </button>

          {/* Create Room */}
          <button
            onClick={() => router.push("/scene/create")}
            className="w-full flex items-center gap-5 p-6 rounded-2xl border transition-all duration-200 active:scale-[0.97] text-left"
            style={{
              background: "linear-gradient(145deg, rgba(13,31,61,0.9) 0%, rgba(10,18,40,0.9) 100%)",
              borderColor: "rgba(0,119,182,0.3)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{
                background: "rgba(0,119,182,0.12)",
                border: "1px solid rgba(0,119,182,0.25)",
              }}
            >
              ✦
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white text-base">Create Room</span>
              <span className="text-xs" style={{ color: "#90CFFF" }}>
                Build your own custom room
              </span>
            </div>
            <span className="ml-auto text-xl" style={{ color: "#48CAE4" }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
