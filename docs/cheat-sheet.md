# EduLingo — Codebase Cheat Sheet

---

## 1. The Big Picture

EduLingo is a **Next.js 16 full-stack app** — the same repo serves both the frontend (React pages) and the backend (API routes). There is no separate server process.

```
Browser  ──fetch──►  Next.js API routes  ──►  SQLite (via Prisma)
                           │
                           └──►  Claude API proxy (partner team)
                           └──►  Whisper STT
                           └──►  ElevenLabs TTS
```

The app has **two user interfaces** living in the same project:
- **Student app** — dark-themed, mobile-first, at `/`
- **Teacher dashboard** — light-themed, desktop, at `/teacher`

---

## 2. Folder Structure

```
app/                      ← All Next.js routes (pages + API)
  (student)/              ← Route GROUP — students. The () means this
  │                         folder doesn't add to the URL path.
  │                         So (student)/page.tsx → URL: /
  │  layout.tsx           ← Wraps ALL student pages in SessionProvider
  │  page.tsx             ← / — Login screen
  │  location/page.tsx    ← /location
  │  situation/page.tsx   ← /situation
  │  mission/page.tsx     ← /mission
  │  conversation/page.tsx ← /conversation
  │  results/page.tsx     ← /results
  │
  teacher/
  │  page.tsx             ← /teacher
  │  [studentId]/page.tsx ← /teacher/abc123  ([x] = dynamic segment)
  │
  api/                    ← All backend endpoints
  │  health/route.ts      ← GET /api/health
  │  sessions/
  │    route.ts           ← POST /api/sessions
  │    [id]/turns/route.ts     ← POST /api/sessions/:id/turns
  │    [id]/results/route.ts   ← GET /api/sessions/:id/results
  │  students/
  │    route.ts           ← GET /api/students
  │    lookup/route.ts    ← GET /api/students/lookup?code=S001
  │    [id]/route.ts      ← GET /api/students/:id
  │  stt/route.ts         ← POST /api/stt
  │  tts/route.ts         ← POST /api/tts
  │  admin/seed/route.ts  ← POST /api/admin/seed
  │
  layout.tsx              ← Root layout: sets font, PWA metadata, <html>
  globals.css             ← ALL styling (Tailwind + design tokens)

components/ui/            ← Reusable React components
  PrimaryButton.tsx
  Card.tsx
  ScreenShell.tsx

context/
  SessionContext.tsx      ← Global student session state (React Context)

lib/
  db/
    index.ts              ← Prisma client singleton (one instance per server)
    repositories/         ← DB query functions, one file per model
      studentRepository.ts
      sessionRepository.ts
      turnRepository.ts
      badgeRepository.ts
  config/
    scenarios.ts          ← All location/situation/character config data
    badges.ts             ← Badge names and descriptions
  mock/
    mockAiResponse.ts     ← Fake AI responses for dev (MOCK_AI=true)
  utils.ts                ← Helper functions (cn, formatConfidence)

prisma/
  schema.prisma           ← Database schema (4 tables)

types/
  index.ts                ← All TypeScript interfaces

scripts/
  seed.ts                 ← Creates S001-S010 students in the DB
```

---

## 3. The Student Flow (Step by Step)

```
/ (Login)
  → User types "S001", clicks Start
  → fetch GET /api/students/lookup?code=S001
  → If found: setStudentInfo("S001", "cuid...") in SessionContext
  → router.push("/location")

/location
  → Shows UK / US / ZA cards
  → User picks one → setLocation("UK", "United Kingdom", "🇬🇧")
  → router.push("/situation")

/situation
  → Filters SCENARIOS to only show situations available for chosen location
  → User picks Restaurant → setSituation("Restaurant")
  → router.push("/mission")

/mission
  → Looks up scenario: getScenario("UK", "Restaurant") → Oliver the Waiter
  → Picks a random mission text
  → User clicks "Start Conversation"
  → fetch POST /api/sessions → gets back { sessionId: "cuid..." }
  → startSession(sessionId, "Oliver", "🧑‍🍳", missionText, voiceId)
  → router.push("/conversation")

/conversation
  → User types a message → Enter key → sendMessage()
  → fetch POST /api/sessions/:id/turns { message }
  → Gets back { characterReply, pointsEarned, characterMood, achievements }
  → addPoints(n), setMood("😊"), addBadge("The Polite Customer")
  → Score HUD updates live, mood emoji animates
  → When missionComplete: show "See Results" button
  → User clicks → router.push("/results")

/results
  → fetch GET /api/sessions/:id/results
  → Shows score, confidence %, badges, teacher brief
  → "Play Again" → resetSession() → router.push("/location")
```

---

## 4. SessionContext — The Memory of the Student's Journey

`context/SessionContext.tsx` is a **React Context** — it's a global store that any component inside `<SessionProvider>` can read and write. It holds everything that needs to survive page navigation:

```typescript
// What's stored:
{
  studentCode: "S001",          // entered at login
  studentId: "cuid...",         // returned by API after lookup
  sessionId: "cuid...",         // returned by POST /api/sessions
  location: "United Kingdom",
  locationCode: "UK",
  locationFlag: "🇬🇧",
  situation: "Restaurant",
  character: "Oliver",
  characterEmoji: "🧑‍🍳",
  missionText: "Order some sushi...",
  voiceId: "",                  // ElevenLabs voice ID
  score: 0,                     // increments with each turn
  mood: "😊",                   // changes based on AI response
  badges: [],                   // grows during conversation
}

// Actions available in any component:
const { session, setStudentInfo, setLocation, setSituation,
        startSession, addPoints, setMood, addBadge, resetSession } = useSession();
```

**Why Context instead of URL params?**
Because this data is needed across 6 screens. Putting it in the URL would make ugly, long URLs. Putting it in a database would require more API calls. Context lives in memory for the duration of the browser session — perfect for a linear flow.

**Where does it live?**
`app/(student)/layout.tsx` wraps all student pages in `<SessionProvider>`. The teacher pages are NOT inside this layout, so teachers don't have this context.

---

## 5. API Routes — How the Backend Works

Every file named `route.ts` inside `app/api/` is a backend endpoint. Next.js handles routing automatically.

```typescript
// Pattern for every API route:
export async function POST(req: NextRequest) {
  // 1. Parse and validate the request body
  // 2. Call a repository function (hits the DB)
  // 3. Maybe call an external API (Claude, Whisper, ElevenLabs)
  // 4. Return JSON
}
```

**The most important route: POST /api/sessions/:id/turns**

This is the core of the app. Every time a student sends a message:

```
Student types → POST /api/sessions/:id/turns { message: "I'd like sushi" }
  │
  ├── MOCK_AI=true?
  │     YES → getMockAiResponse(message) — instant fake reply
  │     NO  → fetch(CLAUDE_PROXY_URL, { message, session_context })
  │                └── if that fails → fall back to mock
  │
  ├── Save to DB:
  │     createTurn({ studentMessage, characterReply, analyticsJson, ... })
  │     addScoreToSession(sessionId, pointsEarned)
  │     incrementTurnCount(sessionId)
  │     createBadge(sessionId, badge) for each new achievement
  │
  └── Return to frontend:
        { characterReply, pointsEarned, characterMood, achievements, missionComplete }
```

The `analyticsJson` field stores the full Claude analytics as a JSON string in SQLite (SQLite doesn't have a native JSON type, so we store it as text and parse it when needed).

---

## 6. Database — 4 Tables

```
Student          Session              SessionTurn          SessionBadge
────────         ──────────           ───────────          ────────────
id (cuid)   ◄── studentId            id (cuid)            id (cuid)
studentCode      id (cuid)       ◄── sessionId       ◄── sessionId
createdAt        location             turnNumber           badgeName
                 situation            studentMessage       awardedAt
                 character            characterReply
                 missionText          analyticsJson  ← full Claude JSON as text
                 startedAt            pointsEarned
                 completedAt          characterMood
                 totalScore           wordCount
                 finalConfidence      confidenceScore
                 turnCount            struggleDetected
                                      createdAt
```

**Why cuid() for IDs?** CUIDs are URL-safe, sortable, and don't expose row count the way sequential integers do.

**Prisma v7 quirk:** The `schema.prisma` does NOT have a `url` in the datasource. That moved to `prisma.config.ts`. The runtime client (used in actual requests) is created in `lib/db/index.ts` with the SQLite adapter directly.

---

## 7. Prisma — Two Separate Things

This confused us during setup. There are TWO ways Prisma runs:

**1. Prisma CLI** (commands you run in terminal: `prisma migrate`, `prisma generate`)
- Reads config from `prisma.config.ts`
- Uses `datasource.url` to know where the database file is
- Creates/updates the `dev.db` file

**2. Prisma Client** (runs inside your Next.js server during requests)
- Created in `lib/db/index.ts`
- Uses the `PrismaBetterSqlite3` adapter (a factory that opens the SQLite file)
- Singleton pattern: one client instance shared across all requests

```typescript
// lib/db/index.ts — the singleton pattern explained:
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
//                      ↑ globalThis persists across hot reloads in dev
//                        without this, you'd create a new DB connection
//                        every time you save a file

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
//  ↑ in dev: cache it on globalThis
//  in production: each server worker gets exactly one instance anyway
```

---

## 8. Scenarios Config — Static Data

`lib/config/scenarios.ts` holds all the content. No database needed for this — it never changes at runtime.

```typescript
SCENARIOS  ← array of 4 scenario objects (UK-Restaurant, US-School, etc.)
LOCATIONS  ← array of 3 locations used in the location picker
SITUATIONS ← array of 3 situations used in the situation picker

getScenario("UK", "Restaurant")  → returns the UK-Restaurant scenario object
getRandomMission(scenario)       → picks one of the 3 mission texts randomly
```

The situation picker filters `SCENARIOS` to only show situations that exist for the chosen location. So if only UK-Restaurant and ZA-Restaurant exist, picking US only shows Restaurant, not School or University — unless that scenario is defined.

---

## 9. Styling — Tailwind v4

This project uses **Tailwind CSS v4**, which is very different from v3:

- **No `tailwind.config.ts`** — all config is in `app/globals.css`
- **Design tokens are CSS variables** defined in `@theme inline { }`:

```css
/* app/globals.css */
@theme inline {
  --color-brand: #6C3FC4;        /* use as: text-brand, bg-brand */
  --color-bg-dark: #0F0A1E;      /* use as: bg-bg-dark */
  --color-text-primary: #F1F5F9; /* use as: text-text-primary */
  --radius-card: 16px;           /* use as: rounded-[var(--radius-card)] */
}
```

**Dark vs Light theme:**
- Student pages: manually set dark colors (`bg-bg-dark`, `text-text-primary`)
- Teacher pages: manually set light colors (`bg-teacher-bg`, `text-teacher-text`)
- We don't use Tailwind's `dark:` prefix — themes are set per route group via class names

---

## 10. Component Library

Three shared components in `components/ui/`:

**`<ScreenShell>`** — The dark background wrapper for every student page
```tsx
<ScreenShell className="gap-8">
  {/* children */}
</ScreenShell>
// Renders: <main className="min-h-screen flex flex-col bg-bg-dark pt-safe px-5 pb-8 ...">
```

**`<PrimaryButton>`** — The big purple button
```tsx
<PrimaryButton onClick={fn} loading={isSaving} variant="brand" size="lg">
  Continue →
</PrimaryButton>
// variant: "brand" (purple) | "teal" | "ghost" (transparent)
// size: "lg" (full-width, 56px tall) | "md" (auto-width, 44px tall)
// loading: shows spinner + disables
```

**`<Card>`** — A dark box, optionally interactive/selected
```tsx
<Card interactive selected={isChosen} onClick={fn}>
  {/* content */}
</Card>
// interactive: hover glow effect
// selected: brand-colored border + ring
```

---

## 11. Mock AI Mode

When `MOCK_AI=true` in `.env.local`, no external AI calls are made:

```
Request hits POST /api/sessions/:id/turns
  → checks process.env.MOCK_AI === "true"
  → calls getMockAiResponse(message) from lib/mock/mockAiResponse.ts
  → cycles through 5 preset replies
  → awards +20 points if message contains "please/thank you"
  → sets missionComplete: true after 5 turns
```

The STT endpoint (`/api/stt`) also checks `MOCK_AI` and returns a hardcoded transcript. The TTS endpoint returns `{ audioUrl: null, mock: true }` — the frontend receives this and simply doesn't play audio.

**To switch to real AI:** set `MOCK_AI=false` and fill in `CLAUDE_PROXY_URL`, `WHISPER_API_URL`, `ELEVENLABS_API_KEY` in `.env.local`.

---

## 12. The Full Request Lifecycle (One Turn)

```
1. User presses Enter in the conversation input

2. sendMessage() in conversation/page.tsx runs:
   - Appends student message to local `messages` state (instant UI update)
   - Sets setSending(true) (shows typing indicator)
   - fetch("POST /api/sessions/abc123/turns", { message: "I'd like sushi" })

3. Request hits app/api/sessions/[id]/turns/route.ts:
   - Validates request body with zod
   - Loads session from DB: getSessionById("abc123")
   - Checks MOCK_AI → getMockAiResponse(message)
   - Persists turn to DB: createTurn(...)
   - Updates session score: addScoreToSession(...)
   - Saves any badges: createBadge(...)
   - Returns: { characterReply, pointsEarned, characterMood, achievements, missionComplete }

4. Back in the browser:
   - Appends character reply to messages state
   - addPoints(20) → SessionContext.score goes from 0 → 20
   - setMood("😊") → updates mood emoji in header
   - Shows +20 floating score animation (CSS keyframe: score-float)
   - If missionComplete: shows "See Results" button
```

---

## 13. Key Files Quick Reference

| File | What it does |
|------|-------------|
| `app/globals.css` | Single source of truth for all colors, spacing, animations |
| `types/index.ts` | All TypeScript interfaces — if you want to know what shape data takes, look here |
| `context/SessionContext.tsx` | The student's in-memory state machine across the 6-screen flow |
| `lib/config/scenarios.ts` | All locations, characters, missions — edit here to add new content |
| `lib/mock/mockAiResponse.ts` | Fake AI for dev — safe to modify for testing different responses |
| `prisma/schema.prisma` | Source of truth for DB tables — after editing, run `npx prisma migrate dev` |
| `lib/db/index.ts` | Prisma singleton — don't touch unless you change DB providers |
| `.env.local` | Secret keys and feature flags (MOCK_AI, CLAUDE_PROXY_URL, etc.) |

---

## 14. How to Add a New Scenario (e.g. ZA → School)

1. Add the scenario to `SCENARIOS` array in `lib/config/scenarios.ts`
2. Give it a unique `id`, matching `locationCode: "ZA"`, `situation: "School"`
3. Add at least 3 `missionTexts`
4. The situation picker will automatically include "School" when ZA is selected

No database changes needed — scenarios are static config.

---

## 15. Environment Variables

| Variable | Used in | Purpose |
|----------|---------|---------|
| `MOCK_AI` | API routes | `true` = use fake responses, no external calls |
| `DATABASE_URL` | `lib/db/index.ts`, `prisma.config.ts` | Path to SQLite file (default: `file:./dev.db`) |
| `CLAUDE_PROXY_URL` | `/api/sessions/[id]/turns` | Partner team's Claude endpoint |
| `CLAUDE_API_KEY` | `/api/sessions/[id]/turns` | Auth for Claude proxy |
| `WHISPER_API_URL` | `/api/stt` | Whisper speech-to-text endpoint |
| `WHISPER_API_KEY` | `/api/stt` | Auth for Whisper |
| `ELEVENLABS_API_KEY` | `/api/tts` | Auth for ElevenLabs text-to-speech |
| `ELEVENLABS_DEFAULT_VOICE` | `/api/tts` | Default voice ID if not specified |

All secrets live server-side only. The browser never sees API keys.
`NEXT_PUBLIC_` prefix would expose a variable to the browser — we deliberately avoid it for anything sensitive.
