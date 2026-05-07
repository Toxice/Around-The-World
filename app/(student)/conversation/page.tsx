"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

interface Message {
  role: "character" | "student";
  text: string;
  mood?: string;
}

const TYPING_DOTS = ["●", "●", "●"];

export default function ConversationPage() {
  const router = useRouter();
  const { session, addPoints, setMood, addBadge, resetSession } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [floatScore, setFloatScore] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Open with a greeting from the character
  useEffect(() => {
    if (!session.sessionId) {
      router.replace("/");
      return;
    }
    setMessages([
      {
        role: "character",
        text: `Hi! I'm ${session.character}. ${session.missionText} — let's get started!`,
        mood: "😊",
      },
    ]);
  }, [session.sessionId, session.character, session.missionText, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "student", text }]);

    try {
      const res = await fetch(`/api/sessions/${session.sessionId}/turns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "character", text: "Sorry, I didn't catch that. Could you try again?" },
        ]);
        setSending(false);
        return;
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "character", text: data.characterReply, mood: data.characterMood },
      ]);

      if (data.pointsEarned > 0) {
        addPoints(data.pointsEarned);
        setFloatScore(data.pointsEarned);
        setTimeout(() => setFloatScore(null), 900);
      }

      if (data.characterMood) setMood(data.characterMood);

      for (const badge of data.achievements ?? []) {
        addBadge(badge);
      }

      if (data.missionComplete) {
        setMissionComplete(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "character", text: "Something went wrong. Let's continue." },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleFinish() {
    router.push("/results");
  }

  return (
    <div className="flex flex-col h-screen bg-bg-dark text-text-primary overflow-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 bg-bg-card/80 backdrop-blur-sm border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{session.characterEmoji}</span>
          <div>
            <p className="text-sm font-semibold leading-none">{session.character}</p>
            <p className="text-xs text-text-secondary">
              {session.locationFlag} {session.situation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mood */}
          <span
            className="text-2xl"
            style={{ animation: "mood-pulse 0.4s ease" }}
            key={session.mood}
          >
            {session.mood}
          </span>

          {/* Score HUD */}
          <div className="relative flex flex-col items-end">
            <span className="text-xs text-text-secondary font-medium">Score</span>
            <span className="text-base font-bold text-amber">{session.score}</span>
            {floatScore !== null && (
              <span
                className="absolute -top-4 right-0 text-xs font-bold text-teal"
                style={{ animation: "score-float 0.9s ease forwards" }}
              >
                +{floatScore}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mission banner */}
      <div className="px-4 py-2 bg-brand/20 border-b border-brand/20 shrink-0">
        <p className="text-xs text-brand-light line-clamp-1">
          🎯 {session.missionText}
        </p>
      </div>

      {/* ── Chat area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 chat-scroll">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 max-w-[85%]",
              msg.role === "student" ? "self-end flex-row-reverse" : "self-start"
            )}
          >
            {msg.role === "character" && (
              <span className="text-2xl shrink-0 mt-1">{session.characterEmoji}</span>
            )}
            <div
              className={cn(
                "px-4 py-3 text-sm leading-relaxed",
                msg.role === "character"
                  ? "bg-bg-card border border-white/10 text-text-primary rounded-[4px_var(--radius-bubble)_var(--radius-bubble)_var(--radius-bubble)]"
                  : "bg-brand text-white rounded-[var(--radius-bubble)_4px_var(--radius-bubble)_var(--radius-bubble)]"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-2 self-start max-w-[85%]">
            <span className="text-2xl shrink-0 mt-1">{session.characterEmoji}</span>
            <div className="bg-bg-card border border-white/10 px-4 py-3 rounded-[4px_var(--radius-bubble)_var(--radius-bubble)_var(--radius-bubble)] flex gap-1 items-center">
              {TYPING_DOTS.map((_, idx) => (
                <span
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                  style={{ animation: `dots-bounce 1.2s ease-in-out ${idx * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────── */}
      {missionComplete ? (
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="text-center mb-3">
            <p className="text-teal font-semibold">🎉 Mission Complete!</p>
          </div>
          <button
            onClick={handleFinish}
            className="w-full h-14 rounded-[var(--radius-btn)] bg-teal text-bg-dark font-bold text-base active:scale-[0.97] transition-transform"
          >
            See Results →
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-white/10 flex gap-2 items-end shrink-0 bg-bg-dark">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            rows={1}
            disabled={sending}
            className="flex-1 resize-none rounded-[var(--radius-input)] px-4 py-3 bg-bg-input border border-white/10
                       text-text-primary placeholder:text-text-secondary/50 text-sm
                       focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all
                       max-h-28 overflow-y-auto disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-[var(--radius-btn)] bg-brand flex items-center justify-center
                       disabled:opacity-40 active:scale-90 transition-all shrink-0"
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 10L18 2L12 10L18 18L2 10Z" fill="white" />
            </svg>
          </button>

          {/* Finish early button */}
          <button
            onClick={handleFinish}
            className="w-12 h-12 rounded-[var(--radius-btn)] bg-white/10 flex items-center justify-center
                       hover:bg-white/20 active:scale-90 transition-all shrink-0 border border-white/10"
            aria-label="End conversation"
            title="End conversation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1" fill="white" opacity="0.7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
