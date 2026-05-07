import prisma from "@/lib/db";

export async function createTurn(data: {
  sessionId: string;
  turnNumber: number;
  studentMessage: string;
  characterReply: string;
  analyticsJson: object;
  pointsEarned: number;
  characterMood: string;
  wordCount: number;
  confidenceScore: number;
  struggleDetected: boolean;
}) {
  return prisma.sessionTurn.create({ data });
}

export async function getTurnsBySession(sessionId: string) {
  return prisma.sessionTurn.findMany({
    where: { sessionId },
    orderBy: { turnNumber: "asc" },
  });
}
