"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StudentSummary } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function pct(v: number) { return Math.round(v * 100); }

function pctColor(v: number): React.CSSProperties {
  if (v >= 80) return { color: "#0F6E56" };
  if (v >= 60) return { color: "#BA7517" };
  return { color: "#A32D2D" };
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length === 0) return <span style={{ color: "#aaa", fontSize: 12 }}>—</span>;
  const max = Math.max(...scores, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {scores.map((s, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: Math.max(4, Math.round((s / max) * 26)),
            borderRadius: "2px 2px 0 0",
            background: "#1D9E75",
            opacity: 0.4 + (i / scores.length) * 0.6,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Metric card (top stats) ───────────────────────────────────────────────────

function MetricCard({ label, value, badge, icon }: {
  label: string; value: string; badge?: string | null; icon: string;
}) {
  return (
    <div style={{ background: "#f5f5f3", borderRadius: 8, padding: "12px 14px", flex: "1 1 0", minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
        <span>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: "#1a1a1a", display: "flex", alignItems: "baseline", gap: 6 }}>
        {value}
        {badge && (
          <span style={{ fontSize: 12, fontWeight: 500, color: "#0F6E56", background: "#E1F5EE", padding: "2px 6px", borderRadius: 4 }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────

type SortKey = "sessions" | "points" | "words" | "conf" | "tech" | "effic";

const COLUMNS: { key: string; label: string; width: string; sortable: boolean }[] = [
  { key: "code",      label: "Student",          width: "10%", sortable: false },
  { key: "topic",     label: "Last topic",        width: "22%", sortable: false },
  { key: "sessions",  label: "Sessions",          width: "7%",  sortable: true  },
  { key: "points",    label: "Points",            width: "8%",  sortable: true  },
  { key: "words",     label: "Words",             width: "8%",  sortable: true  },
  { key: "conf",      label: "Conf. %",           width: "7%",  sortable: true  },
  { key: "tech",      label: "Tech %",            width: "7%",  sortable: true  },
  { key: "effic",     label: "Effic. %",          width: "7%",  sortable: true  },
  { key: "sparkline", label: "Points / session",  width: "22%", sortable: false },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sortKey, setSortKey]   = useState<SortKey | null>(null);
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleSort(key: string) {
    if (!["sessions", "points", "conf", "tech", "effic"].includes(key)) return;
    const k = key as SortKey;
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  const keyMap: Record<SortKey, (s: StudentSummary) => number> = {
    sessions: (s) => s.totalSessions,
    points:   (s) => s.totalScore,
    words:    (s) => s.totalWords,
    conf:     (s) => s.avgConfidence,
    tech:     (s) => s.avgTechMastery,
    effic:    (s) => s.avgEfficiency,
  };

  const filtered = students.filter((s) =>
    s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
    (s.lastSessionTopic ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const fn = keyMap[sortKey];
    return sortDir === "asc" ? fn(a) - fn(b) : fn(b) - fn(a);
  });

  // Class-level top stats
  const totalWords  = students.reduce((sum, s) => sum + s.totalWords, 0);
  const totalVocab  = students.reduce((sum, s) => sum + s.vocabCount, 0);
  const totalPoints = students.reduce((sum, s) => sum + s.totalScore, 0);
  const totalSess   = students.reduce((sum, s) => sum + s.totalSessions, 0);

  return (
    <div style={{ padding: "1.5rem", fontFamily: "system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>

      {/* Back link */}
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/teacher/portal" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>
          ← Portal
        </Link>
      </div>

      {/* Top stat cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <MetricCard label="Total words"   value={totalWords.toLocaleString()}  badge={null}   icon="✏️" />
        <MetricCard label="Vocab size"    value={totalVocab.toLocaleString()}  badge={null}   icon="📖" />
        <MetricCard label="Total points"  value={totalPoints.toLocaleString()} badge={null}   icon="⭐" />
        <MetricCard label="Sessions"      value={totalSess.toLocaleString()}   badge={null}   icon="📊" />
      </div>

      {/* Table header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a" }}>Students</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              fontSize: 12, padding: "4px 10px", borderRadius: 20,
              border: "0.5px solid #e0e0da", outline: "none", background: "#f5f5f3",
            }}
          />
          <span style={{ fontSize: 12, color: "#888", background: "#f5f5f3", padding: "2px 10px", borderRadius: 20, border: "0.5px solid #e0e0da" }}>
            {filtered.length} students
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#888" }}>Loading…</div>
      ) : (
        <div style={{ background: "#fff", border: "0.5px solid #e0e0da", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#f5f5f3", borderBottom: "0.5px solid #e0e0da" }}>
                {COLUMNS.map((col) => {
                  const active = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        width: col.width, padding: "9px 12px", textAlign: "left",
                        fontWeight: 500, fontSize: 11, textTransform: "uppercase",
                        letterSpacing: "0.05em", whiteSpace: "nowrap",
                        color: active ? "#1D9E75" : "#888",
                        cursor: col.sortable ? "pointer" : "default",
                        userSelect: "none",
                      }}
                    >
                      {col.label}
                      {col.sortable && active && (
                        <span style={{ marginLeft: 4, fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>
                    No students found.
                  </td>
                </tr>
              ) : sorted.map((s, i) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: i < sorted.length - 1 ? "0.5px solid #f0f0ea" : "none", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => window.location.href = `/teacher/students/${s.id}`}
                >
                  <td style={{ padding: "8px 12px", fontWeight: 500, color: "#1a1a1a" }}>{s.studentCode}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      display: "inline-block", background: "#E6F1FB", color: "#185FA5",
                      fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
                    }}>
                      {s.lastSessionTopic ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#1a1a1a" }}>{s.totalSessions}</td>
                  <td style={{ padding: "8px 12px", color: "#1a1a1a" }}>{s.totalScore.toLocaleString()}</td>
                  <td style={{ padding: "8px 12px", color: "#1a1a1a" }}>{s.totalWords.toLocaleString()}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 500, ...pctColor(pct(s.avgConfidence)) }}>{pct(s.avgConfidence)}%</td>
                  <td style={{ padding: "8px 12px", fontWeight: 500, ...pctColor(pct(s.avgTechMastery)) }}>
                    {s.avgTechMastery > 0 ? `${pct(s.avgTechMastery)}%` : "—"}
                  </td>
                  <td style={{ padding: "8px 12px", fontWeight: 500, ...pctColor(pct(s.avgEfficiency)) }}>
                    {s.avgEfficiency > 0 ? `${pct(s.avgEfficiency)}%` : "—"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <Sparkline scores={s.pointsHistory} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
