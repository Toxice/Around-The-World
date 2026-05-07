"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { LOCATIONS } from "@/lib/config/scenarios";
import { PrimaryButton, ScreenShell } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function LocationPage() {
  const router = useRouter();
  const { session, setLocation } = useSession();
  const [selected, setSelected] = useState(session.locationCode);

  function handleSelect(code: string, name: string, flag: string) {
    setSelected(code);
    setLocation(code, name, flag);
  }

  function handleContinue() {
    if (selected) router.push("/situation");
  }

  return (
    <ScreenShell className="gap-8">
      <header className="flex flex-col gap-1 mt-4">
        <h1 className="text-2xl font-bold text-text-primary">Choose a Location</h1>
        <p className="text-text-secondary text-sm">Where will your conversation take place?</p>
      </header>

      <div className="flex flex-col gap-3 flex-1">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.code}
            onClick={() => handleSelect(loc.code, loc.name, loc.flag)}
            className={cn(
              "w-full flex items-center gap-4 p-5 rounded-[var(--radius-card)] border transition-all duration-150 text-left",
              "bg-bg-card border-white/10",
              selected === loc.code
                ? "border-brand ring-2 ring-brand/40 shadow-[var(--shadow-card)]"
                : "hover:border-brand/40"
            )}
          >
            <span className="text-4xl leading-none shrink-0">{loc.flag}</span>
            <div>
              <p className="font-semibold text-text-primary">{loc.name}</p>
              <p className="text-text-secondary text-sm">{loc.tagline}</p>
            </div>
            {selected === loc.code && (
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
