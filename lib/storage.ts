export type AiReviewAnswer = "Yes" | "No" | "O" | "X" | "모르겠음";
export type SecondChoice = "유지" | "보완" | "전환" | "기존 유지" | "일부 수정" | "판단 변경";

export type AiReviewResult = {
  question: string;
  answer: AiReviewAnswer;
};

export type SecondQuestionAnswer = {
  question: string;
  answer: string;
};

export type JourneySubmission = {
  id: string;
  sessionCode: string;
  teamName: string;
  roundId: number;
  roundTitle: string;
  firstChoice: "A" | "B";
  firstReason: string;
  concern: string;
  secondChoice: SecondChoice;
  secondReason: string;
  secondQuestionAnswers?: SecondQuestionAnswer[];
  aiQuestion: string;
  generatedPrompt?: string;
  aiAnswerSummary?: string;
  aiFeedbackSummary: string;
  aiReviewResults?: AiReviewResult[];
  aiReviewNote?: string;
  finalLines: string[];
  aftermath: string;
  doctorKimFeedback?: string;
  createdAt: string;
};

const STORAGE_KEY = "wm-decision-journey-submissions-v02";

export function readSubmissions(): JourneySubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSubmission(submission: JourneySubmission) {
  if (typeof window === "undefined") return;
  const current = readSubmissions();
  const withoutSameRound = current.filter(
    (item) => !(item.teamName === submission.teamName && item.roundId === submission.roundId && item.sessionCode === submission.sessionCode)
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...withoutSameRound, submission]));
}

export function clearSubmissions() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
