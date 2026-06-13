"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { Skeleton, TactileButton } from "@/components/motion";
import Mascot from "@/components/Mascot";
import {
  Printer,
  FilePdf,
  PaperPlaneTilt,
  ArrowClockwise,
  ArrowRight,
  Path,
  ChatCircleDots,
  Eye,
  Warning,
  Sparkle,
  ChartLineUp,
} from "@/components/icons";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useStore, seedDemo, resetProfileData } from "@/lib/store";
import { requestAI } from "@/lib/requestAI";
import { buildReportPdf } from "@/lib/reportPdf";
import { downloadPdf, printPdf } from "@/lib/savePdf";
import { buildAIContext } from "@/lib/aiContext";
import {
  weeklyData,
  sleepDistribution,
  metrics as computeMetrics,
  calmaFamiliar as computeCalma,
  observedPatterns,
  anticipations as computeAnticipations,
  habitSummary,
} from "@/lib/aggregate";

const safeInterpretation = [
  { title: "No diagnostica", text: "No clasifica la condición ni emite juicio clínico." },
  { title: "No indica tratamiento", text: "No sugiere cremas, medicamentos, dosis ni cambios de rutina médica." },
  { title: "Sí mejora la consulta", text: "Ordena información que puedes conversar con tu dermatólogo." },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length && payload[0].value != null) {
    return (
      <div className="rounded-[1rem] border border-hairline bg-cream-card p-3 text-sm shadow-[var(--shadow-soft)]">
        <p className="font-semibold text-navy">{label}</p>
        <p className="text-ink-muted">
          Comezón registrada: <span className="font-mono text-navy">{payload[0].value}/10</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function HistorialReport() {
  const { profile, logs, observations, calmaEvents } = useStore();
  const [mounted, setMounted] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => setMounted(true), []);

  const week = useMemo(() => weeklyData(logs), [logs]);
  const sleep = useMemo(() => sleepDistribution(logs), [logs]);
  const m = useMemo(() => computeMetrics(logs), [logs]);
  const calma = useMemo(() => computeCalma(logs, observations, calmaEvents), [logs, observations, calmaEvents]);
  const clientPatterns = useMemo(() => observedPatterns(logs), [logs]);
  const antic = useMemo(() => computeAnticipations(logs), [logs]);
  const habits = useMemo(() => habitSummary(logs), [logs]);

  const hasData = mounted && logs.length > 0;

  useEffect(() => {
    if (!mounted) return;
    if (logs.length === 0) {
      setReport(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const context = buildAIContext(logs, observations, calmaEvents);
        const data = await requestAI("report", context);
        if (!cancelled) setReport(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, logs, observations, calmaEvents]);

  const patternsList = report?.patronesObservados?.length ? report.patronesObservados : clientPatterns;
  const questionsList = report?.preguntasDermatologo || [];
  const obsList = report?.observacionesVisuales?.length
    ? report.observacionesVisuales
    : observations.map((o) => o.observacionVisual).filter(Boolean);

  function pdfPayload() {
    return {
      profile,
      metrics: m,
      calma,
      week,
      sleep,
      resumen: report?.resumenSemanal || "",
      patterns: patternsList,
      questions: questionsList,
      observations: obsList,
      anticipations: antic,
      habits,
      generatedAt: new Date(),
    };
  }

  const pdfName = () => `PielCalma-${profile.childName || "reporte"}.pdf`;

  async function handleDownloadPdf() {
    try {
      const doc = await buildReportPdf(pdfPayload());
      await downloadPdf(doc, pdfName());
    } catch (e) {
      console.error("PDF download failed", e);
    }
  }

  async function handlePrint() {
    try {
      const doc = await buildReportPdf(pdfPayload());
      await printPdf(doc, pdfName());
    } catch (e) {
      console.error("PDF print failed", e);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-1 pb-10 pt-1 sm:px-4 print:max-w-none print:px-0 print:py-0">
      {/* Ficha del paciente */}
      <div className="print-area rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)] print:border-0 print:shadow-none">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-cream px-3.5 py-1.5 text-xs font-medium text-ink-muted print:hidden">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Historial técnico · Semana de seguimiento
        </span>
        <h1 className="mt-3 font-display text-[1.6rem] font-bold leading-[1.12] tracking-tight text-navy">
          La semana de {mounted ? profile.childName : "Lucas"}, organizada para consulta.
        </h1>

        <div className="mt-4 rounded-[1.4rem] bg-navy p-5 text-white shadow-[var(--shadow-soft)] print:bg-white print:text-navy print:shadow-none print:ring-1 print:ring-hairline">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft print:text-accent">Paciente</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/55 print:text-ink-muted">Cuidadora</p>
              <p className="text-lg font-semibold">{mounted ? profile.caregiverName : "Ana"}</p>
            </div>
            <div>
              <p className="text-sm text-white/55 print:text-ink-muted">Niño</p>
              <p className="text-lg font-semibold">
                {mounted ? profile.childName : "Lucas"} · {mounted ? (profile.childAge ?? "—") : 4}a
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-white/55 print:text-ink-muted">Condición registrada</p>
              <p className="text-base font-semibold">{mounted ? profile.conditionLabel : "Dermatitis atópica"}</p>
            </div>
          </div>
        </div>

        {hasData && (
          <div className="mt-4 flex flex-col gap-2.5 print:hidden">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
            >
              <FilePdf size={18} weight="bold" />
              Generar reporte PDF
            </button>
            <div className="flex gap-2.5">
              <button
                onClick={handlePrint}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline-strong bg-cream-card px-4 py-3.5 text-sm font-semibold text-navy transition active:scale-[0.98]"
              >
                <Printer size={17} weight="bold" className="text-accent" />
                Imprimir
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline-strong bg-cream-card px-4 py-3.5 text-sm font-semibold text-navy transition active:scale-[0.98]"
              >
                <PaperPlaneTilt size={16} weight="bold" className="text-accent" />
                Compartir
              </button>
            </div>
            <button
              onClick={() => resetProfileData()}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-navy"
            >
              <ArrowClockwise size={16} weight="bold" />
              Reiniciar datos
            </button>
          </div>
        )}
      </div>

      {/* No montado → skeleton */}
      {!mounted && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-28 w-full rounded-[var(--radius-card)]" />
            ))}
          </div>
          <Skeleton className="mt-4 h-64 w-full rounded-[var(--radius-card)]" />
        </div>
      )}

      {/* Empty state */}
      {mounted && logs.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-hairline-strong bg-cream-card p-8 text-center">
          <Mascot size={72} mood="neutral" />
          <h2 className="mt-4 font-display text-xl font-semibold text-navy">Todavía no hay registros esta semana</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Cuando registres los días de {profile.childName}, aquí verás el gráfico, las métricas y Calma Familiar con
            tus datos reales.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3">
            <button
              onClick={() => seedDemo()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
            >
              <Sparkle size={18} weight="bold" />
              Cargar datos de demo
            </button>
            <TactileButton href="/estado" variant="secondary" className="w-full px-6 py-3.5 text-sm">
              Registrar un día
              <ArrowRight size={18} weight="bold" />
            </TactileButton>
          </div>
        </div>
      )}

      {/* Carga */}
      {hasData && loading && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-28 w-full rounded-[var(--radius-card)]" />
            ))}
          </div>
          <Skeleton className="mt-4 h-64 w-full rounded-[var(--radius-card)]" />
        </div>
      )}

      {hasData && !loading && (
        <div className="mt-6">
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-[var(--radius-card)] border border-danger/40 bg-danger-soft/50 p-4">
              <Warning size={20} weight="duotone" className="shrink-0 text-danger" />
              <p className="text-sm leading-relaxed text-ink-muted">
                El texto narrativo no se pudo generar, pero las métricas y el gráfico se calcularon con tus registros.
              </p>
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-4 shadow-[var(--shadow-card)]">
              <p className="text-sm font-medium text-ink-muted">Días registrados</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-navy">{m.registeredDays}/7</p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-accent-soft p-4">
              <p className="text-sm font-medium text-navy/60">Comezón alta</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-navy">
                {m.highItchDays} día{m.highItchDays === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-wash-green p-4">
              <p className="text-sm font-medium text-navy/60">Sueño afectado</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-navy">
                {m.affectedSleepNights} noche{m.affectedSleepNights === 1 ? "" : "s"}
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-amber-soft p-4">
              <p className="text-sm font-medium text-navy/60">Calma Familiar</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-navy">{calma}/100</p>
            </div>
          </div>

          {/* Hábitos */}
          <div className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Hábitos de la semana</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {habits.map((h) => (
                <div key={h.label} className="flex items-center gap-2 rounded-full bg-cream px-3.5 py-2 ring-1 ring-inset ring-hairline">
                  <span className="text-xs text-ink-muted">{h.label}</span>
                  <span className="text-sm font-semibold capitalize text-navy">{h.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Resumen generado</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-navy">Lo importante de esta semana</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{report?.resumenSemanal}</p>
          </div>

          {/* Gráfico */}
          <div className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Evolución registrada</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-navy">Comezón reportada por día</h2>
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <AreaChart data={week} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="itchColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#57b894" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#57b894" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#c7e0d2" vertical={false} />
                  <XAxis dataKey="day" stroke="#8aa097" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#8aa097" tickLine={false} axisLine={false} fontSize={11} width={28} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#d6f0e3", strokeWidth: 2 }} />
                  <Area
                    type="monotone"
                    dataKey="itch"
                    stroke="#57b894"
                    strokeWidth={2.5}
                    fill="url(#itchColor)"
                    connectNulls
                    dot={{ r: 4, fill: "#57b894", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#57b894", stroke: "#ffffff", strokeWidth: 2 }}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-faint">
              Escala registrada por la cuidadora. No representa medición clínica ni severidad médica.
            </p>
          </div>

          {/* Sueño */}
          <div className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Sueño</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-navy">Noches registradas</h2>
            <div className="mt-4 flex flex-col gap-3.5">
              {sleep.map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">{item.label}</p>
                    <p className="font-mono text-sm text-ink-muted">
                      {item.value} noche{item.value === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-cream-sunk">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(item.value / 7) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretación segura */}
          <div className="mt-4 rounded-[var(--radius-card)] bg-navy p-5 text-white shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">Interpretación segura</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">El reporte organiza, no concluye.</h2>
            <div className="mt-4 flex flex-col">
              {safeInterpretation.map((item, i) => (
                <div key={item.title} className={`py-3 ${i > 0 ? "border-t border-white/10" : ""}`}>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla semanal */}
          <div className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Bitácora semanal</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-navy">Registros de la semana</h2>
            <div className="mt-4 overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-ink-faint">
                    <th className="py-3 pr-3 font-medium">Día</th>
                    <th className="py-3 pr-3 font-medium">Comezón</th>
                    <th className="py-3 pr-3 font-medium">Sueño</th>
                    <th className="py-3 pr-3 font-medium">Factores</th>
                    <th className="py-3 pr-3 font-medium">Rutina</th>
                  </tr>
                </thead>
                <tbody>
                  {week.map((item) => (
                    <tr key={item.date} className={`border-b border-hairline/70 ${item.hasData ? "text-ink-muted" : "text-ink-faint"}`}>
                      <td className="whitespace-nowrap py-3 pr-3 font-semibold text-navy">{item.day}</td>
                      <td className="whitespace-nowrap py-3 pr-3 font-mono">{item.itch ?? "—"}{item.itch != null ? "/10" : ""}</td>
                      <td className="whitespace-nowrap py-3 pr-3">{item.sleep}</td>
                      <td className="py-3 pr-3">{item.triggers}</td>
                      <td className="whitespace-nowrap py-3 pr-3">{item.routine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Para los próximos días */}
          <div className="mt-4 rounded-[var(--radius-card)] bg-accent-soft/50 p-5 ring-1 ring-inset ring-accent/20">
            <div className="flex items-center gap-2">
              <Sparkle size={18} weight="duotone" className="text-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Para los próximos días</p>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {antic.map((a, i) => (
                <li key={i} className="flex gap-3 rounded-[1rem] bg-cream-card p-3.5 text-sm leading-relaxed text-navy/80 ring-1 ring-inset ring-hairline">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Patrones / preguntas / observaciones */}
          <div className="mt-4 flex flex-col gap-4">
            {[
              { Icon: Path, wash: "bg-accent-soft", title: "Posibles patrones observados", items: patternsList, itemWash: "bg-cream ring-1 ring-inset ring-hairline" },
              { Icon: ChatCircleDots, wash: "bg-wash-green", title: "Preguntas para el dermatólogo", items: questionsList, itemWash: "bg-wash-green/60" },
              { Icon: Eye, wash: "bg-amber-soft", title: "Observaciones visuales", items: obsList, itemWash: "bg-amber-soft/60", thumbs: observations.filter((o) => o.thumb).slice(0, 4).map((o) => o.thumb) },
            ].map((col) => (
              <div key={col.title} className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[0.9rem] ${col.wash}`}>
                  <col.Icon size={22} weight="duotone" className="text-navy" />
                </div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-navy">{col.title}</h2>
                {col.thumbs && col.thumbs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {col.thumbs.map((t, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={t} alt={`Foto registrada ${i + 1}`} className="h-14 w-14 rounded-[0.6rem] object-cover ring-1 ring-hairline" />
                    ))}
                  </div>
                )}
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.items?.length ? (
                    col.items.map((entry, index) => (
                      <li key={index} className={`rounded-[1rem] p-3.5 text-sm leading-relaxed text-navy/80 ${col.itemWash}`}>
                        {entry}
                      </li>
                    ))
                  ) : (
                    <li className="rounded-[1rem] bg-cream p-3.5 text-sm text-ink-faint ring-1 ring-inset ring-hairline">
                      Aún sin datos esta semana.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <SafeDisclaimer />
          </div>

          <div className="mt-5 print:hidden">
            <Link
              href="/estado"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
            >
              Registrar otro día
              <ArrowRight size={18} weight="bold" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
