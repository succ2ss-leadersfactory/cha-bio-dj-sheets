"use client";

import { useEffect, useRef, useState } from "react";
import LearnerAppTeamGate from "@/components/LearnerAppTeamGate";

const SUBMISSIONS_STORAGE_KEY = "wm-decision-journey-submissions-v02";

type SaveStatus = "idle" | "saving" | "saved" | "failed" | "not_configured";

type StoredSubmission = {
  sessionCode?: string;
  teamName?: string;
  roundId?: number;
  roundTitle?: string;
  firstChoice?: string;
  firstReason?: string;
  concern?: string;
  secondChoice?: string;
  secondReason?: string;
  aiAnswerSummary?: string;
  aiFeedbackSummary?: string;
  aiReviewNote?: string;
  finalLines?: string[];
  createdAt?: string;
};

function toPayload(submission: StoredSubmission) {
  return {
    timestamp: submission.createdAt || new Date().toISOString(),
    sessionCode: submission.sessionCode || "",
    teamName: submission.teamName || "",
    roundId: submission.roundId || "",
    roundTitle: submission.roundTitle || "",
    firstChoice: submission.firstChoice || "",
    firstReason: submission.firstReason || "",
    concern: submission.concern || "",
    secondChoice: submission.secondChoice || "",
    secondReason: submission.secondReason || "",
    aiAnswerSummary: submission.aiAnswerSummary || submission.aiFeedbackSummary || "",
    aiReviewNote: submission.aiReviewNote || "",
    finalDecision: Array.isArray(submission.finalLines) ? submission.finalLines.filter(Boolean).join("\n") : "",
  };
}

async function sendToGoogleSheet(submission: StoredSubmission) {
  const url = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!url) throw new Error("NEXT_PUBLIC_GOOGLE_SCRIPT_URL is not configured");

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(toPayload(submission)),
  });
}

export default function LearnerAppSheetsSync() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const sentSignatures = useRef<Set<string>>(new Set());

  useEffect(() => {
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    window.localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);

      if (key !== SUBMISSIONS_STORAGE_KEY) return;

      try {
        const parsed = JSON.parse(value) as StoredSubmission[];
        const latest = parsed[parsed.length - 1];
        if (!latest) return;

        const signature = `${latest.sessionCode || ""}|${latest.teamName || ""}|${latest.roundId || ""}|${latest.createdAt || ""}`;
        if (sentSignatures.current.has(signature)) return;
        sentSignatures.current.add(signature);

        setSaveStatus("saving");
        sendToGoogleSheet(latest)
          .then(() => {
            setSaveStatus("saved");
            window.setTimeout(() => setSaveStatus("idle"), 2500);
          })
          .catch((error) => {
            setSaveStatus(error.message.includes("NEXT_PUBLIC") ? "not_configured" : "failed");
            window.setTimeout(() => setSaveStatus("idle"), 5000);
          });
      } catch {
        setSaveStatus("failed");
        window.setTimeout(() => setSaveStatus("idle"), 5000);
      }
    };

    return () => {
      window.localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <div className="relative">
      <LearnerAppTeamGate />
      {saveStatus !== "idle" && (
        <div className={`fixed bottom-5 left-1/2 z-[9999] w-[min(360px,calc(100%-32px))] -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-xl ${saveStatus === "saved" ? "bg-emerald-600 text-white" : saveStatus === "saving" ? "bg-slate-900 text-white" : "bg-red-600 text-white"}`}>
          {saveStatus === "saving" && "Google Sheet에 저장 중입니다..."}
          {saveStatus === "saved" && "Google Sheet 저장 요청이 완료되었습니다."}
          {saveStatus === "failed" && "Google Sheet 저장에 실패했습니다. 기록은 이 기기에 임시 저장되었습니다."}
          {saveStatus === "not_configured" && "Google Sheet URL이 아직 설정되지 않았습니다."}
        </div>
      )}
    </div>
  );
}
