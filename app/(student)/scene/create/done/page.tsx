"use client";

import { useRouter } from "next/navigation";

export default function CreateRoomDonePage() {
  const router = useRouter();

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

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-xs">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{
            background: "rgba(0,119,182,0.15)",
            border: "1px solid rgba(0,180,216,0.35)",
            boxShadow: "0 0 32px rgba(0,119,182,0.2)",
          }}
        >
          🚧
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white">Coming Soon</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#90CFFF" }}>
            Custom room creation is on its way. Stay tuned for updates!
          </p>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/scene")}
          className="mt-2 h-11 px-8 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #0077B6 0%, #1640A8 100%)",
            boxShadow: "0 4px 16px rgba(0,119,182,0.4)",
          }}
        >
          ← Back to Rooms
        </button>
      </div>
    </div>
  );
}
