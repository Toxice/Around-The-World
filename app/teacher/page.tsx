"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentSummary } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function pct(v: number) { return Math.round(v * 100); }

function confColor(v: number) {
  return v >= 0.7 ? "#22C55E" : v >= 0.4 ? "#F59E0B" : "#EF4444";
}

// ── Sparkline: mini bar chart showing a metric over sessions ──────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.slice(-8);
  if (pts.length === 0) return <span style={{ color: "#475569", fontSize: 10 }}>—</span>;
  return (
    <div className="flex items-end gap-px" style={{ height: 20 }}>
      {pts.map((v, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: Math.max(2, Math.round(v * 20)),
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.4 + (i / pts.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
  const totalPoints   = students.reduce((sum, s) => sum + s.totalScore, 0);
  const avgConf = students.length > 0
    ? students.reduce((sum, s) => sum + s.avgConfidence, 0) / students.length : 0;

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,160,255,0.15) 0%, transparent 65%)" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: "rgba(10,25,60,0.7)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,119,182,0.25)" }}>
        <div className="flex items-center gap-4">
          <Link href="/teacher/portal" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#90CFFF" }}>←</Link>
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

        {/* ── Class-level summary cards ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Students",  value: String(students.length), color: "#48CAE4" },
            { label: "Sessions",  value: String(totalSessions),   color: "#A78BFA" },
            { label: "Points",    value: String(totalPoints),      color: "#F59E0B" },
            { label: "Avg Conf.", value: `${pct(avgConf)}%`,       color: confColor(avgConf) },
          ].map((c) => (
            <div key={c.label} className="rounded-xl p-3 flex flex-col gap-0.5"
              style={{ background: "rgba(10,25,60,0.6)", border: "1px solid rgba(0,119,182,0.25)" }}>
              <p className="text-xs" style={{ color: "#90CFFF" }}>{c.label}</p>
              <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <input
          type="text"
          placeholder="Search student or topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 rounded-xl px-3 text-sm focus:outline-none"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,119,182,0.35)", color: "#FFFFFF" }}
        />

        {/* ── Student cards ── */}
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: "#90CFFF" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: "#90CFFF" }}>
            {students.length === 0 ? "No student data yet." : "No students match your search."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s) => (
              <Link
                key={s.id}
                href={`/teacher/students/${s.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="rounded-2xl px-4 py-3 flex flex-col gap-3 hover:brightness-110 transition-all active:scale-[0.99]"
                  style={{ background: "rgba(10,25,60,0.7)", border: "1px solid rgba(0,119,182,0.25)" }}
                >
                  {/* Top row: student code + last topic */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{s.studentCode}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,119,182,0.2)", color: "#90CFFF" }}>
                      {s.lastSessionTopic ?? "No sessions yet"}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between">
                    <Stat label="Sessions" value={String(s.totalSessions)} color="#48CAE4" />
                    <Stat label="Points"   value={String(s.totalScore)}    color="#F59E0B" />
                    <Stat label="Conf."    value={`${pct(s.avgConfidence)}%`}   color={confColor(s.avgConfidence)} />
                    <Stat label="Tech"     value={s.avgTechMastery > 0 ? `${pct(s.avgTechMastery)}%` : "—"} color="#A78BFA" />
                    <Stat label="Effic."   value={s.avgEfficiency  > 0 ? `${pct(s.avgEfficiency)}%`  : "—"} color="#22D3EE" />
                  </div>

                  {/* Sparklines row */}
                  <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[10px]" style={{ color: "#64748B" }}>Confidence</span>
                      <Sparkline data={s.confidenceHistory} color={confColor(s.avgConfidence)} />
                    </div>
                    {s.avgTechMastery > 0 && (
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[10px]" style={{ color: "#64748B" }}>Tech Mastery</span>
                        <Sparkline data={s.techMasteryHistory} color="#A78BFA" />
                      </div>
                    )}
                    {s.avgEfficiency > 0 && (
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[10px]" style={{ color: "#64748B" }}>Efficiency</span>
                        <Sparkline data={s.efficiencyHistory} color="#22D3EE" />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
