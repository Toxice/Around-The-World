"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { PrimaryButton, ScreenShell } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { setStudentInfo } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your student ID.");
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

  return (
    <ScreenShell className="items-center justify-center gap-0">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div
          className="w-20 h-20 rounded-[var(--radius-card)] flex items-center justify-center text-4xl shadow-[var(--shadow-card)]"
          style={{ background: "linear-gradient(135deg, #6C3FC4 0%, #06B6D4 100%)" }}
        >
          🗣️
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">EduLingo</h1>
        <p className="text-text-secondary text-sm text-center">
          English conversation practice
        </p>
      </div>

      {/* Login card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="student-code" className="text-sm font-medium text-text-secondary">
            Student ID
          </label>
          <input
            ref={inputRef}
            id="student-code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoFocus
            placeholder="e.g. S001"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            className="w-full h-14 rounded-[var(--radius-input)] px-4 text-center text-xl font-bold tracking-widest
                       bg-bg-input border border-white/10 text-text-primary placeholder:text-text-secondary/50
                       focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition-all"
          />
          {error && (
            <p role="alert" className="text-rose text-sm text-center">
              {error}
            </p>
          )}
        </div>

        <PrimaryButton type="submit" loading={loading} disabled={!code.trim()}>
          Start →
        </PrimaryButton>
      </form>
    </ScreenShell>
  );
}
