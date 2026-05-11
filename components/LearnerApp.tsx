"use client";

import React, { useState } from "react";
import { rounds } from "@/lib/data";
import { saveSubmission, type AiReviewAnswer } from "@/lib/storage";
import { Card, OptionCard, Pill, PrimaryButton, TextArea, TextInput } from "@/components/ui";

const steps = ["입장", "상황", "1차", "돌발", "2차", "AI", "결정"];

const reviewItems = [
  "우리 조직의 맥락이 반영되었는가?",
  "팀원의 감정과 체면을 고려했는가?",
  "상사와 타부서의 기대를 놓치지 않았는가?",
  "실행 비용을 과소평가하지 않았는가?",
  "실제 팀장이 말할 수 있는 문장인가?",
];

const finalGuides = [
  {
    label: "나는 이 상황을",
    example: "예시: 나는 이 상황을 단순 일정 문제가 아니라 우선순위와 자원 배분의 문제로 본다.",
  },
  {
    label: "나의 최종 선택은",
    example: "예시: 나의 최종 선택은 기존 일정을 유지하되 품질 점검과 업무 재배분 조건을 추가하는 보완안이다.",
  },
  {
    label: "이 선택의 가장 큰 비용은",
    example: "예시: 이 선택의 비용은 일부 팀원에게 단기 부담이 생기고 상사에게 추가 설명이 필요하다는 점이다.",
  },
  {
    label: "그래서 붙일 실행 조건은",
    example: "예시: 그래서 오늘 안에 핵심 업무 범위와 품질 기준을 다시 합의하겠다.",
  },
  {
    label: "내일 바로 할 첫 행동은",
    example: "예시: 내일 오전 10시에 핵심 담당자와 15분 점검 미팅을 열겠다.",
  },
];

function ProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${i <= activeIndex ? "bg-blue-600" : "bg-slate-200"}`} />
          {i < steps.length - 1 && <div className={`h-px w-5 ${i < activeIndex ? "bg-blue-300" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function MobileShell({ children, step }: { children: React.ReactNode; step: number }) {
  return (
    <div className="mx-auto flex min-h-[820px] w-full max-w-[420px] flex-col overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-50 shadow-2xl">
      <div className="flex items-center justify-between bg-white px-5 pb-2 pt-5">
        <div className="text-xs font-semibold text-slate-500">9:41</div>
        <div className="text-sm font-extrabold text-slate-800">업무관리 딜레마</div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-teal-100" />
      </div>
      <div className="bg-white px-4"><ProgressDots activeIndex={step} /></div>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      <div className="grid grid-cols-6 gap-1 border-t border-slate-100 bg-white px-3 py-3 text-center text-[10px] text-slate-400">
        {["입장", "상황", "1차", "돌발", "2차", "결정"].map((s, i) => (
          <div key={s} className={i === step ? "font-bold text-blue-600" : ""}>●<br />{s}</div>
        ))}
      </div>
    </div>
  );
}

function RoundNavigation({
  onPrev,
  onHome,
  onNext,
  nextLabel = "다음",
  prevDisabled = false,
  nextDisabled = false,
}: {
  onPrev: () => void;
  onHome: () => void;
  onNext: () => void;
  nextLabel?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-2 rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${prevDisabled ? "bg-slate-100 text-slate-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
      >
        ← 이전
      </button>
      <button type="button" onClick={onHome} className="rounded-2xl bg-blue-50 px-3 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100">
        홈
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={`rounded-2xl px-3 py-3 text-sm font-extrabold transition ${nextDisabled ? "bg-slate-100 text-slate-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        {nextLabel} →
      </button>
    </div>
  );
}

function RequiredMessage({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-orange-50 px-4 py-3 text-center text-xs font-bold leading-5 text-orange-600">{children}</p>;
}

function InsightCard({ title, children, tone = "blue" }: { title: string; children: React.ReactNode; tone?: "blue" | "teal" | "purple" | "orange" | "green" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
    purple: "bg-violet-50 text-violet-700",
    orange: "bg-orange-50 text-orange-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <Card className="p-4">
      <div className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${tones[tone]}`}>{title}</div>
      <div className="text-sm leading-7 text-slate-650">{children}</div>
    </Card>
  );
}

export default function LearnerApp() {
  const [screen, setScreen] = useState(0);
  const [team, setTeam] = useState("");
  const [code, setCode] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [firstChoice, setFirstChoice] = useState<"A" | "B" | null>(null);
  const [secondChoice, setSecondChoice] = useState<"유지" | "보완" | "전환" | null>(null);
  const [reason, setReason] = useState("");
  const [concern, setConcern] = useState("");
  const [secondReason, setSecondReason] = useState("");
  const [aiAnswerSummary, setAiAnswerSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [reviewAnswers, setReviewAnswers] = useState<(AiReviewAnswer | "")[]>(reviewItems.map(() => ""));
  const [reviewNote, setReviewNote] = useState("");
  const [finalLines, setFinalLines] = useState(["", "", "", "", ""]);
  const round = rounds[roundIndex];

  const isFilled = (value: string) => value.trim().length > 0;
  const firstChoiceText = firstChoice === "A" ? round.optionA : firstChoice === "B" ? round.optionB : "아직 선택하지 않았습니다.";
  const canEnter = isFilled(code) && isFilled(team);
  const canCompleteFirst = Boolean(firstChoice) && isFilled(reason) && isFilled(concern);
  const canCompleteSecond = Boolean(secondChoice) && isFilled(secondReason);
  const canCompleteAiQuestion = isFilled(aiAnswerSummary);
  const allReviewAnswered = reviewAnswers.every(Boolean);
  const hasReviewConcern = reviewAnswers.some((answer) => answer === "No" || answer === "모르겠음");
  const canCompleteReview = allReviewAnswered && (!hasReviewConcern || isFilled(reviewNote));
  const canCompleteFinal = finalLines.every(isFilled);

  const generatedPrompt = `나는 팀장 역할로 업무관리 딜레마 상황을 판단하고 있습니다.\n\n[상황]\n${round.story}\n\n[나의 1차 판단]\n${firstChoice || "A/B 중 선택"}. ${firstChoiceText}\n\n[1차 판단 이유]\n${reason || "작성한 선택 이유"}\n\n[우려한 점]\n${concern || "작성한 우려 사항"}\n\n[돌발상황]\n1. ${round.surprises[0]}\n2. ${round.surprises[1]}\n3. ${round.surprises[2]}\n\n[나의 2차 판단]\n${secondChoice || "유지/보완/전환 중 선택"}\n\n[2차 판단 이유]\n${secondReason || "작성한 2차 판단 이유"}\n\n[요청]\n1. 이 판단의 강점과 약점을 구분해 주세요.\n2. 제가 놓친 이해관계자 관점이 있다면 알려주세요.\n3. 유지/보완/전환 중 현재 상황에서 어떤 선택이 더 타당한지 조건부로 비교해 주세요.\n4. 이 선택을 팀원에게 설명할 때 사용할 수 있는 첫 문장 3개를 제안해 주세요.\n5. 단, 정답처럼 말하지 말고 각 선택의 비용과 실행 조건을 함께 제시해 주세요.`;

  const doctorKimFeedback = `김박사의 피드백\n\n이번 선택에서 중요한 것은 무엇을 골랐는가보다 그 선택의 비용을 얼마나 알고 있었는가입니다. 당신은 1차로 ${firstChoice || "A/B"}를 선택했고, 돌발상황 이후 ${secondChoice || "유지/보완/전환"} 방향으로 판단을 조정했습니다.\n\n이 판단이 현장에서 힘을 가지려면 선택의 이유만이 아니라 감수할 비용과 실행 조건을 함께 말해야 합니다. 다음 회의에서는 “무엇을 유지하고, 무엇을 조정하며, 그 비용을 누구에게 어떻게 설명할 것인가?”를 먼저 확인해보십시오.`;

  const resetRoundInputs = () => {
    setFirstChoice(null);
    setSecondChoice(null);
    setReason("");
    setConcern("");
    setSecondReason("");
    setAiAnswerSummary("");
    setCopied(false);
    setReviewAnswers(reviewItems.map(() => ""));
    setReviewNote("");
    setFinalLines(["", "", "", "", ""]);
  };

  const startRound = (index: number) => {
    setRoundIndex(index);
    resetRoundInputs();
    setScreen(3);
  };

  const next = () => setScreen((s) => Math.min(s + 1, 15));
  const prev = () => setScreen((s) => Math.max(s - 1, 2));
  const goHome = () => setScreen(2);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveAndNext = () => {
    if (!firstChoice || !secondChoice || !canCompleteFinal) return;
    saveSubmission({
      id: `${code.trim()}-${team.trim()}-${round.id}`,
      sessionCode: code.trim(),
      teamName: team.trim(),
      roundId: round.id,
      roundTitle: round.title,
      firstChoice,
      firstReason: reason.trim(),
      concern: concern.trim(),
      secondChoice,
      secondReason: secondReason.trim(),
      aiQuestion: generatedPrompt,
      generatedPrompt,
      aiAnswerSummary: aiAnswerSummary.trim(),
      aiFeedbackSummary: aiAnswerSummary.trim(),
      aiReviewResults: reviewItems.map((question, index) => ({ question, answer: (reviewAnswers[index] || "모르겠음") as AiReviewAnswer })),
      aiReviewNote: reviewNote.trim(),
      finalLines: finalLines.map((line) => line.trim()),
      aftermath: round.aftermath,
      doctorKimFeedback,
      createdAt: new Date().toISOString(),
    });
    next();
  };

  const getNavNextLabel = () => {
    if (screen === 12) return "저장";
    if (screen === 14) return "요약";
    return "다음";
  };
  const getNavNextDisabled = () => {
    if (screen === 4) return !canCompleteFirst;
    if (screen === 8) return !canCompleteSecond;
    if (screen === 9) return !canCompleteAiQuestion;
    if (screen === 11) return !canCompleteReview;
    if (screen === 12) return !canCompleteFinal;
    return false;
  };
  const handleNavNext = () => {
    if (getNavNextDisabled()) return;
    if (screen === 12) {
      handleSaveAndNext();
      return;
    }
    next();
  };
  const step = screen < 2 ? 0 : screen < 4 ? 1 : screen === 4 ? 2 : screen < 8 ? 3 : screen === 8 ? 4 : screen < 12 ? 5 : 6;

  return (
    <MobileShell step={step}>
      {screen >= 3 && screen <= 14 && (
        <RoundNavigation
          onPrev={prev}
          onHome={goHome}
          onNext={handleNavNext}
          nextLabel={getNavNextLabel()}
          prevDisabled={screen === 3}
          nextDisabled={getNavNextDisabled()}
        />
      )}

      {screen === 0 && (
        <div className="flex h-full flex-col justify-between gap-8">
          <div>
            <div className="mb-8 mt-3">
              <div className="text-lg font-extrabold text-blue-600">업무관리</div>
              <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-slate-900">Decision<br />Journey</h1>
              <p className="mt-4 text-sm leading-7 text-slate-500">실제 업무 속 딜레마를 경험하고<br />더 나은 리더십 결정을 만들어갑니다.</p>
            </div>
            <div className="mb-6 rounded-3xl bg-gradient-to-b from-blue-50 to-teal-50 p-5">
              <div className="relative h-48 rounded-3xl bg-gradient-to-b from-sky-100 to-white">
                <div className="absolute bottom-5 left-8 h-24 w-20 rounded-t-full bg-white shadow-lg" />
                <div className="absolute bottom-16 left-14 h-12 w-8 rounded-t-full bg-blue-600" />
                <div className="absolute bottom-6 right-4 h-16 w-40 rounded-full bg-blue-100" />
                <div className="absolute bottom-2 left-0 h-10 w-full rounded-t-[60%] bg-teal-100" />
              </div>
            </div>
            <Card className="space-y-4 p-5">
              <TextInput label="세션 코드" placeholder="예) ABC123" value={code} onChange={setCode} />
              <TextInput label="팀명 / 이름" placeholder="예) 새벽등대팀 / 홍길동" value={team} onChange={setTeam} />
              {!canEnter && <RequiredMessage>세션 코드와 팀명/이름을 모두 입력해주세요.</RequiredMessage>}
              <PrimaryButton onClick={() => canEnter && setScreen(1)} disabled={!canEnter}>여정 시작하기</PrimaryButton>
            </Card>
          </div>
          <p className="text-center text-xs text-slate-400">참여 방법이 궁금하신가요?</p>
        </div>
      )}

      {screen === 1 && (
        <div className="space-y-5">
          <Pill>과정 소개</Pill>
          <h2 className="text-3xl font-black leading-tight text-slate-900">오늘의 목표는<br />정답 찾기가 아닙니다</h2>
          <p className="text-sm leading-7 text-slate-500">처음 판단하고, 돌발상황을 만난 뒤, 다시 판단을 조정합니다. 마지막에는 AI 답변을 비판적으로 검토하고 나만의 결정문을 만듭니다.</p>
          <div className="grid gap-3">
            {["1차 판단", "돌발상황 3가지", "2차 판단", "AI 모범 프롬프트", "김박사의 피드백"].map((item, i) => (
              <Card key={item} className="flex items-center gap-4 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-sm font-extrabold text-blue-700">{i + 1}</div>
                <div className="font-bold text-slate-700">{item}</div>
              </Card>
            ))}
          </div>
          <PrimaryButton onClick={() => setScreen(2)}>라운드 선택하기</PrimaryButton>
        </div>
      )}

      {screen === 2 && (
        <div className="space-y-5">
          <div>
            <Pill>10라운드 여정</Pill>
            <h2 className="mt-3 text-2xl font-black text-slate-900">업무관리 딜레마</h2>
            <p className="mt-2 text-sm text-slate-500">라운드를 선택하면 판단 여정이 시작됩니다.</p>
          </div>
          <div className="space-y-3">
            {rounds.map((r, i) => (
              <button key={r.id} onClick={() => startRound(i)} className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200">
                <div className="flex items-center justify-between">
                  <Pill tone={i % 3 === 0 ? "blue" : i % 3 === 1 ? "teal" : "purple"}>라운드 {r.id}</Pill>
                  <span className="text-xs text-slate-400">시작하기 →</span>
                </div>
                <h3 className="mt-3 text-lg font-extrabold text-slate-800">{r.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{r.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 3 && (
        <div className="space-y-5">
          <div className="text-center"><Pill>라운드 {round.id}</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">상황 카드</h2>
          <div className="rounded-3xl bg-gradient-to-b from-blue-50 to-white p-5">
            <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-inner"><div className="h-20 w-20 rounded-3xl bg-blue-100" /></div>
            <h3 className="text-lg font-extrabold text-slate-800">{round.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{round.story}</p>
          </div>
          <Card className="p-5 text-center"><div className="text-xs font-bold text-blue-600">질문</div><div className="mt-2 text-lg font-extrabold leading-8 text-slate-900">{round.question}</div></Card>
          <PrimaryButton onClick={next}>1차 판단하기</PrimaryButton>
        </div>
      )}

      {screen === 4 && (
        <div className="space-y-4">
          <div className="text-center"><Pill>1차 판단</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">어떤 선택을<br />하시겠습니까?</h2>
          <OptionCard label="A" title={round.optionA} selected={firstChoice === "A"} onClick={() => setFirstChoice("A")} />
          <OptionCard label="B" title={round.optionB} selected={firstChoice === "B"} onClick={() => setFirstChoice("B")} tone="teal" />
          <TextArea label="선택 이유" placeholder="이 선택을 하는 이유를 적어주세요." value={reason} onChange={setReason} />
          <TextArea label="우려되는 점" placeholder="이 선택의 위험이나 우려되는 점은 무엇인가요?" value={concern} onChange={setConcern} rows={2} />
          {!canCompleteFirst && <RequiredMessage>A/B 선택, 선택 이유, 우려되는 점을 모두 입력해야 다음으로 이동할 수 있습니다.</RequiredMessage>}
          <PrimaryButton onClick={next} disabled={!canCompleteFirst}>돌발상황 확인하기</PrimaryButton>
        </div>
      )}

      {[5, 6, 7].includes(screen) && (
        <div className="space-y-5">
          <div className="rounded-[2rem] bg-gradient-to-b from-slate-900 to-teal-800 p-5 text-white shadow-xl">
            <div className="text-center"><span className="rounded-full bg-white/10 px-4 py-1 text-xs font-bold">돌발상황 {screen - 4}</span></div>
            <h2 className="mt-5 text-center text-2xl font-black">추가 상황이<br />발생했습니다!</h2>
            <p className="mt-2 text-center text-sm text-white/70">새로운 변수를 확인하고 판단을 다시 준비하세요.</p>
          </div>
          <Card className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">{screen === 5 ? "👤" : screen === 6 ? "⚠️" : "📈"}</div>
            <div className="text-sm font-bold text-blue-600">돌발상황 {screen - 4}</div>
            <p className="mt-3 text-lg font-extrabold leading-8 text-slate-900">{round.surprises[screen - 5]}</p>
          </Card>
          <PrimaryButton onClick={next}>{screen === 7 ? "2차 판단으로 이동" : "다음 돌발상황"}</PrimaryButton>
        </div>
      )}

      {screen === 8 && (
        <div className="space-y-4">
          <div className="text-center"><Pill tone="teal">2차 판단</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">돌발상황 후<br />판단을 조정합니다</h2>
          <InsightCard title="나의 1차 판단 요약" tone="blue">
            <div className="space-y-2">
              <p><b>선택:</b> {firstChoice || "-"}. {firstChoiceText}</p>
              <p><b>이유:</b> {reason || "작성된 이유가 없습니다."}</p>
              <p><b>우려:</b> {concern || "작성된 우려가 없습니다."}</p>
            </div>
          </InsightCard>
          <InsightCard title="새롭게 확인한 변수" tone="orange">
            <ul className="list-disc space-y-1 pl-5">
              {round.surprises.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </InsightCard>
          <OptionCard label="유지" title="기존 선택을 유지한다" desc="1차 판단의 방향을 그대로 실행합니다." selected={secondChoice === "유지"} onClick={() => setSecondChoice("유지")} />
          <OptionCard label="보완" title="기존 선택을 보완한다" desc="방향은 유지하되 조건과 실행방식을 조정합니다." selected={secondChoice === "보완"} onClick={() => setSecondChoice("보완")} tone="teal" />
          <OptionCard label="전환" title="접근 방식을 전환한다" desc="새로운 변수에 맞춰 판단 방향을 바꿉니다." selected={secondChoice === "전환"} onClick={() => setSecondChoice("전환")} tone="purple" />
          <TextArea label="2차 판단 이유" placeholder="무엇이 달라졌고, 어떤 비용을 감수할 것인지 적어주세요." value={secondReason} onChange={setSecondReason} />
          {!canCompleteSecond && <RequiredMessage>유지/보완/전환 선택과 2차 판단 이유를 모두 입력해주세요.</RequiredMessage>}
          <PrimaryButton onClick={next} disabled={!canCompleteSecond}>AI 프롬프트 확인하기</PrimaryButton>
        </div>
      )}

      {screen === 9 && (
        <div className="space-y-5">
          <div className="text-center"><Pill tone="purple">AI 모범 프롬프트</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">이 프롬프트를 복사해<br />AI 도구에 붙여넣으세요</h2>
          <Card className="space-y-4 p-4">
            <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">{generatedPrompt}</div>
            <button onClick={handleCopyPrompt} type="button" className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-violet-700">
              {copied ? "복사 완료" : "프롬프트 복사하기"}
            </button>
          </Card>
          <TextArea label="AI 답변 핵심 요약" placeholder="AI 도구에서 받은 답변 중 도움이 된 내용, 의심되는 내용, 추가로 검토할 내용을 요약해 적어주세요." value={aiAnswerSummary} onChange={setAiAnswerSummary} rows={5} />
          {!canCompleteAiQuestion && <RequiredMessage>AI 답변을 확인한 뒤 핵심 내용을 요약해야 다음으로 이동할 수 있습니다.</RequiredMessage>}
          <PrimaryButton onClick={next} disabled={!canCompleteAiQuestion}>AI 답변 검토하기</PrimaryButton>
        </div>
      )}

      {screen === 10 && (
        <div className="space-y-4">
          <div className="text-center"><Pill tone="purple">AI 답변 요약</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">내가 받은 AI 답변을<br />다시 봅니다</h2>
          <InsightCard title="AI 답변 핵심 요약" tone="purple">
            {aiAnswerSummary}
          </InsightCard>
          <InsightCard title="검토 기준" tone="orange">
            다음 화면에서 AI 답변을 Yes / No / 모르겠음으로 평가합니다. No 또는 모르겠음이 있으면 보완 메모를 남겨야 합니다.
          </InsightCard>
          <PrimaryButton onClick={next}>비판적으로 검토하기</PrimaryButton>
        </div>
      )}

      {screen === 11 && (
        <div className="space-y-4">
          <div className="text-center"><Pill tone="orange">비판적 검토</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">AI 답변을<br />판단해보세요</h2>
          {reviewItems.map((q, index) => (
            <Card key={q} className="p-4">
              <p className="mb-3 text-sm font-bold leading-6 text-slate-700">{q}</p>
              <div className="grid grid-cols-3 gap-2">
                {(["Yes", "No", "모르겠음"] as AiReviewAnswer[]).map((answer) => (
                  <button
                    key={answer}
                    type="button"
                    onClick={() => setReviewAnswers((answers) => answers.map((current, i) => i === index ? answer : current))}
                    className={`rounded-2xl border px-2 py-3 text-xs font-extrabold transition ${reviewAnswers[index] === answer ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-500"}`}
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </Card>
          ))}
          <TextArea label="보완 메모" placeholder="No 또는 모르겠음으로 체크한 항목이 있다면 AI 답변에서 보완해야 할 점을 적어주세요." value={reviewNote} onChange={setReviewNote} rows={3} />
          {!canCompleteReview && <RequiredMessage>모든 항목에 답하고, No/모르겠음이 있으면 보완 메모를 입력해야 합니다.</RequiredMessage>}
          <PrimaryButton onClick={next} disabled={!canCompleteReview}>최종 결정문 작성하기</PrimaryButton>
        </div>
      )}

      {screen === 12 && (
        <div className="space-y-4">
          <div className="text-center"><Pill>최종 결정</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">우리 팀의 최종 결정을<br />5줄로 작성하세요</h2>
          <InsightCard title="좋은 결정문 기준" tone="green">
            추상적 다짐보다 구체적 행동을 적습니다. 선택의 비용을 숨기지 말고, 누구에게 언제 무엇을 할지 드러나야 합니다.
          </InsightCard>
          {finalGuides.map((guide, i) => (
            <div key={guide.label} className="space-y-2">
              <TextInput label={`${i + 1}. ${guide.label}`} placeholder="내용을 입력하세요" value={finalLines[i]} onChange={(v) => setFinalLines((arr) => arr.map((x, idx) => idx === i ? v : x))} />
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">{guide.example}</p>
            </div>
          ))}
          {!canCompleteFinal && <RequiredMessage>최종 5줄 결정문을 모두 입력해야 저장할 수 있습니다.</RequiredMessage>}
          <PrimaryButton onClick={handleSaveAndNext} disabled={!canCompleteFinal}>제출하고 저장하기</PrimaryButton>
        </div>
      )}

      {screen === 13 && (
        <div className="space-y-5">
          <div className="text-center"><Pill tone="green">김박사의 피드백</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">선택의 의미와 비용을<br />다시 봅니다</h2>
          <Card className="p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">👨‍🏫</div>
            <div className="whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700">{doctorKimFeedback}</div>
          </Card>
          <PrimaryButton onClick={next}>로그북 저장하기</PrimaryButton>
        </div>
      )}

      {screen === 14 && (
        <div className="space-y-5">
          <div className="text-center"><Pill tone="green">로그북</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">이번 라운드의<br />판단 흔적</h2>
          <Card className="space-y-3 p-5 text-sm">
            <div className="rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">브라우저 임시 저장소에 저장되었습니다. 같은 브라우저의 /instructor에서 확인할 수 있습니다.</div>
            <div className="flex justify-between"><span className="text-slate-500">1차 판단</span><b className="text-blue-700">{firstChoice || "A"}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">2차 판단</span><b className="text-teal-700">{secondChoice || "보완"}</b></div>
            <div className="border-t border-slate-100 pt-3 text-slate-700">{finalLines.filter(Boolean).join(" / ") || "최종 5줄 결정문이 이곳에 저장됩니다."}</div>
          </Card>
          <PrimaryButton onClick={next}>전체 여정 보기</PrimaryButton>
        </div>
      )}

      {screen === 15 && (
        <div className="space-y-5">
          <div className="text-center"><Pill>여정 요약</Pill></div>
          <h2 className="text-center text-2xl font-black text-slate-900">오늘의 판단 여정이<br />저장되었습니다</h2>
          <div className="grid grid-cols-2 gap-3"><Card className="p-4 text-center"><div className="text-3xl font-black text-blue-600">1</div><div className="mt-1 text-xs font-bold text-slate-500">완료 라운드</div></Card><Card className="p-4 text-center"><div className="text-3xl font-black text-teal-600">{secondChoice === "유지" ? "유지" : "변화"}</div><div className="mt-1 text-xs font-bold text-slate-500">판단 흐름</div></Card></div>
          <Card className="p-5"><div className="text-sm font-extrabold text-slate-800">나의 주요 판단 패턴</div><p className="mt-2 text-sm leading-7 text-slate-600">1차 판단을 돌발상황 이후 다시 검토했고, AI 답변을 비판적으로 확인한 뒤 실행 조건이 포함된 최종 결정문으로 정리했습니다.</p></Card>
          <PrimaryButton onClick={() => { resetRoundInputs(); setScreen(2); }}>다른 라운드 보기</PrimaryButton>
        </div>
      )}
    </MobileShell>
  );
}
