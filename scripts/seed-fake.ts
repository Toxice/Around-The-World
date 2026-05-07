import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

// ── Fake data pools ───────────────────────────────────────────────────────────

const STUDENT_CODES = [
  "S001", "S002", "S003", "S004", "S005",
  "S006", "S007", "S008", "S009", "S010",
];

const SCENARIOS = [
  {
    location: "United Kingdom", situation: "Restaurant",
    character: "Oliver", missionText: "Order sushi and ask the waiter for a recommendation.",
  },
  {
    location: "United States", situation: "School",
    character: "Sarah", missionText: "Ask your teacher about the homework assignment.",
  },
  {
    location: "United States", situation: "University",
    character: "Prof. Williams", missionText: "Ask about the requirements for an upcoming exam.",
  },
  {
    location: "South Africa", situation: "Restaurant",
    character: "Thabo", missionText: "Make a reservation and ask about the daily specials.",
  },
  {
    location: "United States", situation: "School",
    character: "Ms. Rivera", missionText: "Talk to your teacher about your 3D printing project.",
  },
];

const STUDENT_MESSAGES = [
  "I would like to order the sushi please.",
  "Can you recommend something for me?",
  "What is the best dish here?",
  "I need help with my homework.",
  "When is the assignment due?",
  "Can you explain this concept again?",
  "I want to print a small robot.",
  "I choose blue filament.",
  "Do we need supports for this model?",
  "I think we need infill for the base.",
  "Can I use PLA material?",
  "What is the nozzle temperature?",
  "I would like reserve table for two.",
  "What is special today?",
  "Can you help me understand the exam?",
  "I missed class yesterday, what did I miss?",
];

const CHARACTER_REPLIES = [
  "Excellent choice! The sushi here is absolutely wonderful. Would you like to start with some edamame?",
  "Of course! I'd highly recommend our tempura set — it's very popular today.",
  "Great question! Let me check the homework sheet for you. The assignment is due on Friday.",
  "No problem at all! We covered chapter five — the main topic was photosynthesis.",
  "Perfect! For the exam, you'll need to know chapters three through seven. It's worth 40% of your grade.",
  "Wonderful choice! Blue PLA is a great material for beginners — very easy to work with.",
  "Yes, this model will definitely need supports under the arms. Good thinking!",
  "For this design, I'd suggest around 20% infill — it gives a nice balance of strength and speed.",
  "The nozzle temperature for PLA is usually around 200°C. Let me set that up for you.",
  "Great reservation! We have a lovely table by the window available. What time would you like?",
  "Today's special is our braai platter — it comes with biltong and a side salad.",
];

const GRAMMAR_ERRORS_POOL = [
  "Missing article before noun",
  "Incorrect verb tense (past vs present)",
  "Subject-verb agreement error",
  "Preposition misuse",
  "Run-on sentence",
  "Omitted auxiliary verb",
  "Incorrect plural form",
];

const VOCAB_POOL = [
  "reservation", "recommendation", "filament", "infill", "supports",
  "assignment", "syllabus", "nozzle", "extruder", "slicing",
  "calibration", "warping", "tempura", "biltong", "edamame",
];

const MISSED_POOL = [
  "Could you recommend something?",
  "I would like to make a reservation.",
  "Could you please explain that again?",
  "What material would you suggest?",
  "How long will it take to print?",
];

const BADGES = [
  "Polite Speaker", "Vocabulary Star", "Quick Learner",
  "Tech Expert", "Confident Communicator", "Grammar Pro",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  console.log("Upserting students…");
  const students = await Promise.all(
    STUDENT_CODES.map((code) =>
      prisma.student.upsert({
        where: { studentCode: code },
        update: {},
        create: { studentCode: code },
      })
    )
  );

  console.log("Creating sessions and turns…");
  let sessionCount = 0;
  let turnCount = 0;

  for (const student of students) {
    // Each student gets 3–8 sessions spread over the past 30 days
    const numSessions = randInt(3, 8);

    for (let s = 0; s < numSessions; s++) {
      const scenario = rand(SCENARIOS);
      const startedAt = daysAgo(randInt(0, 30));
      const numTurns = randInt(3, 8);

      // Build turns first to aggregate scores
      const turns = [];
      let totalScore = 0;
      let confidenceSum = 0;

      for (let t = 0; t < numTurns; t++) {
        const confidence = randFloat(0.3, 0.95);
        const points = randInt(5, 30);
        const wordCount = randInt(5, 25);
        const struggleDetected = confidence < 0.45;
        totalScore += points;
        confidenceSum += confidence;

        const analyticsJson = {
          grammar_points_observed: sample(["past tense", "question formation", "modal verbs", "present continuous", "conditionals"], randInt(1, 3)),
          grammar_errors_frequent: struggleDetected ? sample(GRAMMAR_ERRORS_POOL, randInt(1, 2)) : [],
          target_vocabulary_used: sample(VOCAB_POOL, randInt(1, 3)),
          missed_opportunities: sample(MISSED_POOL, randInt(0, 2)),
          confidence_score: confidence,
          tech_mastery_score: scenario.character === "Ms. Rivera" ? randFloat(0.3, 0.95) : null,
          engagement_score: randFloat(0.4, 1.0),
          session_efficiency: randFloat(0.4, 1.0),
          word_count: wordCount,
          struggle_detected: struggleDetected,
          teacher_brief: `Student ${struggleDetected ? "struggled with" : "demonstrated"} ${rand(["grammar", "vocabulary", "fluency", "technical terms"])} this turn.`,
          future_recommendation: rand([
            "Practice past simple tense with everyday scenarios.",
            "Focus on polite request phrases.",
            "Review technical vocabulary for the next session.",
            "Work on sentence complexity and connectors.",
          ]),
          recasting_note: struggleDetected ? rand(["Corrected verb tense via recast", "Modeled correct article usage"]) : null,
          hobby_connection_used: struggleDetected && t > 1 ? rand(["gaming", "sports", "art"]) : null,
          quest_status: scenario.character === "Ms. Rivera" ? {
            object_chosen: t >= 1,
            color_chosen: t >= 2,
            tech_question_addressed: t >= 3,
          } : null,
        };

        turns.push({
          turnNumber: t + 1,
          studentMessage: rand(STUDENT_MESSAGES),
          characterReply: rand(CHARACTER_REPLIES),
          analyticsJson,
          pointsEarned: points,
          characterMood: rand(["😊", "😄", "🤔", "👍", "😮"]),
          wordCount,
          confidenceScore: confidence,
          struggleDetected,
        });
      }

      const avgConfidence = confidenceSum / numTurns;
      const completedAt = new Date(startedAt.getTime() + numTurns * 45_000);

      // Decide if session gets a badge (30% chance)
      const badge = Math.random() < 0.3 ? rand(BADGES) : null;

      const session = await prisma.session.create({
        data: {
          studentId: student.id,
          location: scenario.location,
          situation: scenario.situation,
          character: scenario.character,
          missionText: scenario.missionText,
          startedAt,
          completedAt,
          totalScore,
          finalConfidence: avgConfidence,
          turnCount: numTurns,
          finalTeacherBrief: `Overall session: student showed ${avgConfidence > 0.6 ? "good" : "developing"} fluency across ${numTurns} turns.`,
          turns: {
            create: turns,
          },
          ...(badge ? { badges: { create: [{ badgeName: badge }] } } : {}),
        },
      });

      sessionCount++;
      turnCount += numTurns;
      process.stdout.write(`  ${student.studentCode} session ${s + 1}/${numSessions}\r`);
    }
  }

  await prisma.$disconnect();
  console.log(`\nDone! Created ${sessionCount} sessions and ${turnCount} turns across ${students.length} students.`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
