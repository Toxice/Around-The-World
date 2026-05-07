import prisma from "@/lib/db";

export async function createBadge(sessionId: string, badgeName: string) {
  return prisma.sessionBadge.create({ data: { sessionId, badgeName } });
}

export async function getBadgesBySession(sessionId: string) {
  return prisma.sessionBadge.findMany({ where: { sessionId } });
}
