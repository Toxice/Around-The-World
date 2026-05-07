"use client";

import { SessionProvider } from "@/context/SessionContext";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-student min-h-screen" style={{ backgroundColor: "#000814", color: "#F1F5F9" }}>
      <SessionProvider>{children}</SessionProvider>
    </div>
  );
}
