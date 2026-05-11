import LearnerAppSheetsTeamSelect from "@/components/LearnerAppSheetsTeamSelect";

export default function Page() {
  return (
    <main className="pilot-page flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 p-6">
      <style>{`
        .pilot-page .flex-1.overflow-y-auto div:has(> img[alt="차바이오그룹 CI"]) {
          display: none !important;
        }
        .pilot-page > div > div:last-child {
          display: none !important;
        }
      `}</style>
      <LearnerAppSheetsTeamSelect />
    </main>
  );
}
