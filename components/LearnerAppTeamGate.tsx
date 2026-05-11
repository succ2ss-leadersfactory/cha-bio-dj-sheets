"use client";

import { useEffect, useState } from "react";
import LearnerAppPilotV5 from "@/components/LearnerAppPilotV5";

const TEAM_STORAGE_KEY = "cha-bio-pilot-team-name";
const TEAMS = ["1팀", "2팀", "3팀", "4팀", "5팀", "6팀"];

function TeamSelectScreen({ onEnter }: { onEnter: (team: string) => void }) {
  const [selectedTeam, setSelectedTeam] = useState("");

  return (
    <div className="mx-auto flex min-h-[860px] w-full max-w-[430px] flex-col overflow-hidden rounded-[2.4rem] border border-slate-200 bg-slate-50 shadow-2xl">
      <div className="bg-white/95 px-5 pb-4 pt-5 backdrop-blur">
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md">
          <img src="/cha-biogroup-ci.png" alt="차바이오그룹 CI" className="h-8 w-auto shrink-0 object-contain" />
          <div className="min-w-0 leading-tight">
            <div className="text-[11px] font-extrabold text-slate-800">차바이오그룹 리더십 교육용</div>
            <div className="text-[10px] font-semibold text-slate-500">CHA Bio Group Decision Journey</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6">
            <h1 className="text-4xl font-black leading-tight text-slate-900">Decision<br />Journey</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">팀명을 선택하시면 바로 시작할 수 있습니다.</p>
            <div className="relative mt-5 h-48 overflow-hidden rounded-[2rem] shadow-inner">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/lighthouse-hero.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/45 to-blue-50/10" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/85 to-transparent" />
              <div className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">판단 여정</div>
              <div className="absolute left-5 top-14 max-w-[190px] rounded-2xl bg-white/80 px-4 py-3 text-sm font-extrabold leading-6 text-slate-700 shadow-sm">선택의 길을 따라<br />판단 기준을 세웁니다</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-center">
              <div className="text-lg font-black text-slate-900">팀을 선택해주세요</div>
              <p className="mt-2 text-xs leading-5 text-slate-500">참여할 팀을 선택해주세요.</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {TEAMS.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setSelectedTeam(team)}
                  className={`rounded-2xl border px-4 py-4 text-base font-extrabold shadow-sm transition ${selectedTeam === team ? "border-blue-500 bg-blue-600 text-white shadow-blue-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
                >
                  {team}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700">
              선택된 팀: {selectedTeam || "없음"}
            </div>

            {!selectedTeam && (
              <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-center text-xs font-bold leading-5 text-orange-600">팀을 선택해주세요.</p>
            )}

            <button
              type="button"
              disabled={!selectedTeam}
              onClick={() => selectedTeam && onEnter(selectedTeam)}
              className={`mt-4 w-full rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg transition ${selectedTeam ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700" : "bg-slate-300 shadow-none"}`}
            >
              선택한 팀으로 입장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function hideDuplicateContentBranding() {
  const roots = document.querySelectorAll(".team-gate-entered .flex-1 img[alt='차바이오그룹 CI']");
  roots.forEach((image) => {
    const wrapper = image.parentElement;
    if (wrapper instanceof HTMLElement) wrapper.style.display = "none";
  });
}

export default function LearnerAppTeamGate() {
  const [entered, setEntered] = useState(false);
  const [teamKey, setTeamKey] = useState("");

  useEffect(() => {
    const savedTeam = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (savedTeam) {
      setTeamKey(savedTeam);
      setEntered(true);
    }
  }, []);

  useEffect(() => {
    if (!entered) return;
    hideDuplicateContentBranding();

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (button?.textContent?.includes("팀명 변경")) {
        event.preventDefault();
        event.stopPropagation();
        window.localStorage.removeItem(TEAM_STORAGE_KEY);
        setTeamKey("");
        setEntered(false);
      }
    };

    document.addEventListener("click", handleClick, true);
    const observer = new MutationObserver(() => hideDuplicateContentBranding());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, [entered]);

  const handleEnter = (team: string) => {
    window.localStorage.setItem(TEAM_STORAGE_KEY, team);
    setTeamKey(team);
    setEntered(true);
  };

  if (!entered) return <TeamSelectScreen onEnter={handleEnter} />;
  return (
    <div className="team-gate-entered">
      <LearnerAppPilotV5 key={teamKey} />
    </div>
  );
}
