"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError("");
    if (username.trim().toLowerCase() === "teacher" && password === "1234") {
      setLoading(true);
      setTimeout(() => router.push("/teacher/portal"), 600);
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)",
      }}
    >
      {/* ── Decorative background ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,160,255,0.22) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,119,182,0.4), transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,119,182,0.4), transparent)" }}
        />
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <svg
            viewBox="0 0 200 132"
            xmlns="http://www.w3.org/2000/svg"
            className="w-56 h-auto"
            style={{ filter: "drop-shadow(0 0 18px rgba(0,180,255,0.4))" }}
            aria-label="Voya"
          >
            <defs>
              <linearGradient id="armGradL" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#1A56DB" />
                <stop offset="100%" stopColor="#3D8EFF" />
              </linearGradient>
            </defs>
            <text x="2" y="108"
              fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF"
            >vo</text>
            <path d="M 110,68 L 110,108"
              stroke="#00C8FF" strokeWidth="10" strokeLinecap="round" fill="none"
            />
            <path
              d="M 110,68 C 98,44 72,18 66,30 C 60,42 84,68 110,68 Z"
              fill="#00C8FF"
            />
            <path
              d="M 104,72 C 120,48 148,16 162,14 C 157,8 140,28 122,62 C 116,68 108,72 104,72 Z"
              fill="url(#armGradL)"
            />
            <text x="122" y="108"
              fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF"
            >a</text>
          </svg>
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: "#90CFFF" }}>
            SPEAK · CONNECT · GROW
          </p>
        </div>

        {/* Login card */}
        <div
          className="w-full rounded-2xl border p-7 flex flex-col gap-5"
          style={{
            background: "linear-gradient(145deg, rgba(13,31,61,0.9) 0%, rgba(10,18,40,0.95) 100%)",
            borderColor: "rgba(0,119,182,0.35)",
            boxShadow: "0 0 40px rgba(0,100,200,0.18)",
          }}
        >
          {/* Card header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-white">Teacher Login</h1>
            <p className="text-xs" style={{ color: "#90CFFF" }}>
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#4895EF" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 rounded-xl px-4 text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(0,119,182,0.4)",
                  color: "#FFFFFF",
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#4895EF" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl px-4 text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(0,119,182,0.4)",
                  color: "#FFFFFF",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-center font-medium" style={{ color: "#F87171" }}>
                {error}
              </p>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={!username.trim() || !password.trim() || loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-40 mt-1"
              style={{
                background: "linear-gradient(135deg, #0077B6 0%, #1640A8 100%)",
                boxShadow: "0 4px 16px rgba(0,119,182,0.45)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "#90CFFF" }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
