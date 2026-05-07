"use client";

import { useState } from "react";
import Link from "next/link";

interface MockStudent {
  id: string;
  studentCode: string;
  lastSessionDate: string;
  lastSessionTopic: string;
  lastSessionConfidence: number;
  confidenceHistory: number[];
}

const MOCK_STUDENTS: MockStudent[] = [
  {
    id: "1",
    studentCode: "S001",
    lastSessionDate: "2026-05-06",
    lastSessionTopic: "3D Printer",
    lastSessionConfidence: 0.82,
    confidenceHistory: [0.45, 0.52, 0.61, 0.68, 0.72, 0.78, 0.81, 0.82],
  },
  {
    id: "2",
    studentCode: "S002",
    lastSessionDate: "2026-05-05",
    lastSessionTopic: "Programming",
    lastSessionConfidence: 0.65,
    confidenceHistory: [0.30, 0.38, 0.44, 0.52, 0.58, 0.62, 0.64, 0.65],
  },
  {
    id: "3",
    studentCode: "S003",
    lastSessionDate: "2026-05-04",
    lastSessionTopic: "Robotics",
    lastSessionConfidence: 0.91,
    confidenceHistory: [0.70, 0.74, 0.78, 0.82, 0.85, 0.88, 0.90, 0.91],
  },
  {
    id: "4",
    studentCode: "S004",
    lastSessionDate: "2026-05-03",
    lastSessionTopic: "3D Printer",
    lastSessionConfidence: 0.43,
    confidenceHistory: [0.20, 0.25, 0.28, 0.32, 0.36, 0.39, 0.41, 0.43],
  },
  {
    id: "5",
    studentCode: "S005",
    lastSessionDate: "2026-05-07",
    lastSessionTopic: "Programming",
    lastSessionConfidence: 0.76,
    confidenceHistory: [0.55, 0.60, 0.64, 0.68, 0.71, 0.73, 0.75, 0.76],
  },
  {
    id: "6",
    studentCode: "S006",
    lastSessionDate: "2026-05-02",
    lastSessionTopic: "Robotics",
    lastSessionConfidence: 0.58,
    confidenceHistory: [0.40, 0.44, 0.48, 0.50, 0.53, 0.55, 0.57, 0.58],
  },
  {
    id: "7",
    studentCode: "S007",
    lastSessionDate: "2026-05-01",
    lastSessionTopic: "3D Printer",
    lastSessionConfidence: 0.37,
    confidenceHistory: [0.18, 0.22, 0.26, 0.30, 0.33, 0.35, 0.36, 0.37],
  },
  {
    id: "8",
    studentCode: "S008",
    lastSessionDate: "2026-04-30",
    lastSessionTopic: "Robotics",
    lastSessionConfidence: 0.88,
    confidenceHistory: [0.60, 0.66, 0.72, 0.76, 0.80, 0.84, 0.86, 0.88],
  },
];

function confColor(v: number) {
  return v >= 0.7 ? "#22C55E" : v >= 0.4 ? "#F59E0B" : "#EF4444";
}

function topicBadge(topic: string) {
  const map: Record<string, { bg: string; text: string }> = {
    "3D Printer": { bg: "rgba(139,92,246,0.2)", text: "#A78BFA" },
    "Programming": { bg: "rgba(6,182,212,0.2)", text: "#22D3EE" },
    "Robotics": { bg: "rgba(249,115,22,0.2)", text: "#FB923C" },
  };
  return map[topic] ?? { bg: "rgba(100,116,139,0.2)", text: "#94A3B8" };
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
  const [search, setSearch] = useState("");

  const filtered = MOCK_STUDENTS.filter((s) =>
    s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
    s.lastSessionTopic.toLowerCase().includes(search.toLowerCase())
  );

  const avgConf =
    MOCK_STUDENTS.reduce((sum, s) => sum + s.lastSessionConfidence, 0) /
    MOCK_STUDENTS.length;

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
            <p className="text-xs" style={{ color: "#90CFFF" }}>Student Analytics</p>
          </div>
        </div>

        {/* Logo small */}
        <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-auto"
          aria-label="Voya"
        >
          <text x="2" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
            fontSize="76" fontWeight="900" fill="#FFFFFF">vo</text>
          <text x="90" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
            fontSize="76" fontWeight="900" fill="#FFFFFF">y</text>
          <circle cx="103" cy="38" r="8" fill="#00C8FF" />
          <circle cx="123" cy="38" r="8" fill="#00C8FF" />
          <text x="133" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
            fontSize="76" fontWeight="900" fill="#FFFFFF">a</text>
        </svg>
      </header>

      <div className="relative z-10 flex-1 overflow-auto px-4 py-4 flex flex-col gap-4">

        {/* ── Summary stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Students", value: MOCK_STUDENTS.length, color: "#48CAE4", suffix: "" },
            { label: "Avg Conf.", value: Math.round(avgConf * 100), color: confColor(avgConf), suffix: "%" },
            { label: "Today", value: 3, color: "#A78BFA", suffix: "" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 flex flex-col gap-0.5"
              style={{
                background: "rgba(10,25,60,0.6)",
                border: "1px solid rgba(0,119,182,0.25)",
              }}
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
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(0,119,182,0.25)" }}>
          <div style={{ minWidth: 440 }}>
            {/* Table header */}
            <div
              className="grid px-3 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                gridTemplateColumns: "72px 1fr 1fr 56px 72px",
                background: "rgba(6,20,50,0.8)",
                color: "#4895EF",
                borderBottom: "1px solid rgba(0,119,182,0.2)",
              }}
            >
              <span>ID</span>
              <span>Date</span>
              <span>Topic</span>
              <span>Conf.</span>
              <span>Trend</span>
            </div>

            {/* Rows */}
            {filtered.map((s, idx) => {
              const badge = topicBadge(s.lastSessionTopic);
              return (
                <div
                  key={s.id}
                  className="grid px-3 py-2 items-center"
                  style={{
                    gridTemplateColumns: "72px 1fr 1fr 56px 72px",
                    background: idx % 2 === 0 ? "rgba(10,25,60,0.5)" : "rgba(6,16,42,0.5)",
                    borderBottom: idx < filtered.length - 1 ? "1px solid rgba(0,119,182,0.1)" : "none",
                  }}
                >
                  <span className="font-bold text-xs text-white">{s.studentCode}</span>

                  <span className="text-xs" style={{ color: "#90CFFF" }}>
                    {new Date(s.lastSessionDate).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short",
                    })}
                  </span>

                  <span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {s.lastSessionTopic}
                    </span>
                  </span>

                  <span className="text-xs font-bold" style={{ color: confColor(s.lastSessionConfidence) }}>
                    {Math.round(s.lastSessionConfidence * 100)}%
                  </span>

                  <TrendBar history={s.confidenceHistory} />
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm" style={{ color: "#4895EF" }}>
                No students match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
