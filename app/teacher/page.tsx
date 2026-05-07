"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentSummary } from "@/types";

function confColor(v: number) {
  return v >= 0.7 ? "#22C55E" : v >= 0.4 ? "#F59E0B" : "#EF4444";
}

function TrendBar({ history }: { history: number[] }) {
  if (history.length === 0) return <span className="text-xs" style={{ color: "#64748B" }}>—</span>;
  return (
    <div className="flex items-end gap-px h-5">
      {history.slice(-8).map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm"
          style={{
            height: `${Math.max(3, Math.round(v * 20))}px`,
            backgroundColor: confColor(v),
            opacity: 0.55 + i * 0.06,
          }}
        />
      ))}
    </div>
  );
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
    (s.lastSessionTopic ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalSessions = students.reduce((sum, s) => sum + s.totalSessions, 0);
  const avgConf =
    students.length > 0
      ? students.reduce((sum, s) => sum + s.avgConfidence, 0) / students.length
      : 0;

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
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

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "rgba(10,25,60,0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,119,182,0.25)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/teacher/portal" className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#90CFFF" }}>
            ←
          </Link>
          <div>
            <p className="text-sm font-bold text-white">Dashboard</p>
            <p className="text-xs" style={{ color: "#90CFFF" }}>Overall Student Analytics</p>
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

      <div className="relative z-10 flex-1 overflow-auto px-4 py-4 flex flex-col gap-4">

        {/* ── Summary stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Students",  value: students.length,         color: "#48CAE4", suffix: "" },
            { label: "Avg Conf.", value: Math.round(avgConf * 100), color: confColor(avgConf), suffix: "%" },
            { label: "Sessions",  value: totalSessions,           color: "#A78BFA", suffix: "" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 flex flex-col gap-0.5"
              style={{ background: "rgba(10,25,60,0.6)", border: "1px solid rgba(0,119,182,0.25)" }}
            >
              <p className="text-xs" style={{ color: "#90CFFF" }}>{stat.label}</p>
              <p className="text-xl font-bold" style={{ color: stat.color }}>
                {stat.value}{stat.suffix}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search ──────────────────────────────────────────────────────── */}
        <input
          type="text"
          placeholder="Search student or topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 rounded-xl px-3 text-sm focus:outline-none transition-all"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(0,119,182,0.35)",
            color: "#FFFFFF",
          }}
        />

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "#90CFFF" }}>Loading…</div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(0,119,182,0.25)" }}>
            <div style={{ minWidth: 520 }}>
              {/* Header */}
              <div
                className="grid px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                style={{
                  gridTemplateColumns: "80px 60px 56px 60px 1fr 72px",
                  background: "rgba(6,20,50,0.8)",
                  color: "#4895EF",
                  borderBottom: "1px solid rgba(0,119,182,0.2)",
                }}
              >
                <span>Student</span>
                <span>Sessions</span>
                <span>Turns</span>
                <span>Score</span>
                <span>Last Topic</span>
                <span>Avg Conf.</span>
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "#4895EF" }}>
                  {students.length === 0 ? "No student data yet." : "No students match your search."}
                </div>
              ) : filtered.map((s, idx) => (
                <Link
                  key={s.id}
                  href={`/teacher/students/${s.id}`}
                  className="grid px-3 py-2.5 items-center hover:bg-white/5 transition-colors"
                  style={{
                    gridTemplateColumns: "80px 60px 56px 60px 1fr 72px",
                    background: idx % 2 === 0 ? "rgba(10,25,60,0.5)" : "rgba(6,16,42,0.5)",
                    borderBottom: idx < filtered.length - 1 ? "1px solid rgba(0,119,182,0.1)" : "none",
                    textDecoration: "none",
                  }}
                >
                  <span className="font-bold text-xs text-white">{s.studentCode}</span>

                  <span className="text-xs font-semibold" style={{ color: "#48CAE4" }}>
                    {s.totalSessions}
                  </span>

                  <span className="text-xs" style={{ color: "#90CFFF" }}>
                    {s.totalTurns}
                  </span>

                  <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                    {s.totalScore}
                  </span>

                  <span className="text-xs truncate pr-2" style={{ color: "#90CFFF" }}>
                    {s.lastSessionTopic ?? "—"}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: confColor(s.avgConfidence) }}>
                      {Math.round(s.avgConfidence * 100)}%
                    </span>
                    <TrendBar history={s.confidenceHistory} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
