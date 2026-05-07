"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SessionState {
  studentCode: string;
  studentId: string;
  sessionId: string;
  location: string;
  locationCode: string;
  locationFlag: string;
  situation: string;
  character: string;
  characterEmoji: string;
  missionText: string;
  voiceId: string;
  score: number;
  mood: string;
  badges: string[];
}

interface SessionContextValue {
  session: SessionState;
  setStudentInfo: (studentCode: string, studentId: string) => void;
  setLocation: (code: string, name: string, flag: string) => void;
  setSituation: (situation: string) => void;
  startSession: (sessionId: string, character: string, characterEmoji: string, missionText: string, voiceId: string) => void;
  addPoints: (points: number) => void;
  setMood: (mood: string) => void;
  addBadge: (badge: string) => void;
  resetSession: () => void;
}

const DEFAULT_STATE: SessionState = {
  studentCode: "",
  studentId: "",
  sessionId: "",
  location: "",
  locationCode: "",
  locationFlag: "",
  situation: "",
  character: "",
  characterEmoji: "",
  missionText: "",
  voiceId: "",
  score: 0,
  mood: "😊",
  badges: [],
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(DEFAULT_STATE);

  const setStudentInfo = useCallback((studentCode: string, studentId: string) => {
    setSession((s) => ({ ...s, studentCode, studentId }));
  }, []);

  const setLocation = useCallback((code: string, name: string, flag: string) => {
    setSession((s) => ({ ...s, locationCode: code, location: name, locationFlag: flag }));
  }, []);

  const setSituation = useCallback((situation: string) => {
    setSession((s) => ({ ...s, situation }));
  }, []);

  const startSession = useCallback(
    (sessionId: string, character: string, characterEmoji: string, missionText: string, voiceId: string) => {
      setSession((s) => ({ ...s, sessionId, character, characterEmoji, missionText, voiceId, score: 0, mood: "😊", badges: [] }));
    },
    []
  );

  const addPoints = useCallback((points: number) => {
    setSession((s) => ({ ...s, score: s.score + points }));
  }, []);

  const setMood = useCallback((mood: string) => {
    setSession((s) => ({ ...s, mood }));
  }, []);

  const addBadge = useCallback((badge: string) => {
    setSession((s) => ({
      ...s,
      badges: s.badges.includes(badge) ? s.badges : [...s.badges, badge],
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSession((s) => ({ ...DEFAULT_STATE, studentCode: s.studentCode, studentId: s.studentId }));
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, setStudentInfo, setLocation, setSituation, startSession, addPoints, setMood, addBadge, resetSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
