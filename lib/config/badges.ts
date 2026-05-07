export const BADGE_DESCRIPTIONS: Record<string, string> = {
  "The Polite Customer":  "Used 'please' or 'thank you' 3+ times",
  "Fast Responder":       "Answered with high confidence (0.9+)",
  "Vocabulary Master":    "Used complex vocabulary from the scenario",
  "Sentence Builder":     "Formed a complete, grammatically correct sentence",
  "First Words":          "Completed your very first conversation turn",
  "Order Up":             "Successfully placed an order",
  "Question Asker":       "Asked the character a question",
  "Detail Oriented":      "Included specific details in your response",
  "Culture Explorer":     "Used location-specific language",
  "Comeback Kid":         "Recovered after a hint and improved your response",
};

export function getBadgeDescription(badgeName: string): string {
  return BADGE_DESCRIPTIONS[badgeName] ?? "Achievement unlocked!";
}
