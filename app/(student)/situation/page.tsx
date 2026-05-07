"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { SCENARIOS, SITUATIONS } from "@/lib/config/scenarios";
import { PrimaryButton, ScreenShell } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SituationPage() {
  const router = useRouter();
  const { session, setSituation } = useSession();
  const [selected, setSelected] = useState(session.situation);

  // Only show situations that have a matching scenario for the chosen location
  const available = SITUATIONS.filter((s) =>
    SCENARIOS.some(
      (sc) => sc.locationCode === session.locationCode && sc.situation === s.id
    )
  );

  function handleSelect(id: string) {
    setSelected(id);
    setSituation(id);
  }

  function handleContinue() {
    if (selected) router.push("/mission");
  }

  // Guard: no location selected
  if (!session.locationCode) {
    router.replace("/location");
    return null;
  }

  return (
    <ScreenShell className="gap-8">
      <header className="flex flex-col gap-1 mt-4">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
          <span>{session.locationFlag}</span>
          <span>{session.location}</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Choose a Situation</h1>
        <p className="text-text-secondary text-sm">What kind of conversation will you practice?</p>
      </header>

      <div className="flex flex-col gap-3 flex-1">
        {available.map((sit) => (
          <button
            key={sit.id}
            onClick={() => handleSelect(sit.id)}
            className={cn(
              "w-full flex items-center gap-4 p-5 rounded-[var(--radius-card)] border transition-all duration-150 text-left",
              "bg-bg-card border-white/10",
              selected === sit.id
                ? "border-brand ring-2 ring-brand/40 shadow-[var(--shadow-card)]"
                : "hover:border-brand/40"
            )}
          >
            <span className="text-4xl leading-none shrink-0">{sit.icon}</span>
            <div>
              <p className="font-semibold text-text-primary">{sit.title}</p>
              <p className="text-text-secondary text-sm">{sit.description}</p>
            </div>
            {selected === sit.id && (
              <span className="ml-auto text-brand text-lg">✓</span>
            )}
          </button>
        ))}
      </div>

      <PrimaryButton onClick={handleContinue} disabled={!selected}>
        Continue →
      </PrimaryButton>
    </ScreenShell>
  );
}
