"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { sampleTeams } from "@/lib/data";
import { clearSubmissions, JourneySubmission, readSubmissions } from "@/lib/storage";
import { Card, Pill } from "@/components/ui";

type TeamRow = {
  name: string;
  members: number;
  first: string;
  second: string;
  summary: string;
  status: string;
  roundTitle?: string;
  createdAt?: string;
  source: "demo" | "actual";
};

function Donut({ a = 58, center = "12팀" }: { a?: number; center?: string }) {
  return (
    <div className="relative h-40 w-40 rounded-full" style={{ background: `conic-gradient(#2563eb 0 ${a}%, #14b8a6 ${a}% 100%)` }}>
      <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-xs text-slate-400">전체</span>
        <b className="text-xl text-slate-900">{center}</b>
      </div>
    </div>
  );
}

function DashboardCard({ title, children, action, onAction }: { title: string; children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        {action && <button onClick={onAction} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50">{action}</button>}
      </div>
      {children}
    </Card>
  );
}

function toTeamRows(submissions: JourneySubmission[]): TeamRow[] {
  const latestByTeamRound = submissions.reduce<Record<string, JourneySubmission>>((acc, item) => {
    const key = `${item.teamName}-${item.roundId}`;
    if (!acc[key] || new Date(item.createdAt).getTime() > new Date(acc[key].createdAt).getTime()) acc[key] = item;
    return acc;
  }, {});

  return Object.values(latestByTeamRound)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((s) => ({
      name: s.teamName,
      members: 1,
      first: s.firstChoice,
      second: s.secondChoice,
      summary: s.finalLines.filter(Boolean).join(" / ") || s.aiFeedbackSummary,
      status: "제출 완료",
      roundTitle: `${s.roundId}. ${s.roundTitle}`,
      createdAt: s.createdAt,
      source: "actual" as const,
    }));
}

function countBy<T extends string>(rows: TeamRow[], key: (row: TeamRow) => T) {
  return rows.reduce<Record<T, number>>((acc, row) => {
    const k = key(row);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

export default function InstructorDashboard() {
  const [submissions, setSubmissions] = useState<JourneySubmission[]>([]);

  const refresh = () => setSubmissions(readSubmissions());

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const actualRows = useMemo(() => toTeamRows(submissions), [submissions]);
  const rows: TeamRow[] = actualRows.length > 0
    ? actualRows
    : sampleTeams.map((t) => ({ ...t, source: "demo" as const }));

  const firstCounts = countBy(rows, (r) => r.first as "A" | "B");
  const secondCounts = countBy(rows, (r) => r.second as "유지" | "보완" | "전환");
  const total = rows.length || 1;
  const aRatio = Math.round(((firstCounts.A || 0) / total) * 100);
  const completed = rows.filter((r) => r.status === "제출 완료").length;
  const isActualMode = actualRows.length > 0;

  const handleClear = () => {
    clearSubmissions();
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-slate-100 bg-white p-6">
        <div className="mb-10">
          <div className="text-lg font-black text-blue-600">업무관리</div>
          <div className="text-2xl font-black text-slate-900">Decision Journey</div>
        </div>
        <nav className="space-y-2">
          {["대시보드", "세션 관리", "진행 현황", "1차 판단 분포", "2차 판단 변화", "팀별 응답", "AI 피드백", "최종 결정문", "로그북", "리포트"].map((n, i) => (
            <button key={n} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ${i === 0 ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}>
              <span>{["⌂", "▣", "◷", "◔", "↔", "👥", "AI", "▤", "☑", "▥"][i]}</span>{n}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Card className="mb-3 p-4">
            <div className="text-xs font-bold text-slate-400">데이터 모드</div>
            <div className="mt-1 text-lg font-black">{isActualMode ? "실제 입력값" : "샘플 데이터"}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">v0.2는 같은 브라우저의 임시 저장소를 읽습니다.</p>
          </Card>
          <button onClick={refresh} className="mb-2 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200">새로고침</button>
          {isActualMode && <button onClick={handleClear} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">임시 데이터 삭제</button>}
        </div>
      </aside>

      <main className="ml-72 p-8">
        <header className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">강사용 대시보드</h1>
            <p className="mt-2 text-slate-500">세션 진행 현황과 팀의 판단을 한눈에 확인하세요.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-10 w-10 rounded-full bg-white shadow-sm">🔔</button>
            <button className="h-10 w-10 rounded-full bg-white shadow-sm">?</button>
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-teal-100" /><b className="text-sm">김지훈 강사</b></div>
          </div>
        </header>

        {isActualMode && (
          <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-4 text-sm font-bold text-emerald-800">
            교육생 화면에서 저장한 실제 입력값 {actualRows.length}건이 대시보드에 반영되었습니다. 다음 단계에서는 Google Sheets를 연결해 다른 기기에서도 실시간으로 공유합니다.
          </div>
        )}

        <Card className="mb-7 p-6">
          <div className="grid grid-cols-[1.7fr_1fr_1fr_1.5fr_1.2fr] items-center gap-6">
            <div>
              <div className="text-xs font-bold text-slate-400">현재 세션</div>
              <div className="mt-2 text-xl font-black">업무관리 딜레마 시뮬레이션</div>
              <div className="mt-2 text-sm text-slate-500">2026.05.26 10:00 ~ 12:00</div>
            </div>
            <div className="border-l border-slate-100 pl-6"><div className="text-xs font-bold text-slate-400">라운드</div><div className="mt-2 text-2xl font-black">{isActualMode ? "실제" : "2"} <span className="text-base text-slate-400">/ 10</span></div><Pill>진행 중</Pill></div>
            <div className="border-l border-slate-100 pl-6"><div className="text-xs font-bold text-slate-400">참여 팀 수</div><div className="mt-2 text-2xl font-black">{total} <span className="text-base text-slate-400">팀</span></div></div>
            <div className="border-l border-slate-100 pl-6"><div className="text-xs font-bold text-slate-400">제출 현황</div><div className="mt-2 text-lg font-black">완료 {completed}/{total}</div></div>
            <div className="space-y-2"><button className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white">🔒 라운드 닫기</button><button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-blue-700">강의실 링크 복사</button></div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          <DashboardCard title="1차 선택 분포 (A / B)">
            <div className="flex items-center justify-around">
              <Donut a={aRatio} center={`${total}팀`} />
              <div className="space-y-4 text-sm">
                <div><span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-600" />A 선택 <b className="ml-4 text-slate-900">{firstCounts.A || 0}팀</b></div>
                <div><span className="mr-2 inline-block h-3 w-3 rounded-full bg-teal-500" />B 선택 <b className="ml-4 text-slate-900">{firstCounts.B || 0}팀</b></div>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard title="2차 판단 변화" action="상세 보기">
            <div className="mb-5 grid grid-cols-3 overflow-hidden rounded-full text-center text-sm font-bold text-white"><div className="bg-blue-600 py-2">유지 {secondCounts["유지"] || 0}팀</div><div className="bg-teal-500 py-2">보완 {secondCounts["보완"] || 0}팀</div><div className="bg-violet-500 py-2">전환 {secondCounts["전환"] || 0}팀</div></div>
            <div className="flex h-32 items-end gap-5 border-b border-slate-100 px-2">{[secondCounts["유지"] || 0, secondCounts["보완"] || 0, secondCounts["전환"] || 0].map((v, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><b className="text-sm">{v}</b><div className={`${i === 0 ? "bg-blue-400" : i === 1 ? "bg-teal-400" : "bg-violet-400"} w-full rounded-t-xl`} style={{ height: `${Math.max(8, v * 24)}px` }} /><span className="text-xs text-slate-400">{["유지", "보완", "전환"][i]}</span></div>)}</div>
          </DashboardCard>
          <DashboardCard title="최종 결정문 제출 현황" action="전체 보기">
            <div className="flex items-center justify-around"><Donut a={Math.round((completed / total) * 100)} center={`${total}팀`} /><div className="space-y-4 text-sm"><div><span className="mr-2 inline-block h-3 w-3 rounded-full bg-teal-500" />제출 완료 <b className="ml-4">{completed}팀</b></div><div><span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-400" />작성 중 <b className="ml-4">{Math.max(0, total - completed)}팀</b></div><div><span className="mr-2 inline-block h-3 w-3 rounded-full bg-slate-300" />미제출 <b className="ml-4">0팀</b></div></div></div>
          </DashboardCard>
        </div>

        <div className="mt-6 grid grid-cols-[1.7fr_1fr] gap-6">
          <DashboardCard title="팀별 진행 현황" action={isActualMode ? "실제 입력값" : "샘플 데이터"}>
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="py-3">팀명</th><th>라운드</th><th>1차</th><th>2차</th><th>최종 결정문 요약</th><th>상태</th></tr></thead>
              <tbody>{rows.map((t, idx) => <tr key={`${t.name}-${idx}`} className="border-b border-slate-50"><td className="py-4 font-bold">{t.name} <span className="ml-2 text-xs text-slate-400">{t.source === "actual" ? "실제" : `👥 ${t.members}`}</span></td><td className="max-w-[160px] truncate text-xs text-slate-500">{t.roundTitle || "샘플"}</td><td><Pill tone={t.first === "A" ? "blue" : "teal"}>{t.first}</Pill></td><td><Pill tone={t.second === "전환" ? "purple" : t.second === "보완" ? "teal" : "blue"}>{t.second}</Pill></td><td className="max-w-[320px] truncate text-slate-500">{t.summary}</td><td><Pill tone={t.status === "제출 완료" ? "green" : t.status === "작성 중" ? "orange" : "gray"}>{t.status}</Pill></td></tr>)}</tbody>
            </table>
          </DashboardCard>
          <div className="space-y-6">
            <DashboardCard title="강사용 토론 질문" action="질문 편집"><div className="space-y-4 text-sm leading-6">{["1차 판단에서 A/B를 선택한 팀은 각각 어떤 기준을 지키려 했나요?", "돌발상황 이후 유지·보완·전환으로 갈린 결정적 변수는 무엇인가요?", "최종 결정문에서 실행 가능성을 높이는 조건은 무엇인가요?"].map((q, i) => <div key={q} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span><span className="font-semibold text-slate-700">{q}</span></div>)}</div></DashboardCard>
            <DashboardCard title="주요 판단 패턴" action="자세히 보기"><div className="grid gap-3 text-sm"><div className="rounded-2xl bg-blue-50 p-4"><b className="text-blue-700">A 선택 키워드</b><p className="mt-1 text-slate-600">일정, 속도, 보고, 실행</p></div><div className="rounded-2xl bg-teal-50 p-4"><b className="text-teal-700">B 선택 키워드</b><p className="mt-1 text-slate-600">품질, 신뢰, 장기, 고객</p></div><div className="rounded-2xl bg-violet-50 p-4"><b className="text-violet-700">전환 이유</b><p className="mt-1 text-slate-600">과부하, 리스크, 상사 기대</p></div></div></DashboardCard>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1.7fr_1fr] gap-6">
          <DashboardCard title="최근 AI 질문/피드백" action="AI 활동 로그 보기"><div className="grid grid-cols-2 gap-4 text-sm">{submissions.slice(-2).length > 0 ? submissions.slice(-2).map((s) => <div key={s.id} className="rounded-2xl border border-slate-100 p-4"><Pill tone="purple">{s.teamName}</Pill><p className="mt-3 leading-6 text-slate-600">{s.aiQuestion || "AI 질문이 입력되지 않았습니다."}</p><div className="mt-3 text-xs text-slate-400">라운드 {s.roundId} · 실제 입력</div></div>) : <><div className="rounded-2xl border border-slate-100 p-4"><Pill>A</Pill><p className="mt-3 leading-6 text-slate-600">“일정 준수를 우선했을 때 놓칠 수 있는 품질 리스크는 무엇인가요?”</p><div className="mt-3 text-xs text-slate-400">AI 질문 · 샘플</div></div><div className="rounded-2xl border border-slate-100 p-4"><Pill tone="teal">B</Pill><p className="mt-3 leading-6 text-slate-600">AI는 상사의 보고 기대와 팀원의 과부하를 함께 점검하라고 제안했습니다.</p><div className="mt-3 text-xs text-slate-400">AI 피드백 · 샘플</div></div></>}</div></DashboardCard>
          <DashboardCard title="빠른 액션"><div className="grid gap-3">{["팀 공지 보내기", "라운드 시간 연장", "팀별 피드백 작성"].map((a) => <button key={a} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50">{a}</button>)}</div></DashboardCard>
        </div>
      </main>
    </div>
  );
}
