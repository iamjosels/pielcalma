"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { flareRisk } from "@/lib/predict";
import { buildAIContext } from "@/lib/aiContext";
import { requestAI } from "@/lib/requestAI";
import { Reveal, Skeleton } from "@/components/motion";
import Mascot from "@/components/Mascot";
import { Sparkle, Eye } from "@/components/icons";

const LEVELS = {
  bajo: { label: "Días estables", chip: "bg-wash-green text-navy", dot: "bg-accent", mood: "happy", bar: "bg-accent" },
  medio: { label: "Para tener en cuenta", chip: "bg-amber-soft text-navy", dot: "bg-amber", mood: "neutral", bar: "bg-amber" },
  alto: { label: "Observa con atención", chip: "bg-danger-soft text-navy", dot: "bg-danger", mood: "concern", bar: "bg-danger" },
};

export default function PredictorCard() {
  const { logs, observations, calmaEvents } = useStore();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  const risk = mounted ? flareRisk(logs) : null;
  const level = risk ? risk.level : "bajo";
  const view = LEVELS[level] || LEVELS.bajo;

  useEffect(() => {
    if (!mounted || !risk) return;
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await requestAI("forecast", {
          risk,
          context: buildAIContext(logs, observations, calmaEvents),
        });
        if (alive) setData(res);
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, level, risk?.score]);

  const factors = (risk?.factors || []).filter((f) => f.weight > 0).slice(0, 3);

  return (
    <Reveal className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft">
          <Mascot size={34} mood={view.mood} />
        </span>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <Sparkle size={13} weight="duotone" />
            Anticipación
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold text-navy">{view.label}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${view.chip}`}>
          Próximos días
        </span>
      </div>

      {/* Medidor amable (no "% riesgo" frío) */}
      {risk && !risk.insufficient && (
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-cream-sunk">
          <div
            className={`h-full rounded-full ${view.bar} transition-[width] duration-700`}
            style={{ width: `${Math.max(8, risk.score)}%` }}
          />
        </div>
      )}

      {/* Frase IA segura */}
      <div className="mt-4">
        {loading ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </>
        ) : (
          <p className="text-[0.97rem] leading-relaxed text-ink">
            {data?.frase ||
              "Tus registros se ven estables; un buen momento para mantener la rutina de cuidado tal como va."}
          </p>
        )}
      </div>

      {/* Factores como chips */}
      {factors.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {factors.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-cream-sunk px-3 py-1.5 text-xs font-medium text-ink-muted"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${view.dot}`} />
              {f.label}
            </span>
          ))}
        </div>
      )}

      {/* Qué observar */}
      {!loading && Array.isArray(data?.observaciones) && data.observaciones.length > 0 && (
        <ul className="mt-3.5 space-y-1.5">
          {data.observaciones.slice(0, 3).map((o, i) => (
            <li key={i} className="flex gap-2 text-sm leading-snug text-ink-muted">
              <Eye size={15} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
              {o}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[0.7rem] leading-relaxed text-ink-faint">
        No predice un brote: son coincidencias de tus propios registros para conversar con tu dermatólogo.
      </p>
    </Reveal>
  );
}
