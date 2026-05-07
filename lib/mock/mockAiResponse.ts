import { ClaudeResponse } from "@/types";

const MOCK_REPLIES = [
  "Welcome! What can I get for you today?",
  "That sounds like a great choice! Would you like anything else?",
  "Excellent selection! Can I get you anything to drink?",
  "Of course! I'll put that order in right away.",
  "Is there anything else I can help you with?",
];

const MOCK_MOODS = ["😊", "😄", "🤩", "😐", "😊"];

let callCount = 0;

export function getMockAiResponse(studentMessage: string): ClaudeResponse {
  const idx = callCount % MOCK_REPLIES.length;
  callCount++;

  const wordCount = studentMessage.trim().split(/\s+/).length;
  const hasPoliteWord = /please|thank you|thanks|excuse me/i.test(studentMessage);
  const pointsEarned = hasPoliteWord ? 20 : 10;

  return {
    character_reply: MOCK_REPLIES[idx],
    teacher_analytics: {
      grammar_points_observed: ["present tense", "polite requests"],
      grammar_errors_frequent: idx === 2 ? ["missing article 'the'"] : [],
      target_vocabulary_used: ["order", "please"],
      missed_opportunities: idx === 1 ? ["could say 'I would like' instead of 'I want'"] : [],
      confidence_score: 0.6 + idx * 0.05,
      word_count: wordCount,
      struggle_detected: wordCount < 3,
      teacher_brief: "Student is engaging well with the scenario. Good use of polite language.",
    },
    gamification: {
      points_earned: pointsEarned,
      character_mood: MOCK_MOODS[idx],
      achievements: idx === 1 ? ["The Polite Customer"] : [],
    },
    mission_complete: callCount >= 5,
  };
}
