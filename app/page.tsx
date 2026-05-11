import LearnerAppSheetsSync from "@/components/LearnerAppSheetsSync";

export default function Page() {
  return (
    <main className="pilot-page flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 p-6">
      <style>{`
        .pilot-page .team-gate-entered > div > div:last-child {
          display: none !important;
        }
      `}</style>
      <LearnerAppSheetsSync />
    </main>
  );
}
