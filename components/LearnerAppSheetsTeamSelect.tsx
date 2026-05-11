"use client";

import { useEffect } from "react";
import LearnerAppPilotV5 from "@/components/LearnerAppPilotV5";

const TEAM_OPTIONS = ["1팀", "2팀", "3팀", "4팀", "5팀", "6팀"];

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(input, "value")?.set;
  const prototype = Object.getPrototypeOf(input);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(input, value);
  else if (valueSetter) valueSetter.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function updateIntroCopy(root: Element) {
  root.querySelectorAll("p").forEach((p) => {
    if (p.textContent?.includes("이번 주 1차수 파일럿 운영용입니다")) {
      p.textContent = "팀명을 선택하시면 바로 시작할 수 있습니다.";
    }
    if (p.textContent?.includes("팀명을 입력해주세요")) {
      p.textContent = "팀명을 선택해주세요.";
    }
  });
}

function decorateTeamEntry() {
  const root = document.querySelector(".team-select-wrapper");
  if (!root) return;
  updateIntroCopy(root);

  const input = root.querySelector<HTMLInputElement>('input[placeholder="예) 1팀 / 새벽등대팀"]');
  if (!input) return;

  const label = input.closest("label") as HTMLElement | null;
  const card = label?.parentElement as HTMLElement | null;
  if (!label || !card) return;

  label.style.display = "none";

  let selector = card.querySelector<HTMLElement>('[data-team-selector="true"]');
  if (!selector) {
    selector = document.createElement("div");
    selector.dataset.teamSelector = "true";
    selector.className = "space-y-3";
    selector.innerHTML = `
      <div class="text-center">
        <div class="text-sm font-extrabold text-slate-800">팀을 선택해주세요</div>
        <div class="mt-1 text-xs text-slate-500">차바이오그룹 1차수 파일럿은 1팀~6팀으로 운영됩니다.</div>
      </div>
      <div class="grid grid-cols-2 gap-3" data-team-button-wrap="true"></div>
      <div class="rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700" data-selected-team="true">선택된 팀: 없음</div>
    `;
    card.insertBefore(selector, label);

    const buttonWrap = selector.querySelector<HTMLElement>('[data-team-button-wrap="true"]');
    TEAM_OPTIONS.forEach((team) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.teamValue = team;
      button.className = "rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-extrabold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50";
      button.textContent = team;
      button.addEventListener("click", () => {
        setNativeInputValue(input, team);
        selector?.querySelectorAll<HTMLButtonElement>("button[data-team-value]").forEach((item) => {
          item.className = "rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-extrabold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50";
        });
        button.className = "rounded-2xl border border-blue-500 bg-blue-600 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-100";
        const selected = selector?.querySelector<HTMLElement>('[data-selected-team="true"]');
        if (selected) selected.textContent = `선택된 팀: ${team}`;
      });
      buttonWrap?.appendChild(button);
    });
  }

  const enterButton = Array.from(card.querySelectorAll("button")).find((button) => button.textContent?.includes("팀명으로 입장하기"));
  if (enterButton) enterButton.textContent = "선택한 팀으로 입장하기";
}

export default function LearnerAppSheetsTeamSelect() {
  useEffect(() => {
    decorateTeamEntry();
    const observer = new MutationObserver(() => decorateTeamEntry());
    const root = document.querySelector(".team-select-wrapper");
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="team-select-wrapper">
      <LearnerAppPilotV5 />
    </div>
  );
}
