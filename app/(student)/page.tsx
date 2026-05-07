"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { PrimaryButton } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { setStudentInfo } = useSession();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your student ID.");
      return;
    }

    if (password !== "1111") {
      setError("Invalid password.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/students/lookup?code=${encodeURIComponent(trimmed)}`);
      if (res.status === 404) {
        setError("Student ID not found. Check with your teacher.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStudentInfo(data.studentCode, data.id);
      router.push("/location");
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  function openStudentForm() {
    setShowStudentForm(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  }

  function backToRoles() {
    setShowStudentForm(false);
    setCode("");
    setPassword("");
    setError("");
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)",
      }}
    >
      {/* ── Decorative background ───────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Top glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,160,255,0.22) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-right accent */}
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 65%)",
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Horizontal divider lines */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,119,182,0.4), transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,119,182,0.4), transparent)" }}
        />
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm flex flex-col items-center gap-10">

        {/* Logo — SVG wordmark */}
        <div className="flex flex-col items-center gap-3">
          <svg
            viewBox="0 0 200 140"
            xmlns="http://www.w3.org/2000/svg"
            className="w-72 h-auto"
            style={{ filter: "drop-shadow(0 0 18px rgba(0,180,255,0.4))" }}
            aria-label="Voya"
          >
            {/* "vo" */}
            <text x="2" y="102"
              fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF"
            >vo</text>

            {/* "y" — regular letter (has descender below baseline) */}
            <text x="90" y="102"
              fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF"
            >y</text>

            {/* Two dots above the "y" (diaeresis) */}
            <circle cx="103" cy="46" r="5" fill="#00C8FF" />
            <circle cx="123" cy="46" r="5" fill="#00C8FF" />

            {/* "a" */}
            <text x="133" y="102"
              fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF"
            >a</text>
          </svg>

          {/* Tagline */}
          <p
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: "#90CFFF" }}
          >
            SPEAK · CONNECT · GROW
          </p>
        </div>

        {/* ── Role selector ────────────────────────────────────────────── */}
        {!showStudentForm ? (
          <div className="w-full flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(0,119,182,0.25)" }} />
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#4895EF" }}
              >
                Choose your role
              </p>
              <div className="flex-1 h-px" style={{ background: "rgba(0,119,182,0.25)" }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ── Student card ─────────────────────────────────────── */}
              <button
                onClick={openStudentForm}
                className="role-card group flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200 active:scale-[0.97] text-left"
                style={{
                  background: "linear-gradient(145deg, #001D3D 0%, #000C1A 100%)",
                  borderColor: "rgba(0,119,182,0.35)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: "rgba(0,119,182,0.15)",
                    border: "1px solid rgba(0,119,182,0.4)",
                    boxShadow: "0 0 16px rgba(0,119,182,0.15)",
                  }}
                >
                  🎓
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-white text-sm">Student</span>
                  <span className="text-xs" style={{ color: "#48CAE4" }}>
                    Start learning
                  </span>
                </div>
                {/* Bottom accent bar */}
                <div
                  className="w-8 h-0.5 rounded-full opacity-60"
                  style={{ background: "linear-gradient(90deg, #0077B6, #48CAE4)" }}
                />
              </button>

              {/* ── Teacher card ─────────────────────────────────────── */}
              <Link
                href="/teacher/login"
                className="role-card group flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(145deg, #001D3D 0%, #000C1A 100%)",
                  borderColor: "rgba(0,119,182,0.35)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: "rgba(0,119,182,0.15)",
                    border: "1px solid rgba(0,119,182,0.4)",
                    boxShadow: "0 0 16px rgba(0,119,182,0.15)",
                  }}
                >
                  📊
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-white text-sm">Teacher</span>
                  <span className="text-xs" style={{ color: "#48CAE4" }}>
                    View analytics
                  </span>
                </div>
                {/* Bottom accent bar */}
                <div
                  className="w-8 h-0.5 rounded-full opacity-60"
                  style={{ background: "linear-gradient(90deg, #0077B6, #48CAE4)" }}
                />
              </Link>
            </div>

            {/* Tagline */}
            <p
              className="text-center text-xs"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Speak confidently. Learn anywhere.
            </p>
          </div>
        ) : (
          /* ── Student ID form ──────────────────────────────────────────── */
          <div className="w-full flex flex-col gap-5">
            <button
              type="button"
              onClick={backToRoles}
              className="self-start flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#48CAE4" }}
            >
              ← Back
            </button>

            {/* Form card */}
            <div
              className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{
                background: "linear-gradient(145deg, #001D3D 0%, #000C1A 100%)",
                borderColor: "rgba(0,119,182,0.35)",
                boxShadow: "0 0 32px rgba(0,119,182,0.12)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: "rgba(0,119,182,0.15)",
                    border: "1px solid rgba(0,119,182,0.4)",
                  }}
                >
                  🎓
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Student Login</p>
                  <p className="text-xs" style={{ color: "#48CAE4" }}>
                    Enter your ID to begin
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="student-code"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#4895EF" }}
                  >
                    Student ID
                  </label>
                  <input
                    ref={inputRef}
                    id="student-code"
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    placeholder="e.g. S001"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    className="w-full h-14 rounded-xl px-4 text-center text-xl font-bold tracking-widest
                               focus:outline-none transition-all"
                    style={{
                      background: "#000814",
                      border: "1px solid rgba(0,119,182,0.4)",
                      color: "#FFFFFF",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="student-password"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#4895EF" }}
                  >
                    Password
                  </label>
                  <input
                    id="student-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full h-14 rounded-xl px-4 text-center text-xl font-bold tracking-widest focus:outline-none transition-all"
                    style={{
                      background: "#000814",
                      border: "1px solid rgba(0,119,182,0.4)",
                      color: "#FFFFFF",
                    }}
                  />
                  {error && (
                    <p role="alert" className="text-sm text-center" style={{ color: "#F43F5E" }}>
                      {error}
                    </p>
                  )}
                </div>

                <PrimaryButton type="submit" loading={loading} disabled={!code.trim() || !password.trim()}>
                  Start →
                </PrimaryButton>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
