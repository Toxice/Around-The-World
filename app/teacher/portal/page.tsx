"use client";

import Link from "next/link";

const NAV_CARDS = [
  {
    icon: "📊",
    label: "Dashboard",
    description: "Student analytics & progress",
    href: "/teacher",
    active: true,
  },
  {
    icon: "👥",
    label: "Students",
    description: "Manage your class roster",
    href: null,
    active: false,
  },
  {
    icon: "📈",
    label: "Reports",
    description: "Export session reports",
    href: null,
    active: false,
  },
  {
    icon: "⚙️",
    label: "Settings",
    description: "Preferences & configuration",
    href: null,
    active: false,
  },
];

export default function TeacherPortalPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)",
      }}
    >
      {/* ── Decorative background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,160,255,0.22) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,119,182,0.4), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,119,182,0.4), transparent)" }} />
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"
            className="w-48 h-auto"
            style={{ filter: "drop-shadow(0 0 14px rgba(0,180,255,0.35))" }}
            aria-label="Voya"
          >
            <text x="2" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF">vo</text>
            <text x="90" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF">y</text>
            <circle cx="103" cy="46" r="5" fill="#00C8FF" />
            <circle cx="123" cy="46" r="5" fill="#00C8FF" />
            <text x="133" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif"
              fontSize="76" fontWeight="900" fill="#FFFFFF">a</text>
          </svg>
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: "#90CFFF" }}>
            Teacher Portal
          </p>
        </div>

        {/* Welcome */}
        <div className="w-full flex flex-col gap-1 text-center">
          <h1 className="text-xl font-bold text-white">Welcome back 👋</h1>
          <p className="text-sm" style={{ color: "#90CFFF" }}>
            Where would you like to go?
          </p>
        </div>

        {/* Nav cards grid */}
        <div className="w-full grid grid-cols-2 gap-3">
          {NAV_CARDS.map((card) => {
            const inner = (
              <div
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200"
                style={{
                  background: card.active
                    ? "linear-gradient(145deg, #0F2D7A 0%, #0B1F4F 100%)"
                    : "linear-gradient(145deg, rgba(13,31,61,0.6) 0%, rgba(10,18,40,0.6) 100%)",
                  borderColor: card.active
                    ? "rgba(0,180,216,0.55)"
                    : "rgba(0,119,182,0.2)",
                  opacity: card.active ? 1 : 0.55,
                  boxShadow: card.active ? "0 0 20px rgba(0,119,182,0.25)" : "none",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: card.active ? "rgba(0,119,182,0.25)" : "rgba(0,119,182,0.08)",
                    border: `1px solid ${card.active ? "rgba(0,180,216,0.4)" : "rgba(0,119,182,0.15)"}`,
                  }}
                >
                  {card.icon}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-bold text-white text-sm">{card.label}</span>
                  <span className="text-xs text-center leading-tight" style={{ color: "#90CFFF" }}>
                    {card.description}
                  </span>
                </div>
                {!card.active && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(0,119,182,0.15)", color: "#48CAE4" }}>
                    Soon
                  </span>
                )}
              </div>
            );

            return card.active && card.href ? (
              <Link key={card.label} href={card.href} className="active:scale-[0.97] transition-transform">
                {inner}
              </Link>
            ) : (
              <div key={card.label} className="cursor-not-allowed">
                {inner}
              </div>
            );
          })}
        </div>

        {/* Back */}
        <Link href="/" className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "#90CFFF" }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
