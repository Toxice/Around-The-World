"use client";

import { useRef, useCallback, useState } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(async (text: string, voiceEnvKey: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceKey: voiceEnvKey }),
      });

      if (!res.ok) return;

      const contentType = res.headers.get("Content-Type") ?? "";

      // Mock mode returns JSON — skip playback silently
      if (contentType.includes("application/json")) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay  = () => setPlaying(true);
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlaying(false); URL.revokeObjectURL(url); };

      await audio.play();
    } catch {
      // TTS is non-critical — never crash the conversation on audio failure
      setPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  }, []);

  return { play, stop, playing };
}
