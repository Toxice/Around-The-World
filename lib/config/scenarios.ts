import type { Scenario } from "@/types";

export const SCENARIOS: Scenario[] = [
  {
    id: "uk-restaurant",
    location: "United Kingdom",
    locationCode: "UK",
    locationFlag: "🇬🇧",
    situation: "Restaurant",
    situationIcon: "🍽️",
    character: "Oliver",
    characterRole: "British Waiter",
    characterEmoji: "🧑‍🍳",
    missionTexts: [
      "Order sushi and ask the waiter for a recommendation.",
      "Order a meal and find out what desserts are available.",
      "Ask about the menu and place an order for two people.",
    ],
    vocabularyHints: "sushi, reservation, recommendation, tempura, edamame, menu, dessert, waiter, bill, please, thank you",
    voiceEnvKey: "ELEVENLABS_VOICE_UK_WAITER",
  },
  {
    id: "us-school",
    location: "United States",
    locationCode: "US",
    locationFlag: "🇺🇸",
    situation: "School",
    situationIcon: "🏫",
    character: "Sarah",
    characterRole: "US Teacher",
    characterEmoji: "👩‍🏫",
    missionTexts: [
      "Ask your teacher about the homework assignment.",
      "Explain why you were absent and ask what you missed.",
      "Ask for help understanding a concept from class.",
    ],
    vocabularyHints: "homework, assignment, absent, grade, schedule, classroom, subject, teacher, principal, please",
    voiceEnvKey: "ELEVENLABS_VOICE_US_TEACHER",
  },
  {
    id: "us-university",
    location: "United States",
    locationCode: "US",
    locationFlag: "🇺🇸",
    situation: "University",
    situationIcon: "🎓",
    character: "Prof. Williams",
    characterRole: "University Professor",
    characterEmoji: "👨‍🎓",
    missionTexts: [
      "Ask about the requirements for an upcoming exam.",
      "Request an extension on your assignment deadline.",
      "Ask about office hours and get advice on your research paper.",
    ],
    vocabularyHints: "exam, deadline, extension, syllabus, thesis, campus, dormitory, lecture, assignment, please",
    voiceEnvKey: "ELEVENLABS_VOICE_US_PROFESSOR",
  },
  {
    id: "za-restaurant",
    location: "South Africa",
    locationCode: "ZA",
    locationFlag: "🇿🇦",
    situation: "Restaurant",
    situationIcon: "🍽️",
    character: "Thabo",
    characterRole: "SA Restaurant Host",
    characterEmoji: "🧑‍🍳",
    missionTexts: [
      "Make a reservation and ask about the daily specials.",
      "Order a traditional South African dish and ask about its ingredients.",
    ],
    vocabularyHints: "braai, biltong, reservation, special, menu, dessert, waiter, bill, please, thank you",
    voiceEnvKey: "ELEVENLABS_VOICE_ZA_HOST",
  },
];

export const LOCATIONS = [
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", tagline: "Classic British conversation" },
  { code: "US", name: "United States",  flag: "🇺🇸", tagline: "American casual English" },
  { code: "ZA", name: "South Africa",   flag: "🇿🇦", tagline: "Diverse, vibrant English" },
] as const;

export const SITUATIONS = [
  { id: "Restaurant", icon: "🍽️", title: "Restaurant", description: "Order food, chat with staff" },
  { id: "School",     icon: "🏫", title: "School",     description: "Talk to teachers & classmates" },
  { id: "University", icon: "🎓", title: "University", description: "Navigate campus & student life" },
] as const;

export function getScenario(locationCode: string, situation: string): Scenario | undefined {
  return SCENARIOS.find(
    (s) => s.locationCode === locationCode && s.situation === situation
  );
}

export function getRandomMission(scenario: Scenario): string {
  const idx = Math.floor(Math.random() * scenario.missionTexts.length);
  return scenario.missionTexts[idx];
}
