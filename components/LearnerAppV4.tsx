"use client";

import React, { useMemo, useState } from "react";
import { rounds } from "@/lib/data";
import { saveSubmission, type AiReviewAnswer } from "@/lib/storage";
import { Card, OptionCard, Pill, PrimaryButton, TextArea, TextInput } from "@/components/ui";

type FirstChoice = "A" | "B";
type SecondChoice = "기존 유지" | "일부 수정" | "판단 변경";

const reviewItems = [
  "우리 조직의 맥락이 반영되었는가?",
  "팀원의 감정과 체면을 고려했는가?",
  "상사와 타부서의 기대를 놓치지 않았는가?",
  "실행 비용을 과소평가하지 않았는가?",
  "실제 팀장이 말할 수 있는 문장인가?",
];

const secondOptions: { value: SecondChoice; title: string; desc: string; tone: "blue" | "teal" | "purple" }[] = [
  { value: "기존 유지", title: "기존 판단을 유지한다", desc: "돌발상황을 보았지만 1차 판단의 방향을 유지합니다.", tone: "blue" },
  { value: "일부 수정", title: "일부 조건을 수정한다", desc: "기존 방향은 살리되 실행 조건과 범위를 조정합니다.", tone: "teal" },
  { value: "판단 변경", title: "판단 방향을 바꾼다", desc: "새로운 변수 때문에 1차 판단과 다른 방향을 선택합니다.", tone: "purple" },
];

const secondQuestions: Record<SecondChoice, string[]> = {
  "기존 유지": [
    "돌발상황을 보았음에도 기존 판단을 유지해도 된다고 보는 가장 강한 근거는 무엇입니까?",
    "기존 판단을 유지할 때 가장 커지는 위험은 무엇이며, 어떻게 통제하겠습니까?",
    "기존 판단을 유지한다는 결정을 누구에게, 어떤 첫 문장으로 설명하겠습니까?",
  ],
  "일부 수정": [
    "무엇은 그대로 유지하고, 무엇은 수정해야 합니까?",
    "일부 수정으로 새롭게 생기는 비용이나 부담은 무엇입니까?",
    "수정안을 실행하기 위해 누구와 언제 무엇을 다시 합의해야 합니까?",
  ],
  "판단 변경": [
    "1차 판단을 바꿔야 한다고 보게 만든 결정적 증거는 무엇입니까?",
    "판단을 바꿀 때 생기는 신뢰, 설명, 일정상의 비용은 무엇입니까?",
    "판단 변경을 팀원이나 상사에게 어떻게 설명해야 저항을 줄일 수 있습니까?",
  ],
};

const finalGuides = [
  ["나는 이 상황을", "예시: 나는 이 상황을 단순 일정 문제가 아니라 우선순위와 자원 배분의 문제로 본다."],
  ["나의 최종 선택은", "예시: 나의 최종 선택은 기존 일정을 유지하되 품질 점검 조건을 추가하는 일부 수정안이다."],
  ["이 선택의 가장 큰 비용은", "예시: 일부 팀원의 단기 부담과 상사에게 추가 설명해야 한다는 점이다."],
  ["그래서 붙일 실행 조건은", "예시: 오늘 안에 핵심 업무 범위와 품질 기준을 다시 합의하겠다."],
  ["내일 바로 할 첫 행동은", "예시: 내일 오전 핵심 담당자와 15분 점검 미팅을 열겠다."],
];

function RequiredMessage({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-orange-50 px-4 py-3 text-center text-xs font-bold leading-5 text-orange-600">{children}</p>;
}

function Progress({ step }: { step: number }) {
  const labels = ["입장", "상황", "1차", "돌발", "2차", "AI", "결정"];
  return <div className="flex justify-center gap-2 py-3">{labels.map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i <= step ? "bg-blue-600" : "bg-slate-200"}`} />)}</div>;
}

function Shell({ children, step }: { children: React.ReactNode; step: number }) {
  return (
    <div className="mx-auto flex min-h-[820px] w-full max-w-[420px] flex-col overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-50 shadow-2xl">
      <div className="bg-white px-5 pb-2 pt-5">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">9:41</span><b className="text-sm text-slate-800">업무관리 딜레마</b><span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-teal-100" /></div>
        <Progress step={step} />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      <div className="grid grid-cols-6 gap-1 border-t border-slate-100 bg-white px-3 py-3 text-center text-[10px] text-slate-400">
        {["입장", "상황", "1차", "돌발", "2차", "결정"].map((s, i) => <div key={s} className={i === step ? "font-bold text-blue-600" : ""}>●<br />{s}</div>)}
      </div>
    </div>
  );
}

function Nav({ screen, nextDisabled, onPrev, onHome, onNext, label = "다음" }: { screen: number; nextDisabled: boolean; onPrev: () => void; onHome: () => void; onNext: () => void; label?: string }) {
  if (screen < 3 || screen > 15) return null;
  return <div className="mb-5 grid grid-cols-3 gap-2 rounded-3xl border border-slate-100 bg-white p-2 shadow-sm"><button onClick={onPrev} disabled={screen === 3} className="rounded-2xl bg-slate-100 px-3 py-3 text-sm font-extrabold text-slate-600 disabled:text-slate-300">← 이전</button><button onClick={onHome} className="rounded-2xl bg-blue-50 px-3 py-3 text-sm font-extrabold text-blue-700">홈</button><button onClick={onNext} disabled={nextDisabled} className="rounded-2xl bg-blue-600 px-3 py-3 text-sm font-extrabold text-white disabled:bg-slate-100 disabled:text-slate-300">{label} →</button></div>;
}

function Info({ title, children, tone = "blue" }: { title: string; children: React.ReactNode; tone?: "blue" | "teal" | "orange" | "purple" | "green" }) {
  const toneClass = { blue: "bg-blue-50 text-blue-700", teal: "bg-teal-50 text-teal-700", orange: "bg-orange-50 text-orange-700", purple: "bg-violet-50 text-violet-700", green: "bg-emerald-50 text-emerald-700" }[tone];
  return <Card className="p-4"><span className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${toneClass}`}>{title}</span><div className="text-sm leading-7 text-slate-600">{children}</div></Card>;
}

export default function LearnerAppV4() {
  const [screen, setScreen] = useState(0);
  const [code, setCode] = useState("");
  const [team, setTeam] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [firstChoice, setFirstChoice] = useState<FirstChoice | null>(null);
  const [firstReason, setFirstReason] = useState("");
  const [concern, setConcern] = useState("");
  const [secondChoice, setSecondChoice] = useState<SecondChoice | null>(null);
  const [secondAnswers, setSecondAnswers] = useState(["", "", ""]);
  const [aiSummary, setAiSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [reviewAnswers, setReviewAnswers] = useState<(AiReviewAnswer | "")[]>(reviewItems.map(() => ""));
  const [reviewNote, setReviewNote] = useState("");
  const [finalLines, setFinalLines] = useState(["", "", "", "", ""]);

  const round = rounds[roundIndex];
  const filled = (v: string) => v.trim().length > 0;
  const firstChoiceText = firstChoice === "A" ? round.optionA : firstChoice === "B" ? round.optionB : "아직 선택하지 않았습니다.";
  const selectedQuestions = secondChoice ? secondQuestions[secondChoice] : [];
  const secondReason = selectedQuestions.map((q, i) => `${i + 1}. ${q}\n- ${secondAnswers[i] || ""}`).join("\n");
  const canEnter = filled(code) && filled(team);
  const canFirst = Boolean(firstChoice) && filled(firstReason) && filled(concern);
  const canSecond = Boolean(secondChoice);
  const canSecondQuestions = Boolean(secondChoice) && secondAnswers.every(filled);
  const canAi = filled(aiSummary);
  const needReviewNote = reviewAnswers.some((a) => a === "No" || a === "모르겠음");
  const canReview = reviewAnswers.every(Boolean) && (!needReviewNote || filled(reviewNote));
  const canFinal = finalLines.every(filled);

  const prompt = useMemo(() => `나는 팀장 역할로 업무관리 딜레마 상황을 판단하고 있습니다.\n\n[상황]\n${round.story}\n\n[나의 1차 판단]\n${firstChoice || "A/B 중 선택"}. ${firstChoiceText}\n\n[1차 판단 이유]\n${firstReason || "작성한 선택 이유"}\n\n[우려한 점]\n${concern || "작성한 우려 사항"}\n\n[돌발상황]\n1. ${round.surprises[0]}\n2. ${round.surprises[1]}\n3. ${round.surprises[2]}\n\n[나의 2차 판단]\n${secondChoice || "기존 유지/일부 수정/판단 변경 중 선택"}\n\n[2차 판단 질문 답변]\n${secondReason || "선택별 질문 답변"}\n\n[요청]\n1. 이 판단의 강점과 약점을 구분해 주세요.\n2. 제가 놓친 이해관계자 관점이 있다면 알려주세요.\n3. 기존 유지/일부 수정/판단 변경 중 현재 상황에서 어떤 선택이 더 타당한지 조건부로 비교해 주세요.\n4. 이 선택을 팀원 또는 상사에게 설명할 첫 문장 3개를 제안해 주세요.\n5. 정답처럼 말하지 말고 각 선택의 비용과 실행 조건을 함께 제시해 주세요.`, [round, firstChoice, firstChoiceText, firstReason, concern, secondChoice, secondReason]);
  const kim = `김박사의 피드백\n\n이번 선택에서 중요한 것은 무엇을 골랐는가보다 그 선택의 비용을 얼마나 알고 있었는가입니다. 당신은 1차로 ${firstChoice || "A/B"}를 선택했고, 돌발상황 이후 ${secondChoice || "2차 판단"}을 선택했습니다.\n\n이 판단이 현장에서 힘을 가지려면 선택의 이유만이 아니라 감수할 비용과 실행 조건을 함께 말해야 합니다.`;
  const reset = () => { setFirstChoice(null); setFirstReason(""); setConcern(""); setSecondChoice(null); setSecondAnswers(["", "", ""]); setAiSummary(""); setCopied(false); setReviewAnswers(reviewItems.map(() => "")); setReviewNote(""); setFinalLines(["", "", "", "", ""]); };
  const startRound = (i: number) => { setRoundIndex(i); reset(); setScreen(3); };
  const next = () => setScreen((s) => Math.min(s + 1, 16));
  const prev = () => setScreen((s) => Math.max(s - 1, 2));
  const home = () => setScreen(2);
  const save = () => { if (!firstChoice || !secondChoice || !canFinal) return; saveSubmission({ id: `${code}-${team}-${round.id}`, sessionCode: code.trim(), teamName: team.trim(), roundId: round.id, roundTitle: round.title, firstChoice, firstReason: firstReason.trim(), concern: concern.trim(), secondChoice, secondReason, secondQuestionAnswers: selectedQuestions.map((question, i) => ({ question, answer: secondAnswers[i].trim() })), aiQuestion: prompt, generatedPrompt: prompt, aiAnswerSummary: aiSummary.trim(), aiFeedbackSummary: aiSummary.trim(), aiReviewResults: reviewItems.map((question, i) => ({ question, answer: (reviewAnswers[i] || "모르겠음") as AiReviewAnswer })), aiReviewNote: reviewNote.trim(), finalLines: finalLines.map((x) => x.trim()), aftermath: round.aftermath, doctorKimFeedback: kim, createdAt: new Date().toISOString() }); next(); };
  const nextDisabled = screen === 4 ? !canFirst : screen === 8 ? !canSecond : screen === 9 ? !canSecondQuestions : screen === 10 ? !canAi : screen === 12 ? !canReview : screen === 13 ? !canFinal : false;
  const navNext = () => { if (nextDisabled) return; if (screen === 13) return save(); next(); };
  const navLabel = screen === 13 ? "저장" : screen === 15 ? "요약" : "다음";
  const step = screen < 2 ? 0 : screen < 4 ? 1 : screen === 4 ? 2 : screen < 8 ? 3 : screen < 10 ? 4 : screen < 13 ? 5 : 6;

  return <Shell step={step}><Nav screen={screen} nextDisabled={nextDisabled} onPrev={prev} onHome={home} onNext={navNext} label={navLabel} />
    {screen === 0 && <div className="space-y-6"><div><div className="text-lg font-extrabold text-blue-600">업무관리</div><h1 className="mt-2 text-4xl font-black leading-tight text-slate-900">Decision<br />Journey</h1><p className="mt-4 text-sm leading-7 text-slate-500">실제 업무 속 딜레마를 경험하고 더 나은 리더십 결정을 만들어갑니다.</p></div><Card className="space-y-4 p-5"><TextInput label="세션 코드" placeholder="예) ABC123" value={code} onChange={setCode} /><TextInput label="팀명 / 이름" placeholder="예) 새벽등대팀 / 홍길동" value={team} onChange={setTeam} />{!canEnter && <RequiredMessage>세션 코드와 팀명/이름을 모두 입력해주세요.</RequiredMessage>}<PrimaryButton onClick={() => canEnter && setScreen(1)} disabled={!canEnter}>여정 시작하기</PrimaryButton></Card></div>}
    {screen === 1 && <div className="space-y-5"><Pill>과정 소개</Pill><h2 className="text-3xl font-black text-slate-900">오늘의 목표는 정답 찾기가 아닙니다</h2>{["1차 판단", "돌발상황 3가지", "2차 판단", "선택별 질문", "AI 모범 프롬프트", "김박사의 피드백"].map((x, i) => <Card key={x} className="flex items-center gap-4 p-4"><b className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{i + 1}</b><span className="font-bold text-slate-700">{x}</span></Card>)}<PrimaryButton onClick={() => setScreen(2)}>라운드 선택하기</PrimaryButton></div>}
    {screen === 2 && <div className="space-y-5"><Pill>10라운드 여정</Pill><h2 className="text-2xl font-black text-slate-900">업무관리 딜레마</h2>{rounds.map((r, i) => <button key={r.id} onClick={() => startRound(i)} className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm"><Pill tone={i % 3 === 0 ? "blue" : i % 3 === 1 ? "teal" : "purple"}>라운드 {r.id}</Pill><h3 className="mt-3 text-lg font-extrabold text-slate-800">{r.title}</h3><p className="mt-1 text-sm text-slate-500">{r.subtitle}</p></button>)}</div>}
    {screen === 3 && <div className="space-y-5"><div className="text-center"><Pill>라운드 {round.id}</Pill></div><h2 className="text-center text-2xl font-black text-slate-900">상황 카드</h2><Card className="p-5"><h3 className="text-lg font-extrabold text-slate-800">{round.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{round.story}</p></Card><Card className="p-5 text-center"><b className="text-blue-600">질문</b><p className="mt-2 text-lg font-extrabold leading-8 text-slate-900">{round.question}</p></Card><PrimaryButton onClick={next}>1차 판단하기</PrimaryButton></div>}
    {screen === 4 && <div className="space-y-4"><div className="text-center"><Pill>1차 판단</Pill></div><OptionCard label="A" title={round.optionA} selected={firstChoice === "A"} onClick={() => setFirstChoice("A")} /><OptionCard label="B" title={round.optionB} selected={firstChoice === "B"} onClick={() => setFirstChoice("B")} tone="teal" /><TextArea label="선택 이유" placeholder="선택 이유를 적어주세요." value={firstReason} onChange={setFirstReason} /><TextArea label="우려되는 점" placeholder="우려되는 점을 적어주세요." value={concern} onChange={setConcern} />{!canFirst && <RequiredMessage>A/B 선택, 선택 이유, 우려되는 점을 모두 입력해주세요.</RequiredMessage>}<PrimaryButton onClick={next} disabled={!canFirst}>돌발상황 확인하기</PrimaryButton></div>}
    {[5, 6, 7].includes(screen) && <div className="space-y-5"><div className="rounded-[2rem] bg-gradient-to-b from-slate-900 to-teal-800 p-5 text-white"><p className="text-center text-xs font-bold">돌발상황 {screen - 4}</p><h2 className="mt-4 text-center text-2xl font-black">추가 상황이 발생했습니다</h2></div><Card className="p-5"><p className="text-lg font-extrabold leading-8 text-slate-900">{round.surprises[screen - 5]}</p></Card><PrimaryButton onClick={next}>{screen === 7 ? "2차 판단으로 이동" : "다음 돌발상황"}</PrimaryButton></div>}
    {screen === 8 && <div className="space-y-4"><div className="text-center"><Pill tone="teal">2차 판단</Pill></div><Info title="나의 1차 판단 요약"><p><b>선택:</b> {firstChoice}. {firstChoiceText}</p><p><b>이유:</b> {firstReason}</p><p><b>우려:</b> {concern}</p></Info>{secondOptions.map((o) => <OptionCard key={o.value} label={o.value} title={o.title} desc={o.desc} selected={secondChoice === o.value} onClick={() => { setSecondChoice(o.value); setSecondAnswers(["", "", ""]); }} tone={o.tone} />)}{!canSecond && <RequiredMessage>기존 유지 / 일부 수정 / 판단 변경 중 하나를 선택해주세요.</RequiredMessage>}<PrimaryButton onClick={next} disabled={!canSecond}>선택별 질문으로 이동</PrimaryButton></div>}
    {screen === 9 && secondChoice && <div className="space-y-4"><div className="text-center"><Pill tone="teal">선택별 질문</Pill></div><h2 className="text-center text-2xl font-black text-slate-900">{secondChoice}을 선택한 이유</h2>{selectedQuestions.map((q, i) => <TextArea key={q} label={`${i + 1}. ${q}`} placeholder="구체적으로 입력해주세요." value={secondAnswers[i]} onChange={(v) => setSecondAnswers((arr) => arr.map((x, idx) => idx === i ? v : x))} />)}{!canSecondQuestions && <RequiredMessage>선택별 질문 3개에 모두 답변해야 다음으로 이동할 수 있습니다.</RequiredMessage>}<PrimaryButton onClick={next} disabled={!canSecondQuestions}>AI 프롬프트 확인하기</PrimaryButton></div>}
    {screen === 10 && <div className="space-y-5"><div className="text-center"><Pill tone="purple">AI 모범 프롬프트</Pill></div><Card className="space-y-4 p-4"><pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">{prompt}</pre><button onClick={async () => { await navigator.clipboard.writeText(prompt); setCopied(true); }} className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-extrabold text-white">{copied ? "복사 완료" : "프롬프트 복사하기"}</button></Card><TextArea label="AI 답변 핵심 요약" placeholder="AI 답변의 핵심을 요약해주세요." value={aiSummary} onChange={setAiSummary} rows={5} />{!canAi && <RequiredMessage>AI 답변 핵심 요약을 입력해주세요.</RequiredMessage>}<PrimaryButton onClick={next} disabled={!canAi}>AI 답변 검토하기</PrimaryButton></div>}
    {screen === 11 && <div className="space-y-4"><Pill tone="purple">AI 답변 요약</Pill><Info title="AI 답변 핵심 요약" tone="purple">{aiSummary}</Info><PrimaryButton onClick={next}>비판적으로 검토하기</PrimaryButton></div>}
    {screen === 12 && <div className="space-y-4"><div className="text-center"><Pill tone="orange">비판적 검토</Pill></div>{reviewItems.map((q, i) => <Card key={q} className="p-4"><p className="mb-3 text-sm font-bold leading-6 text-slate-700">{q}</p><div className="grid grid-cols-3 gap-2">{(["Yes", "No", "모르겠음"] as AiReviewAnswer[]).map((a) => <button key={a} onClick={() => setReviewAnswers((arr) => arr.map((x, idx) => idx === i ? a : x))} className={`rounded-2xl border px-2 py-3 text-xs font-extrabold ${reviewAnswers[i] === a ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 bg-white text-slate-500"}`}>{a}</button>)}</div></Card>)}<TextArea label="보완 메모" placeholder="No 또는 모르겠음이 있다면 보완점을 적어주세요." value={reviewNote} onChange={setReviewNote} />{!canReview && <RequiredMessage>모든 항목에 답하고 필요한 경우 보완 메모를 입력해주세요.</RequiredMessage>}<PrimaryButton onClick={next} disabled={!canReview}>최종 결정문 작성하기</PrimaryButton></div>}
    {screen === 13 && <div className="space-y-4"><Pill>최종 결정</Pill><Info title="좋은 결정문 기준" tone="green">추상적 다짐보다 구체적 행동을 적습니다. 선택의 비용과 실행 조건이 드러나야 합니다.</Info>{finalGuides.map((g, i) => <div key={g[0]} className="space-y-2"><TextInput label={`${i + 1}. ${g[0]}`} placeholder="내용을 입력하세요" value={finalLines[i]} onChange={(v) => setFinalLines((arr) => arr.map((x, idx) => idx === i ? v : x))} /><p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">{g[1]}</p></div>)}{!canFinal && <RequiredMessage>최종 5줄 결정문을 모두 입력해야 저장할 수 있습니다.</RequiredMessage>}<PrimaryButton onClick={save} disabled={!canFinal}>제출하고 저장하기</PrimaryButton></div>}
    {screen === 14 && <div className="space-y-5"><Pill tone="green">김박사의 피드백</Pill><Card className="p-5"><pre className="whitespace-pre-wrap text-sm font-semibold leading-8 text-slate-700">{kim}</pre></Card><PrimaryButton onClick={next}>로그북 저장하기</PrimaryButton></div>}
    {screen === 15 && <div className="space-y-5"><Pill tone="green">로그북</Pill><Card className="space-y-3 p-5 text-sm"><div className="rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">브라우저 임시 저장소에 저장되었습니다.</div><div className="flex justify-between"><span>1차 판단</span><b>{firstChoice}</b></div><div className="flex justify-between"><span>2차 판단</span><b>{secondChoice}</b></div><div className="border-t pt-3">{finalLines.join(" / ")}</div></Card><PrimaryButton onClick={next}>전체 여정 보기</PrimaryButton></div>}
    {screen === 16 && <div className="space-y-5"><Pill>여정 요약</Pill><h2 className="text-center text-2xl font-black text-slate-900">오늘의 판단 여정이 저장되었습니다</h2><Card className="p-5"><p className="text-sm leading-7 text-slate-600">1차 판단을 돌발상황 이후 다시 검토했고, 선택별 질문을 통해 판단의 근거·비용·설명 방식을 구체화했습니다.</p></Card><PrimaryButton onClick={() => { reset(); setScreen(2); }}>다른 라운드 보기</PrimaryButton></div>}
  </Shell>;
}
