"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { getScenario, getRandomMission } from "@/lib/config/scenarios";
import { PrimaryButton, ScreenShell } from "@/components/ui";

export default function MissionPage() {
  const router = useRouter();
  const { session, startSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scenario = getScenario(session.locationCode, session.situation);

  // Pick a random mission once on mount
  const [mission] = useState(() => (scenario ? getRandomMission(scenario) : ""));

  useEffect(() => {
    if (!session.locationCode || !session.situation) {
      router.replace("/location");
    }
  }, [session.locationCode, session.situation, router]);

  if (!scenario) return null;

  async function handleStart() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: session.studentCode,
          location: scenario!.location,
          situation: scenario!.situation,
          character: scenario!.character,
          missionText: mission,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to start session.");
        setLoading(false);
        return;
      }

      const { sessionId } = await res.json();
      startSession(
        sessionId,
        scenario!.character,
        scenario!.characterEmoji,
        mission,
        scenario!.voiceEnvKey
      );
      router.push("/conversation");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <ScreenShell className="gap-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-text-secondary text-sm mt-4">
        <span>{session.locationFlag}</span>
        <span>{session.location}</span>
        <span>·</span>
        <span>{scenario.situationIcon} {scenario.situation}</span>
      </div>

      {/* Character card */}
      <div
        className="rounded-[var(--radius-card)] p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: "linear-gradient(135deg, #1E1445 0%, #2D1F5E 100%)" }}
      >
        <span className="text-6xl">{scenario.characterEmoji}</span>
        <div>
          <p className="text-lg font-bold text-text-primary">{scenario.character}</p>
          <p className="text-text-secondary text-sm">{scenario.characterRole}</p>
        </div>
      </div>

      {/* Mission */}
      <div className="flex flex-col gap-3">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
          Your Mission
        </p>
        <p className="text-text-primary text-lg font-semibold leading-snug">
          {mission}
        </p>
      </div>

      {/* Vocabulary hints */}
      <div className="flex flex-col gap-2">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
          Useful Vocabulary
        </p>
        <div className="flex flex-wrap gap-2">
          {scenario.vocabularyHints.split(",").map((w) => (
            <span
              key={w.trim()}
              className="px-3 py-1 rounded-full text-xs bg-brand/20 text-brand-light border border-brand/20"
            >
              {w.trim()}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="text-rose text-sm text-center">{error}</p>}

      <div className="flex-1" />

      <PrimaryButton onClick={handleStart} loading={loading}>
        Start Conversation →
      </PrimaryButton>
    </ScreenShell>
  );
}
