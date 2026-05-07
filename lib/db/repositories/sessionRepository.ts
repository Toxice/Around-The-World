import prisma from "@/lib/db";

export async function createSession(data: {
  studentId: string;
  location: string;
  situation: string;
  character: string;
  missionText: string;
}) {
  return prisma.session.create({ data });
}

export async function getSessionById(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: { turns: { orderBy: { turnNumber: "asc" } }, badges: true },
  });
}

export async function completeSession(
  id: string,
  totalScore: number,
  finalConfidence: number,
  turnCount: number
) {
  return prisma.session.update({
    where: { id },
    data: { completedAt: new Date(), totalScore, finalConfidence, turnCount },
  });
}

export async function incrementTurnCount(id: string) {
  return prisma.session.update({
    where: { id },
    data: { turnCount: { increment: 1 } },
  });
}

export async function addScoreToSession(id: string, points: number) {
  return prisma.session.update({
    where: { id },
    data: { totalScore: { increment: points } },
  });
}
