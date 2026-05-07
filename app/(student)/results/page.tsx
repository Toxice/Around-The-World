"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { PrimaryButton, ScreenShell } from "@/components/ui";
import { formatConfidence } from "@/lib/utils";
import { getBadgeDescription } from "@/lib/config/badges";
import type { SessionResults } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const { session, resetSession } = useSession();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session.sessionId) {
      router.replace("/");
      return;
    }

    fetch(`/api/sessions/${session.sessionId}/results`)
      .then((r) => r.json())
      .then((data) => setResults(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session.sessionId, router]);

  function handlePlayAgain() {
    resetSession();
    router.push("/location");
  }

  function handleHome() {
    resetSession();
    router.push("/");
  }

  if (loading) {
    return (
      <ScreenShell className="items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading results…</p>
        </div>
      </ScreenShell>
    );
  }

  if (!results) {
    return (
      <ScreenShell className="items-center justify-center gap-4">
        <p className="text-text-secondary">Could not load results.</p>
        <PrimaryButton onClick={handleHome} size="md">
          Go Home
        </PrimaryButton>
      </ScreenShell>
    );
  }

  const confidence = formatConfidence(results.finalConfidence);
  const allBadges = [...new Set([...session.badges, ...results.badges.map((b) => b.badgeName)])];

  return (
    <ScreenShell className="gap-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-6xl">{session.mood}</span>
        <h1 className="text-2xl font-bold text-text-primary">
          {results.totalScore >= 60 ? "Great job!" : results.totalScore >= 30 ? "Nice effort!" : "Keep practicing!"}
        </h1>
        <p className="text-text-secondary text-sm text-center">
          {session.locationFlag} {results.location} · {results.situation}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Score" value={String(results.totalScore)} unit="pts" color="text-amber" />
        <StatCard label="Confidence" value={confidence.percentage} unit="" color={confidence.colorClass} />
        <StatCard label="Turns" value={String(results.turnCount)} unit="" color="text-teal" />
        <StatCard label="Badges" value={String(allBadges.length)} unit="" color="text-brand-light" />
      </div>

      {/* Badges */}
      {allBadges.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
            Achievements
          </p>
          <div className="flex flex-col gap-2">
            {allBadges.map((badge) => (
              <div
                key={badge}
                className="flex items-start gap-3 bg-bg-card rounded-[var(--radius-card)] px-4 py-3 border border-white/10"
              >
                <span className="text-2xl mt-0.5">🏅</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{badge}</p>
                  <p className="text-xs text-text-secondary">{getBadgeDescription(badge)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher brief */}
      {results.teacherBrief && (
        <div className="bg-bg-card rounded-[var(--radius-card)] px-4 py-3 border border-white/10">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest mb-1">
            Teacher Feedback
          </p>
          <p className="text-sm text-text-primary leading-relaxed">{results.teacherBrief}</p>
        </div>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <PrimaryButton onClick={handlePlayAgain}>Play Again →</PrimaryButton>
        <PrimaryButton variant="ghost" onClick={handleHome} size="md">
          Change Student
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-bg-card rounded-[var(--radius-card)] px-4 py-4 border border-white/10 flex flex-col gap-1">
      <p className="text-text-secondary text-xs">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
        {unit && <span className="text-sm font-normal text-text-secondary ml-1">{unit}</span>}
      </p>
    </div>
  );
}
