-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "missionText" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "finalConfidence" REAL,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Session_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionTurn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "studentMessage" TEXT NOT NULL,
    "characterReply" TEXT NOT NULL,
    "analyticsJson" TEXT NOT NULL,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "characterMood" TEXT NOT NULL DEFAULT '😊',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" REAL NOT NULL DEFAULT 0,
    "struggleDetected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionTurn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionBadge_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Session_studentId_idx" ON "Session"("studentId");

-- CreateIndex
CREATE INDEX "Session_completedAt_idx" ON "Session"("completedAt");

-- CreateIndex
CREATE INDEX "SessionTurn_sessionId_turnNumber_idx" ON "SessionTurn"("sessionId", "turnNumber");

-- CreateIndex
CREATE INDEX "SessionBadge_sessionId_idx" ON "SessionBadge"("sessionId");
