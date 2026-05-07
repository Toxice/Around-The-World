"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

const COUNTRIES = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    tagline: "American casual English",
    mapLeft: "15%",
    mapTop: "36%",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    tagline: "Central European culture",
    mapLeft: "56%",
    mapTop: "19%",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    tagline: "Parisian vibes",
    mapLeft: "45%",
    mapTop: "28%",
  },
] as const;

type CountryCode = (typeof COUNTRIES)[number]["code"];

export default function LocationPage() {
  const router = useRouter();
  const { setLocation } = useSession();
  const [selected, setSelected] = useState<CountryCode | null>(null);

  function handleSelectCountry(country: (typeof COUNTRIES)[number]) {
    setSelected(country.code);
    setLocation(country.code, country.name, country.flag);
  }

  function handleFlagContinue() {
    router.push("/scene");
  }

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0B1F4F 0%, #0F2D7A 45%, #1640A8 100%)" }}
    >
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "rgba(10,25,60,0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,119,182,0.25)",
        }}
      >
        <div>
          <p className="text-sm font-bold text-white">Choose Location</p>
          <p className="text-xs" style={{ color: "#90CFFF" }}>Where will your conversation take place?</p>
        </div>
        <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto" aria-label="Voya">
          <text x="2" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">vo</text>
          <text x="90" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">y</text>
          <circle cx="103" cy="38" r="8" fill="#00C8FF" />
          <circle cx="123" cy="38" r="8" fill="#00C8FF" />
          <text x="133" y="102" fontFamily="'Arial Rounded MT Bold', system-ui, sans-serif" fontSize="76" fontWeight="900" fill="#FFFFFF">a</text>
        </svg>
      </header>

      {/* Map + bottom */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Map — 2:1 aspect ratio so % positions match SVG viewBox exactly */}
        <div className="relative w-full shrink-0" style={{ paddingTop: "50%" }}>
          <div className="absolute inset-0">
            {/* SVG world map */}
            <svg
              viewBox="0 0 1000 500"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              aria-hidden="true"
            >
              {/* Ocean */}
              <rect width="1000" height="500" fill="#041830" />

              {/* ── North America — green ───────────────────────────────── */}
              <path
                d="M 60,42 L 105,30 L 160,24 L 222,28 L 268,72 L 282,138 L 265,188
                   L 240,228 L 215,265 L 190,292 L 168,300 L 145,285 L 115,258
                   L 82,218 L 62,170 L 48,118 L 52,72 Z"
                fill="#166534" stroke="#4ade80" strokeWidth="1.5"
              />
              {/* Central America */}
              <path
                d="M 190,292 L 204,308 L 198,332 L 180,325 L 168,300 Z"
                fill="#166534" stroke="#4ade80" strokeWidth="1"
              />
              {/* Greenland */}
              <path
                d="M 245,18 L 318,10 L 338,36 L 328,64 L 288,70 L 248,54 Z"
                fill="#374151" stroke="#6b7280" strokeWidth="1"
              />

              {/* ── South America — blue ────────────────────────────────── */}
              <path
                d="M 200,318 L 242,306 L 288,324 L 312,382 L 308,448 L 272,468
                   L 236,458 L 212,414 L 197,372 L 190,342 Z"
                fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5"
              />

              {/* ── Europe — pink ───────────────────────────────────────── */}
              {/* Scandinavia */}
              <path
                d="M 482,34 L 522,26 L 538,46 L 528,68 L 502,64 L 482,58 Z"
                fill="#be185d" stroke="#f472b6" strokeWidth="1"
              />
              {/* Main Europe */}
              <path
                d="M 440,70 L 512,54 L 558,68 L 578,94 L 568,132 L 538,152
                   L 502,150 L 468,138 L 448,120 L 440,100 Z"
                fill="#be185d" stroke="#f472b6" strokeWidth="1.5"
              />
              {/* Iberian */}
              <path
                d="M 440,100 L 459,130 L 450,152 L 432,140 L 428,118 Z"
                fill="#be185d" stroke="#f472b6" strokeWidth="1"
              />
              {/* Italy */}
              <path
                d="M 493,136 L 504,150 L 510,175 L 500,178 L 490,164 L 487,148 Z"
                fill="#be185d" stroke="#f472b6" strokeWidth="1"
              />
              {/* UK */}
              <path
                d="M 435,66 L 452,60 L 457,74 L 445,82 L 435,76 Z"
                fill="#be185d" stroke="#f472b6" strokeWidth="1"
              />

              {/* ── Africa — yellow ─────────────────────────────────────── */}
              <path
                d="M 453,155 L 547,150 L 596,186 L 616,262 L 606,362 L 568,410
                   L 522,418 L 480,395 L 460,350 L 447,284 L 448,218 Z"
                fill="#ca8a04" stroke="#fde047" strokeWidth="1.5"
              />
              {/* Madagascar */}
              <path
                d="M 582,298 L 597,293 L 600,330 L 590,342 L 578,326 Z"
                fill="#ca8a04" stroke="#fde047" strokeWidth="1"
              />

              {/* ── Asia + Russia — brown ───────────────────────────────── */}
              <path
                d="M 558,50 L 720,36 L 825,50 L 904,66 L 942,100 L 932,162
                   L 892,192 L 844,202 L 794,212 L 742,207 L 700,212 L 670,196
                   L 638,175 L 608,160 L 578,138 L 560,108 Z"
                fill="#92400e" stroke="#d97706" strokeWidth="1.5"
              />
              {/* India */}
              <path
                d="M 668,190 L 698,210 L 712,252 L 697,276 L 674,260 L 660,216 Z"
                fill="#92400e" stroke="#d97706" strokeWidth="1"
              />
              {/* SE Asia */}
              <path
                d="M 760,200 L 824,207 L 838,236 L 818,258 L 780,250 L 762,226 Z"
                fill="#92400e" stroke="#d97706" strokeWidth="1"
              />
              {/* Japan */}
              <path
                d="M 858,94 L 873,86 L 884,106 L 872,124 L 858,115 Z"
                fill="#92400e" stroke="#d97706" strokeWidth="1"
              />

              {/* ── Australia — white/light ─────────────────────────────── */}
              <path
                d="M 778,298 L 892,290 L 932,344 L 918,406 L 856,424
                   L 794,410 L 768,370 L 764,330 Z"
                fill="#9ca3af" stroke="#e5e7eb" strokeWidth="1.5"
              />
              {/* New Zealand */}
              <path
                d="M 942,388 L 954,380 L 960,398 L 950,410 L 940,400 Z"
                fill="#9ca3af" stroke="#e5e7eb" strokeWidth="1"
              />

              {/* Subtle lat/long grid */}
              {[100, 200, 300, 400].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y}
                  stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              ))}
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500"
                  stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              ))}
            </svg>

            {/* ── Country markers ─────────────────────────────────────── */}
            {COUNTRIES.map((country) => {
              const isSelected = selected === country.code;
              return (
                <div
                  key={country.code}
                  className="absolute"
                  style={{
                    left: country.mapLeft,
                    top: country.mapTop,
                    transform: "translate(-50%, -50%)",
                    zIndex: isSelected ? 30 : 10,
                  }}
                >
                  {/* Flag popup — appears on first tap, navigates on click */}
                  {isSelected && (
                    <button
                      onClick={handleFlagContinue}
                      className="absolute flex flex-col items-center"
                      style={{
                        bottom: "calc(100% + 10px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 40,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div
                        className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl"
                        style={{
                          background: "rgba(3,15,48,0.96)",
                          border: "1.5px solid rgba(0,200,255,0.6)",
                          boxShadow: "0 8px 32px rgba(0,100,200,0.6)",
                        }}
                      >
                        <span style={{ fontSize: 36, lineHeight: 1 }}>{country.flag}</span>
                        <span className="text-xs font-bold text-white">{country.name}</span>
                        <span className="text-xs font-semibold" style={{ color: "#00C8FF" }}>
                          Tap to enter →
                        </span>
                      </div>
                      {/* Arrow tail */}
                      <div style={{
                        width: 0, height: 0,
                        borderLeft: "9px solid transparent",
                        borderRight: "9px solid transparent",
                        borderTop: "9px solid rgba(0,200,255,0.6)",
                        marginTop: "-1px",
                      }} />
                    </button>
                  )}

                  {/* Marker pin */}
                  <button
                    onClick={() => handleSelectCountry(country)}
                    className="flex items-center justify-center rounded-full transition-all duration-200 active:scale-95"
                    style={{
                      width: 50,
                      height: 50,
                      fontSize: 24,
                      background: isSelected
                        ? "rgba(0,200,255,0.28)"
                        : "rgba(5,15,45,0.82)",
                      border: isSelected
                        ? "2px solid #00C8FF"
                        : "2px solid rgba(255,255,255,0.28)",
                      boxShadow: isSelected
                        ? "0 0 22px rgba(0,200,255,0.65)"
                        : "0 2px 10px rgba(0,0,0,0.6)",
                      backdropFilter: "blur(6px)",
                    }}
                    aria-label={country.name}
                  >
                    {country.flag}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <p className="text-sm text-center" style={{ color: "#90CFFF" }}>
            {selected
              ? "Tap the flag above to enter"
              : "Tap a country on the map to select it"}
          </p>
        </div>
      </div>
    </div>
  );
}
