"use client";

import { useRef, useCallback, useState } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  }, []);

  const playUrl = useCallback(async (url: string, id: number) => {
    stop();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay  = () => setPlayingId(id);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    await audio.play().catch(() => setPlayingId(null));
  }, [stop]);

  // Fetch TTS audio and return a blob URL (caller owns the URL lifecycle)
  const fetchAudio = useCallback(async (text: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) return null;
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  return { fetchAudio, playUrl, stop, playingId };
}
