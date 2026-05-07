import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatConfidence(score: number): {
  percentage: string;
  label: string;
  emoji: string;
  colorClass: string;
} {
  const pct = Math.round(score * 100);
  if (pct >= 70) return { percentage: `${pct}%`, label: "Confident!", emoji: "😊", colorClass: "text-green-400" };
  if (pct >= 40) return { percentage: `${pct}%`, label: "Keep going!", emoji: "😐", colorClass: "text-amber-400" };
  return { percentage: `${pct}%`, label: "Practice more!", emoji: "😟", colorClass: "text-red-400" };
}

export function confidenceMoodEmoji(score: number, struggleDetected: boolean, missionComplete: boolean): string {
  if (missionComplete) return "🥳";
  if (struggleDetected) return "🤔";
  if (score > 0.8) return "🤩";
  if (score > 0.5) return "😊";
  if (score > 0.3) return "😐";
  return "😟";
}
