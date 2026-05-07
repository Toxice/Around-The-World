import prisma from "@/lib/db";

export async function findStudentByCode(studentCode: string) {
  return prisma.student.findUnique({ where: { studentCode } });
}

function avg(nums: number[]): number {
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function avgFromTurns(turns: unknown[], key: string): number {
  const vals = (turns as Record<string, unknown>[])
    .map((t) => {
      const j = t.analyticsJson as Record<string, unknown>;
      return typeof j[key] === "number" ? (j[key] as number) : null;
    })
    .filter((v): v is number => v !== null);
  return avg(vals);
}

export async function getAllStudentsWithSummary() {
  const students = await prisma.student.findMany({
    include: {
      sessions: {
        where: { completedAt: { not: null } },
        orderBy: { completedAt: "asc" },
        select: {
          id: true,
          completedAt: true,
          finalConfidence: true,
          totalScore: true,
          turnCount: true,
          location: true,
          situation: true,
          turns: { select: { analyticsJson: true } },
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

    // Per-session metrics (oldest → newest for trend graphs)
    const confidenceHistory = sessions.map((sess) => sess.finalConfidence ?? 0);
    const techMasteryHistory = sessions.map((sess) => avgFromTurns(sess.turns, "tech_mastery_score"));
    const efficiencyHistory = sessions.map((sess) => avgFromTurns(sess.turns, "session_efficiency"));

    return {
      id: s.id,
      studentCode: s.studentCode,
      totalSessions,
      totalScore,
      totalTurns,
      avgConfidence: avg(confidenceHistory),
      avgTechMastery: avg(techMasteryHistory.filter((v) => v > 0)),
      avgEfficiency: avg(efficiencyHistory.filter((v) => v > 0)),
      lastSessionDate: sessions.at(-1)?.completedAt?.toISOString() ?? null,
      lastSessionTopic: sessions.at(-1)
        ? `${sessions.at(-1)!.location} · ${sessions.at(-1)!.situation}`
        : null,
      confidenceHistory,
      techMasteryHistory,
      efficiencyHistory,
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
