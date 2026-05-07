"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatConfidence } from "@/lib/utils";
import type { StudentSummary } from "@/types";

function ConfidenceBar({ history }: { history: number[] }) {
  if (history.length === 0) return <span className="text-xs text-teacher-muted">No sessions</span>;
  return (
    <div className="flex items-end gap-0.5 h-6">
      {history.slice(-8).map((v, i) => (
        <div
          key={i}
          className="w-2 rounded-sm"
          style={{
            height: `${Math.max(4, Math.round(v * 24))}px`,
            backgroundColor: v >= 0.7 ? "#22C55E" : v >= 0.4 ? "#F59E0B" : "#EF4444",
            opacity: 0.7 + i * 0.04,
          }}
        />
      ))}
    </div>
  );
}

export default function TeacherPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.studentCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-teacher-bg text-teacher-text">
      {/* Header */}
      <header className="bg-teacher-surface border-b border-teacher-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-teacher-text">EduLingo — Teacher Dashboard</h1>
          <p className="text-teacher-muted text-sm">Student conversation analytics</p>
        </div>
        <span className="text-2xl">📊</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by student ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs h-10 rounded-lg px-3 border border-teacher-border bg-teacher-surface text-teacher-text text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-teacher-muted">
            <p className="text-4xl mb-3">📭</p>
            <p>No students found.</p>
          </div>
        ) : (
          <div className="bg-teacher-surface rounded-xl border border-teacher-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-teacher-border bg-teacher-bg">
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Last Session</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Confidence</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Trend</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const conf = s.lastSessionConfidence !== null
                    ? formatConfidence(s.lastSessionConfidence)
                    : null;
                  return (
                    <tr key={s.id} className="border-b border-teacher-border last:border-0 hover:bg-teacher-bg transition-colors">
                      <td className="px-4 py-3 font-semibold">{s.studentCode}</td>
                      <td className="px-4 py-3 text-teacher-muted">
                        {s.lastSessionDate
                          ? new Date(s.lastSessionDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {conf ? (
                          <span className={`font-semibold ${conf.colorClass}`}>
                            {conf.percentage}
                          </span>
                        ) : (
                          <span className="text-teacher-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ConfidenceBar history={s.confidenceHistory} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/teacher/${s.id}`}
                          className="text-brand text-xs font-medium hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
