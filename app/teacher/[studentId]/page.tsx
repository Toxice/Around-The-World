export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: "#F8FAFC" }}>
      <p style={{ color: "#64748B" }}>Student detail: {params.studentId} — STORY-019</p>
    </main>
  );
}
