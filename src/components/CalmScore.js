import { Sparkles } from "lucide-react";
import Card from "./Card";
import { calmScore } from "@/lib/demoData";

export default function CalmScore({
  score = calmScore.score,
  max = calmScore.max,
  label = calmScore.label,
  note = calmScore.note,
}) {
  const percentage = Math.round((score / max) * 100);

  return (
    <Card accent="lavender" className="overflow-hidden">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center sm:mx-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(139,123,184,0.15)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#calmGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 3.27} 999`}
            />
            <defs>
              <linearGradient id="calmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b7bb8" />
                <stop offset="100%" stopColor="#6ba88a" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold text-slate-800">{score}</p>
            <p className="text-xs text-slate-500">/ {max}</p>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-accent-lavender">
            <Sparkles className="h-3.5 w-3.5" />
            {label}
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-800">
            {score}/{max}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{note}</p>
        </div>
      </div>
    </Card>
  );
}
