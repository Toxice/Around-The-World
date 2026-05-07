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
        take: 5,
        select: { id: true, completedAt: true, finalConfidence: true, totalScore: true },
      },
    },
    orderBy: { studentCode: "asc" },
  });

  return students.map((s) => ({
    id: s.id,
    studentCode: s.studentCode,
    lastSessionDate: s.sessions[0]?.completedAt?.toISOString() ?? null,
    lastSessionConfidence: s.sessions[0]?.finalConfidence ?? null,
    confidenceHistory: s.sessions
      .map((sess) => sess.finalConfidence ?? 0)
      .reverse(),
  }));
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
