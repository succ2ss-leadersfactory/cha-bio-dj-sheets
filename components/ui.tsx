"use client";

import React from "react";

export function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "teal" | "purple" | "orange" | "gray" | "green" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    purple: "bg-violet-50 text-violet-700 border-violet-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    gray: "bg-slate-50 text-slate-600 border-slate-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-100 bg-white shadow-soft ${className}`}>{children}</div>;
}

export function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg transition ${disabled ? "bg-slate-300 shadow-none" : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"}`}>
      {children}
    </button>
  );
}

export function TextInput({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

export function TextArea({ label, placeholder, value, onChange, rows = 3 }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

export function OptionCard({ label, title, desc, selected, onClick, tone = "blue" }: { label: string; title: string; desc?: string; selected: boolean; onClick: () => void; tone?: "blue" | "teal" | "purple" }) {
  const styles = selected ? tone === "teal" ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100" : tone === "purple" ? "border-violet-400 bg-violet-50 ring-4 ring-violet-100" : "border-blue-400 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 bg-white";
  const badge = tone === "teal" ? "bg-teal-600" : tone === "purple" ? "bg-violet-600" : "bg-blue-600";
  return (
    <button onClick={onClick} className={`w-full rounded-3xl border p-4 text-left transition ${styles}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white ${badge}`}>{label}</div>
        <div className="flex-1">
          <div className="text-base font-extrabold text-slate-800">{title}</div>
          {desc && <div className="mt-1 text-sm leading-6 text-slate-500">{desc}</div>}
        </div>
        <div className={`mt-1 h-5 w-5 rounded-full border-2 ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} />
      </div>
    </button>
  );
}
