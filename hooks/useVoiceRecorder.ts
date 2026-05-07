"use client";

import { useState, useRef, useCallback } from "react";

type RecorderState = "idle" | "recording" | "transcribing" | "error";

interface UseVoiceRecorderOptions {
  onTranscript: (text: string) => void;
  onError?: (msg: string) => void;
}

export function useVoiceRecorder({ onTranscript, onError }: UseVoiceRecorderOptions) {
  const [state, setState] = useState<RecorderState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all mic tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());

        setState("transcribing");
        const blob = new Blob(chunksRef.current, { type: mimeType });

        try {
          const formData = new FormData();
          formData.append("audio", blob, `recording.${mimeType.includes("mp4") ? "mp4" : "webm"}`);

          const res = await fetch("/api/stt", { method: "POST", body: formData });
          if (!res.ok) throw new Error("STT request failed");

          const data = await res.json();
          const transcript = (data.transcript ?? "").trim();

          if (transcript) {
            onTranscript(transcript);
          } else {
            onError?.("Couldn't hear anything. Try again.");
          }
        } catch {
          onError?.("Voice transcription failed. Please type instead.");
        } finally {
          setState("idle");
        }
      };

      recorder.start(250); // collect chunks every 250ms
      setState("recording");
    } catch (err: unknown) {
      const msg = err instanceof Error && err.name === "NotAllowedError"
        ? "Microphone permission denied."
        : "Could not access microphone.";
      onError?.(msg);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [onTranscript, onError]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggle = useCallback(() => {
    if (state === "recording") {
      stop();
    } else if (state === "idle" || state === "error") {
      start();
    }
  }, [state, start, stop]);

  return { state, toggle };
}
