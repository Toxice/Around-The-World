"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";

interface Message {
  role: "character" | "student";
  text: string;
  isVoice?: boolean;
  id: number;
  audioUrl?: string;
  audioLoading?: boolean;
}

const TYPING_DOTS = ["●", "●", "●"];

export default function ConversationPage() {
  const router = useRouter();
  const { session, addPoints, setMood, addBadge } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [floatScore, setFloatScore] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState("");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const { fetchAudio, playUrl, playingId } = useAudioPlayer();
  const msgIdRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // ── Voice recorder ─────────────────────────────────────────────────────────
  const handleTranscript = useCallback((text: string) => {
    // Auto-send the transcribed message immediately
    sendMessageText(text, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { state: recorderState, toggle: toggleRecorder } = useVoiceRecorder({
    onTranscript: handleTranscript,
    onError: (msg) => {
      setVoiceError(msg);
      setTimeout(() => setVoiceError(""), 4000);
    },
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session.sessionId) { router.replace("/"); return; }
    const id = ++msgIdRef.current;
    setMessages([{ role: "character", text: `Hi! I'm ${session.character}. ${session.missionText} — let's get started!`, id, audioLoading: true }]);
    fetchAudio(`Hi! I'm ${session.character}. ${session.missionText} — let's get started!`).then((url) => {
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, audioUrl: url ?? undefined, audioLoading: false } : m));
      if (!mutedRef.current && url) playUrl(url, id);
    });
  }, [session.sessionId, session.character, session.missionText, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ───────────────────────────────────────────────────────────────────
  async function sendMessageText(text: string, isVoice = false) {
    if (!text.trim() || sending) return;

    setSending(true);
    setMessages((prev) => [...prev, { role: "student", text, isVoice, id: ++msgIdRef.current }]);

    try {
      const res = await fetch(`/api/sessions/${session.sessionId}/turns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "character", text: "Sorry, I didn't catch that. Could you try again?", id: ++msgIdRef.current }]);
        return;
      }

      const data = await res.json();
      const replyId = ++msgIdRef.current;

      setMessages((prev) => [...prev, { role: "character", text: data.characterReply, id: replyId, audioLoading: true }]);

      // Fetch TTS immediately and auto-play when ready
      fetchAudio(data.characterReply).then((url) => {
        setMessages((prev) => prev.map((m) => m.id === replyId ? { ...m, audioUrl: url ?? undefined, audioLoading: false } : m));
        if (!mutedRef.current && url) playUrl(url, replyId);
      });

      if (data.pointsEarned > 0) {
        addPoints(data.pointsEarned);
        setFloatScore(data.pointsEarned);
        setTimeout(() => setFloatScore(null), 900);
      }
      if (data.characterMood) setMood(data.characterMood);
      for (const badge of data.achievements ?? []) addBadge(badge);
      if (data.missionComplete) setMissionComplete(true);
    } catch {
      setMessages((prev) => [...prev, { role: "character", text: "Something went wrong. Let's continue.", id: Date.now() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSendTyped() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessageText(text, false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendTyped(); }
  }

  // ── Mic button state helpers ───────────────────────────────────────────────
  const isRecording     = recorderState === "recording";
  const isTranscribing  = recorderState === "transcribing";
  const micDisabled     = sending || isTranscribing || missionComplete;

  return (
    <div className="flex flex-col h-screen bg-bg-dark text-text-primary overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-bg-card/80 backdrop-blur-sm border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{session.characterEmoji}</span>
          <div>
            <p className="text-sm font-semibold leading-none">{session.character}</p>
            <p className="text-xs text-text-secondary">{session.locationFlag} {session.situation}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute character voice" : "Mute character voice"}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            {muted ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L4 5H1v6h3l4 3V2Z" fill="white" opacity="0.4"/>
                <line x1="11" y1="5" x2="15" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="15" y1="5" x2="11" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L4 5H1v6h3l4 3V2Z" fill="white" opacity="0.9"/>
                <path d="M11 5.5a3.5 3.5 0 010 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9"/>
                <path d="M13 3.5a6 6 0 010 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
              </svg>
            )}
          </button>
          <span className="text-2xl" style={{ animation: "mood-pulse 0.4s ease" }} key={session.mood}>
            {session.mood}
          </span>
          <div className="relative flex flex-col items-end">
            <span className="text-xs text-text-secondary font-medium">Score</span>
            <span className="text-base font-bold text-amber">{session.score}</span>
            {floatScore !== null && (
              <span className="absolute -top-4 right-0 text-xs font-bold text-teal"
                style={{ animation: "score-float 0.9s ease forwards" }}>
                +{floatScore}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mission banner */}
      <div className="px-4 py-2 bg-brand/20 border-b border-brand/20 shrink-0">
        <p className="text-xs text-brand-light line-clamp-1">🎯 {session.missionText}</p>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 chat-scroll">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-2 max-w-[85%]",
            msg.role === "student" ? "self-end flex-row-reverse" : "self-start"
          )}>
            {msg.role === "character" && (
              <span className="text-2xl shrink-0 mt-1">{session.characterEmoji}</span>
            )}
            <div className={cn(
              "px-4 py-3 text-sm leading-relaxed",
              msg.role === "character"
                ? "bg-bg-card border border-white/10 text-text-primary rounded-[4px_var(--radius-bubble)_var(--radius-bubble)_var(--radius-bubble)]"
                : "bg-brand text-white rounded-[var(--radius-bubble)_4px_var(--radius-bubble)_var(--radius-bubble)]"
            )}>
              {msg.isVoice && (
                <span className="inline-block mr-1.5 opacity-70 text-xs">🎤</span>
              )}
              {msg.text}
              {msg.role === "character" && (
                <button
                  onClick={() => msg.audioUrl && playUrl(msg.audioUrl, msg.id)}
                  disabled={msg.audioLoading || !msg.audioUrl}
                  className={cn(
                    "ml-2 align-middle transition-all text-base",
                    playingId === msg.id
                      ? "opacity-100 animate-pulse"
                      : msg.audioLoading
                      ? "opacity-30 cursor-wait"
                      : "opacity-40 hover:opacity-100 hover:scale-110"
                  )}
                  aria-label="Listen"
                >
                  {playingId === msg.id ? "🔊" : msg.audioLoading ? "⏳" : "🔈"}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Typing / transcribing indicator */}
        {(sending || isTranscribing) && (
          <div className="flex gap-2 self-start max-w-[85%]">
            <span className="text-2xl shrink-0 mt-1">
              {isTranscribing ? "🎤" : session.characterEmoji}
            </span>
            <div className="bg-bg-card border border-white/10 px-4 py-3 rounded-[4px_var(--radius-bubble)_var(--radius-bubble)_var(--radius-bubble)] flex gap-1 items-center">
              {isTranscribing ? (
                <span className="text-xs text-text-secondary">Transcribing…</span>
              ) : (
                TYPING_DOTS.map((_, idx) => (
                  <span key={idx} className="w-1.5 h-1.5 rounded-full bg-text-secondary"
                    style={{ animation: `dots-bounce 1.2s ease-in-out ${idx * 0.2}s infinite` }} />
                ))
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Voice error toast */}
      {voiceError && (
        <div className="mx-4 mb-2 px-4 py-2 rounded-lg bg-rose/20 border border-rose/30 text-rose text-xs text-center shrink-0">
          {voiceError}
        </div>
      )}

      {/* ── Input area ── */}
      {missionComplete ? (
        <div className="p-4 border-t border-white/10 shrink-0">
          <p className="text-teal font-semibold text-center mb-3">🎉 Mission Complete!</p>
          <button onClick={() => router.push("/results")}
            className="w-full h-14 rounded-[var(--radius-btn)] bg-teal text-bg-dark font-bold text-base active:scale-[0.97] transition-transform">
            See Results →
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-white/10 flex gap-2 items-end shrink-0 bg-bg-dark">

          {/* ── Mic button ── */}
          <button
            onClick={toggleRecorder}
            disabled={micDisabled}
            aria-label={isRecording ? "Stop recording" : "Record voice message"}
            className={cn(
              "w-12 h-12 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40",
              isRecording
                ? "bg-rose border-2 border-rose/50"
                : "bg-white/10 border border-white/20 hover:bg-white/20"
            )}
          >
            {isRecording ? (
              /* Pulsing stop icon */
              <span className="w-4 h-4 rounded-sm bg-white"
                style={{ animation: "pulse-ring 1s ease-in-out infinite" }} />
            ) : isTranscribing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              /* Mic icon */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6" y="1" width="6" height="10" rx="3" fill="white" opacity="0.9"/>
                <path d="M3 9a6 6 0 0012 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9"/>
                <line x1="9" y1="15" x2="9" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
              </svg>
            )}
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording… tap mic to stop" : "Type or use mic…"}
            rows={1}
            disabled={sending || isRecording}
            className="flex-1 resize-none rounded-[var(--radius-input)] px-4 py-3 bg-bg-input border border-white/10
                       text-text-primary placeholder:text-text-secondary/50 text-sm
                       focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all
                       max-h-28 overflow-y-auto disabled:opacity-50"
          />

          {/* Send button */}
          <button
            onClick={handleSendTyped}
            disabled={!input.trim() || sending || isRecording}
            className="w-12 h-12 rounded-[var(--radius-btn)] bg-brand flex items-center justify-center
                       disabled:opacity-40 active:scale-90 transition-all shrink-0"
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 10L18 2L12 10L18 18L2 10Z" fill="white" />
            </svg>
          </button>

          {/* End conversation */}
          <button
            onClick={() => router.push("/results")}
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
