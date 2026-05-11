"use client";

import { useEffect, useMemo, useState } from "react";

type ResponseRow = {
  timestamp?: string;
  sessionCode?: string;
  teamName?: string;
  roundId?: string | number;
  roundTitle?: string;
  firstChoice?: string;
  firstReason?: string;
  concern?: string;
  secondChoice?: string;
  secondReason?: string;
  aiAnswerSummary?: string;
  aiReviewNote?: string;
  finalDecision?: string;
};

type ApiResult = {
  ok?: boolean;
  rows?: ResponseRow[];
  error?: string;
  raw?: string;
};

const TEAM_ORDER = ["1팀", "2팀", "3팀", "4팀", "5팀", "6팀"];
const ROUND_ORDER = [1, 2, 3, 4];

function normalizeRoundId(value: string | number | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="text-sm font-bold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export default function InstructorPage() {
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/responses", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((error) => {
        if (mounted) setData({ ok: false, error: String(error) });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const rows = useMemo(() => {
    const source = Array.isArray(data?.rows) ? data.rows : [];
    return [...source].sort((a, b) => {
      const teamDiff = TEAM_ORDER.indexOf(a.teamName || "") - TEAM_ORDER.indexOf(b.teamName || "");
      if (teamDiff !== 0) return teamDiff;
      return normalizeRoundId(a.roundId) - normalizeRoundId(b.roundId);
    });
  }, [data]);

  const completedTeams = new Set(rows.map((row) => row.teamName).filter(Boolean));
  const roundCounts = ROUND_ORDER.map((roundId) => rows.filter((row) => normalizeRoundId(row.roundId) === roundId).length);
  const maxRoundCount = Math.max(...roundCounts, 0);
  const maxRoundIndex = maxRoundCount > 0 ? roundCounts.indexOf(maxRoundCount) + 1 : "-";

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-start justify-between gap-6">
          <div>
            <div className="text-sm font-extrabold text-blue-700">CHA Bio Group Decision Journey</div>
            <h1 className="mt-2 text-4xl font-black tracking-tight">강사용 간이 대시보드</h1>
            <p className="mt-2 text-slate-500">Google Sheet에 저장된 팀별 제출 현황을 확인합니다.</p>
          </div>
          <button
            onClick={() => setRefreshKey((key) => key + 1)}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
          >
            새로고침
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="총 제출 건수" value={rows.length} sub="responses 기준" />
          <StatCard label="참여 팀 수" value={`${completedTeams.size}/6`} sub="1팀~6팀" />
          <StatCard label="가장 많은 제출 라운드" value={maxRoundIndex === "-" ? "-" : `R${maxRoundIndex}`} sub={maxRoundCount > 0 ? `최대 ${maxRoundCount}건` : "아직 없음"} />
          <StatCard label="데이터 상태" value={loading ? "로딩" : data?.ok === false ? "확인 필요" : "정상"} />
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">라운드별 제출 현황</h2>
            <div className="text-sm text-slate-400">1~4라운드 기준</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {ROUND_ORDER.map((roundId, index) => (
              <div key={roundId} className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="text-sm font-bold text-slate-500">라운드 {roundId}</div>
                <div className="mt-2 text-2xl font-black text-blue-700">{roundCounts[index]}건</div>
              </div>
            ))}
          </div>
        </section>

        {data?.ok === false && (
          <section className="rounded-3xl border border-orange-100 bg-orange-50 p-5 text-orange-800">
            <div className="font-black">데이터 조회 설정이 필요합니다</div>
            <p className="mt-2 text-sm leading-6">
              {data.error || "Google Apps Script가 JSON 데이터를 반환하지 않았습니다."}
            </p>
            {data.raw && <pre className="mt-3 max-h-40 overflow-auto rounded-2xl bg-white/70 p-3 text-xs">{data.raw}</pre>}
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-black">팀별 제출 결과</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">제출 시간</th>
                  <th className="px-4 py-3">팀</th>
                  <th className="px-4 py-3">라운드</th>
                  <th className="px-4 py-3">1차</th>
                  <th className="px-4 py-3">2차</th>
                  <th className="px-4 py-3">최종 결정문</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={6}>불러오는 중입니다...</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={6}>아직 제출된 데이터가 없습니다.</td></tr>
                )}
                {rows.map((row, index) => (
                  <tr key={`${row.teamName}-${row.roundId}-${row.timestamp}-${index}`} className="border-t border-slate-50">
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">{formatTime(row.timestamp)}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-bold">{row.teamName || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-4">R{row.roundId} · {row.roundTitle}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.firstChoice || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-4">{row.secondChoice || "-"}</td>
                    <td className="max-w-xl whitespace-pre-wrap px-4 py-4 text-slate-600">{row.finalDecision || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
