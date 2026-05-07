"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatConfidence } from "@/lib/utils";
import type { StudentDetail } from "@/types";

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/students/${studentId}`)
      .then((r) => {
        if (r.status === 404) { router.replace("/teacher"); return null; }
        return r.json();
      })
      .then((d) => d && setDetail(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-teacher-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      </main>
    );
  }

  if (!detail) return null;

  const avgConfidence =
    detail.sessions.length > 0
      ? detail.sessions.reduce((s, sess) => s + sess.finalConfidence, 0) / detail.sessions.length
      : 0;

  const conf = formatConfidence(avgConfidence);

  return (
    <main className="min-h-screen bg-teacher-bg text-teacher-text">
      {/* Header */}
      <header className="bg-teacher-surface border-b border-teacher-border px-6 py-4 flex items-center gap-4">
        <Link href="/teacher" className="text-brand text-sm font-medium hover:underline">
          ← All Students
        </Link>
        <h1 className="text-xl font-bold">{detail.studentCode}</h1>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard label="Total Sessions" value={String(detail.totalSessions)} />
          <SummaryCard label="Avg Confidence" value={conf.percentage} colorClass={conf.colorClass} />
          <SummaryCard label="Grammar Issues" value={String(detail.grammarErrors.length)} />
        </div>

        {/* Grammar errors */}
        {detail.grammarErrors.length > 0 && (
          <section className="bg-teacher-surface rounded-xl border border-teacher-border p-5">
            <h2 className="text-base font-semibold mb-3">Frequent Grammar Errors</h2>
            <div className="flex flex-col gap-2">
              {detail.grammarErrors.slice(0, 8).map(({ error, count }) => (
                <div key={error} className="flex items-center gap-3">
                  <div
                    className="h-2 rounded-full bg-rose"
                    style={{ width: `${Math.min(100, count * 20)}%`, minWidth: 8 }}
                  />
                  <span className="text-sm text-teacher-text">{error}</span>
                  <span className="ml-auto text-xs text-teacher-muted">{count}×</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vocabulary used */}
        {detail.vocabularyUsed.length > 0 && (
          <section className="bg-teacher-surface rounded-xl border border-teacher-border p-5">
            <h2 className="text-base font-semibold mb-3">Vocabulary Used</h2>
            <div className="flex flex-wrap gap-2">
              {detail.vocabularyUsed.map((w) => (
                <span
                  key={w}
                  className="px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
                >
                  {w}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Missed opportunities */}
        {detail.missedOpportunities.length > 0 && (
          <section className="bg-teacher-surface rounded-xl border border-teacher-border p-5">
            <h2 className="text-base font-semibold mb-3">Missed Opportunities</h2>
            <ul className="flex flex-col gap-1.5">
              {detail.missedOpportunities.slice(0, 5).map((m, i) => (
                <li key={i} className="text-sm text-teacher-text flex gap-2">
                  <span className="text-amber-500 shrink-0">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Session history */}
        {detail.sessions.length > 0 && (
          <section className="bg-teacher-surface rounded-xl border border-teacher-border overflow-hidden">
            <h2 className="text-base font-semibold p-5 border-b border-teacher-border">
              Session History
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-teacher-border bg-teacher-bg">
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Score</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Confidence</th>
                  <th className="text-left px-4 py-3 font-semibold text-teacher-muted">Badges</th>
                </tr>
              </thead>
              <tbody>
                {detail.sessions.map((s) => {
                  const c = formatConfidence(s.finalConfidence);
                  return (
                    <tr key={s.id} className="border-b border-teacher-border last:border-0">
                      <td className="px-4 py-3 text-teacher-muted">
                        {new Date(s.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{s.location} · {s.situation}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">{s.totalScore}</td>
                      <td className={`px-4 py-3 font-semibold ${c.colorClass}`}>{c.percentage}</td>
                      <td className="px-4 py-3 text-teacher-muted">
                        {s.badges.length > 0 ? s.badges.join(", ") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-teacher-surface rounded-xl border border-teacher-border p-4 flex flex-col gap-1">
      <p className="text-teacher-muted text-xs">{label}</p>
      <p className={`text-2xl font-bold ${colorClass ?? "text-teacher-text"}`}>{value}</p>
    </div>
  );
}
