import prisma from "@/lib/db";

export async function findStudentByCode(studentCode: string) {
  return prisma.student.findUnique({ where: { studentCode } });
}

export async function getAllStudentsWithSummary() {
  const students = await prisma.student.findMany({
    include: {
      sessions: {
        where: { completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        select: {
          id: true,
          completedAt: true,
          finalConfidence: true,
          totalScore: true,
          turnCount: true,
          location: true,
          situation: true,
        },
      },
    },
    orderBy: { studentCode: "asc" },
  });

  return students.map((s) => {
    const sessions = s.sessions;
    const totalSessions = sessions.length;
    const totalScore = sessions.reduce((sum, sess) => sum + sess.totalScore, 0);
    const totalTurns = sessions.reduce((sum, sess) => sum + sess.turnCount, 0);
    const avgConfidence =
      totalSessions > 0
        ? sessions.reduce((sum, sess) => sum + (sess.finalConfidence ?? 0), 0) / totalSessions
        : 0;

    return {
      id: s.id,
      studentCode: s.studentCode,
      totalSessions,
      totalScore,
      totalTurns,
      avgConfidence,
      lastSessionDate: sessions[0]?.completedAt?.toISOString() ?? null,
      lastSessionTopic: sessions[0] ? `${sessions[0].location} · ${sessions[0].situation}` : null,
      lastSessionConfidence: sessions[0]?.finalConfidence ?? null,
      confidenceHistory: sessions.map((sess) => sess.finalConfidence ?? 0).reverse(),
    };
  });
}

export async function getStudentDetail(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      sessions: {
        where: { completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        include: { turns: true, badges: true },
      },
    },
  });
}
