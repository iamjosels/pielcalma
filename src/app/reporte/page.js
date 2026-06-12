"use client";

import { useEffect, useMemo, useState } from "react";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { Skeleton, TactileButton } from "@/components/motion";
import {
  Printer,
  FilePdf,
  ArrowClockwise,
  ArrowLeft,
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
import { buildReportPdf } from "@/lib/reportPdf";
import {
  weeklyData,
  sleepDistribution,
  metrics as computeMetrics,
  calmaFamiliar as computeCalma,
  observedPatterns,
  buildReportContext,
} from "@/lib/aggregate";

const safeInterpretation = [
  { title: "No diagnostica", text: "No clasifica la condición ni emite juicio clínico." },
  { title: "No indica tratamiento", text: "No sugiere cremas, medicamentos, dosis ni cambios de rutina médica." },
  { title: "Sí mejora la consulta", text: "Ordena información que la cuidadora puede conversar con su dermatólogo." },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length && payload[0].value != null) {
    return (
      <div className="rounded-[1rem] border border-hairline bg-cream-card p-3 text-sm shadow-[var(--shadow-soft)]">
        <p className="font-semibold text-navy">{label}</p>
        <p className="text-ink-muted">
          Comezón registrada:{" "}
          <span className="font-mono text-navy">{payload[0].value}/10</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function ReportePage() {
  const { profile, logs, observations, calmaEvents } = useStore();
  const [mounted, setMounted] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => setMounted(true), []);

  const week = useMemo(() => weeklyData(logs), [logs]);
  const sleep = useMemo(() => sleepDistribution(logs), [logs]);
  const m = useMemo(() => computeMetrics(logs), [logs]);
  const calma = useMemo(
    () => computeCalma(logs, observations, calmaEvents),
    [logs, observations, calmaEvents]
  );
  const clientPatterns = useMemo(() => observedPatterns(logs), [logs]);

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
        const context = buildReportContext(logs, observations, calmaEvents);
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        });
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
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

  const patternsList =
    report?.patronesObservados?.length ? report.patronesObservados : clientPatterns;
  const questionsList = report?.preguntasDermatologo || [];
  const obsList =
    report?.observacionesVisuales?.length
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
      generatedAt: new Date(),
    };
  }

  async function handleDownloadPdf() {
    const doc = await buildReportPdf(pdfPayload());
    doc.save(`PielCalma-${profile.childName || "reporte"}.pdf`);
  }

  // Imprimir = el mismo documento PDF premium (no la página web).
  async function handlePrint() {
    const doc = await buildReportPdf(pdfPayload());
    doc.autoPrint();
    const url = doc.output("bloburl");
    const win = window.open(url, "_blank");
    if (!win) doc.save(`PielCalma-${profile.childName || "reporte"}.pdf`);
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-cream text-ink">
      <BrandNav active="reporte" />

      <section className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16 print:px-0 print:py-0">
        <div aria-hidden className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-accent-soft/45 blur-3xl print:hidden" />
        <div aria-hidden className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-wash-green/55 blur-3xl print:hidden" />

        {/* Encabezado / ficha */}
        <div className="print-area relative mb-6 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8 print:border-0 print:shadow-none">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:items-end">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-cream px-4 py-2 text-sm font-medium text-ink-muted print:hidden">
                <span className="h-2 w-2 rounded-full bg-coral" />
                Reporte médico · Semana de seguimiento
              </span>
              <h1 className="font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl print:text-4xl">
                La semana de {mounted ? profile.childName : "Lucas"}, organizada para consulta.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-muted print:text-base">
                Este reporte convierte los registros diarios en información clara:
                comezón, sueño, posibles coincidencias, observaciones visuales y
                preguntas útiles para conversar con el dermatólogo.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-navy p-6 text-white shadow-[var(--shadow-soft)] print:bg-white print:text-navy print:shadow-none print:ring-1 print:ring-hairline">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft print:text-accent">
                Paciente demo
              </p>
              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <p className="text-sm text-white/55 print:text-ink-muted">Cuidadora</p>
                  <p className="text-2xl font-semibold">{mounted ? profile.caregiverName : "Ana"}</p>
                </div>
                <div>
                  <p className="text-sm text-white/55 print:text-ink-muted">Niño</p>
                  <p className="text-2xl font-semibold">
                    {mounted ? profile.childName : "Lucas"} · {mounted ? (profile.childAge ?? "—") : 4} años
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/55 print:text-ink-muted">Condición registrada</p>
                  <p className="text-lg font-semibold">{mounted ? profile.conditionLabel : "Dermatitis atópica"}</p>
                </div>
              </div>
            </div>
          </div>

          {hasData && (
            <div className="mt-8 flex flex-wrap gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-accent-press active:scale-[0.98]"
              >
                <Printer size={18} weight="bold" />
                Imprimir
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-hairline-strong bg-cream-card px-6 py-3.5 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:border-accent/45 hover:text-accent active:scale-[0.98]"
              >
                <FilePdf size={18} weight="bold" />
                Descargar PDF
              </button>
              <button
                onClick={() => resetProfileData()}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-medium text-ink-muted transition hover:text-navy"
              >
                <ArrowClockwise size={16} weight="bold" />
                Reiniciar datos
              </button>
            </div>
          )}
        </div>

        {/* No montado aún → skeleton */}
        {!mounted && (
          <div className="relative">
            <div className="grid gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-32 w-full rounded-[var(--radius-card)]" />
              ))}
            </div>
            <Skeleton className="mt-6 h-80 w-full rounded-[var(--radius-card)]" />
          </div>
        )}

        {/* Empty state */}
        {mounted && logs.length === 0 && (
          <div className="relative flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-hairline-strong bg-cream-card p-10 text-center sm:p-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
              <ChartLineUp size={36} weight="duotone" className="text-accent" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold text-navy sm:text-3xl">
              Todavía no hay registros esta semana
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-ink-muted">
              Cuando registres los días de {profile.childName}, este reporte calculará
              el gráfico, las métricas y Calma Familiar a partir de tus datos reales.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => seedDemo()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-accent-press active:scale-[0.98]"
              >
                <Sparkle size={18} weight="bold" />
                Cargar datos de demo
              </button>
              <TactileButton href="/registro" variant="secondary" className="px-6 py-3.5 text-sm">
                Registrar un día
                <ArrowRight size={18} weight="bold" />
              </TactileButton>
            </div>
          </div>
        )}

        {/* Carga de narrativa */}
        {hasData && loading && (
          <div className="relative">
            <div className="grid gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-32 w-full rounded-[var(--radius-card)]" />
              ))}
            </div>
            <Skeleton className="mt-6 h-80 w-full rounded-[var(--radius-card)]" />
          </div>
        )}

        {hasData && !loading && (
          <div className="relative">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-[var(--radius-card)] border border-coral/40 bg-wash-peach/50 p-5">
                <Warning size={22} weight="duotone" className="shrink-0 text-coral" />
                <p className="text-sm leading-relaxed text-ink-muted">
                  El texto narrativo no se pudo generar, pero las métricas y el
                  gráfico de abajo se calcularon con tus registros reales.
                </p>
              </div>
            )}

            {/* Métricas */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
                <p className="text-sm font-medium text-ink-muted">Días registrados</p>
                <p className="mt-3 font-mono text-3xl font-semibold text-navy">{m.registeredDays}/7</p>
                <p className="mt-2 text-sm text-ink-muted">Últimos 7 días</p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-accent-soft p-5">
                <p className="text-sm font-medium text-navy/60">Comezón alta</p>
                <p className="mt-3 font-mono text-3xl font-semibold text-navy">
                  {m.highItchDays} día{m.highItchDays === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-sm text-navy/70">Registros de 7/10 o más</p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-wash-green p-5">
                <p className="text-sm font-medium text-navy/60">Sueño afectado</p>
                <p className="mt-3 font-mono text-3xl font-semibold text-navy">
                  {m.affectedSleepNights} noche{m.affectedSleepNights === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-sm text-navy/70">Reportadas como malas</p>
              </div>
              <div className="rounded-[var(--radius-card)] bg-wash-peach p-5">
                <p className="text-sm font-medium text-navy/60">Calma Familiar</p>
                <p className="mt-3 font-mono text-3xl font-semibold text-navy">{calma}/100</p>
                <p className="mt-2 text-sm text-navy/70">Claridad y continuidad</p>
              </div>
            </div>

            {/* Resumen + interpretación */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Resumen generado
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                  Lo importante de esta semana
                </h2>
                <p className="mt-5 leading-relaxed text-ink-muted">
                  {report?.resumenSemanal}
                </p>
                <div className="mt-6 rounded-[1.25rem] bg-cream p-5 ring-1 ring-inset ring-hairline">
                  <h3 className="font-semibold text-navy">¿Por qué este reporte ayuda?</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {profile.caregiverName} no tiene que recordar todo de memoria.
                    Puede llevar una secuencia clara de observaciones, preguntas y
                    posibles coincidencias para revisarlas con el dermatólogo.
                  </p>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] bg-navy p-6 text-white shadow-[var(--shadow-soft)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
                  Interpretación segura
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                  El reporte organiza, no concluye.
                </h2>
                <div className="mt-6 flex flex-col">
                  {safeInterpretation.map((item, i) => (
                    <div key={item.title} className={`py-4 ${i > 0 ? "border-t border-white/10" : ""}`}>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/65">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gráfico + sueño */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Evolución registrada
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                      Comezón reportada por día
                    </h2>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-ink-muted">
                    Escala registrada por la cuidadora. No representa medición clínica
                    ni severidad médica.
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                    <AreaChart data={week} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                      <defs>
                        <linearGradient id="itchColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6b5bd6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6b5bd6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e6d6bf" vertical={false} />
                      <XAxis dataKey="day" stroke="#9a93a6" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis domain={[0, 10]} stroke="#9a93a6" tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#dcd7ff", strokeWidth: 2 }} />
                      <Area
                        type="monotone"
                        dataKey="itch"
                        stroke="#6b5bd6"
                        strokeWidth={2.5}
                        fill="url(#itchColor)"
                        connectNulls
                        dot={{ r: 4, fill: "#6b5bd6", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#6b5bd6", stroke: "#fffcf7", strokeWidth: 2 }}
                        animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Sueño</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                  Noches registradas
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  {sleep.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between">
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
                <div className="mt-6 rounded-[1.25rem] bg-wash-green p-5">
                  <h3 className="font-semibold text-navy">Observación para la cuidadora</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy/80">
                    El sueño aparece como una dimensión importante del seguimiento
                    familiar. Este dato puede ayudar a explicar cómo se vivieron los
                    brotes en casa.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="mt-6 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Bitácora semanal
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                    Registros de la semana
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-ink-muted">
                  Esta tabla organiza los datos cotidianos sin asumir causas ni emitir
                  conclusiones médicas.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-ink-faint">
                      <th className="py-4 pr-4 font-medium">Día</th>
                      <th className="py-4 pr-4 font-medium">Comezón</th>
                      <th className="py-4 pr-4 font-medium">Sueño</th>
                      <th className="py-4 pr-4 font-medium">Posibles factores</th>
                      <th className="py-4 pr-4 font-medium">Rutina indicada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.map((item) => (
                      <tr key={item.date} className={`border-b border-hairline/70 ${item.hasData ? "text-ink-muted" : "text-ink-faint"}`}>
                        <td className="py-4 pr-4 font-semibold text-navy">{item.day}</td>
                        <td className="py-4 pr-4 font-mono">{item.itch ?? "—"}{item.itch != null ? "/10" : ""}</td>
                        <td className="py-4 pr-4">{item.sleep}</td>
                        <td className="py-4 pr-4">{item.triggers}</td>
                        <td className="py-4 pr-4">{item.routine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patrones / preguntas / observaciones */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {[
                { Icon: Path, wash: "bg-accent-soft", title: "Posibles patrones observados", items: patternsList, itemWash: "bg-cream ring-1 ring-inset ring-hairline" },
                { Icon: ChatCircleDots, wash: "bg-wash-green", title: "Preguntas para el dermatólogo", items: questionsList, itemWash: "bg-wash-green/60" },
                { Icon: Eye, wash: "bg-wash-peach", title: "Observaciones visuales", items: obsList, itemWash: "bg-wash-peach/60", thumbs: observations.filter((o) => o.thumb).slice(0, 4).map((o) => o.thumb) },
              ].map((col) => (
                <div key={col.title} className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-[1rem] ${col.wash}`}>
                    <col.Icon size={24} weight="duotone" className="text-navy" />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-navy">{col.title}</h2>
                  {col.thumbs && col.thumbs.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {col.thumbs.map((t, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={t}
                          alt={`Foto registrada ${i + 1}`}
                          className="h-14 w-14 rounded-[0.6rem] object-cover ring-1 ring-hairline"
                        />
                      ))}
                    </div>
                  )}
                  <ul className="mt-5 flex flex-col gap-3">
                    {col.items?.length ? (
                      col.items.map((entry, index) => (
                        <li key={index} className={`rounded-[1rem] p-4 text-sm leading-relaxed text-navy/80 ${col.itemWash}`}>
                          {entry}
                        </li>
                      ))
                    ) : (
                      <li className="rounded-[1rem] bg-cream p-4 text-sm text-ink-faint ring-1 ring-inset ring-hairline">
                        Aún sin datos esta semana.
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            {/* Cierre */}
            <div className="print-area mt-6 rounded-[var(--radius-card)] bg-navy p-8 text-white shadow-[var(--shadow-soft)] sm:p-10 print:bg-white print:text-navy print:shadow-none print:ring-1 print:ring-hairline">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft print:text-accent">
                    Cierre del reporte
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold leading-tight lg:text-4xl">
                    {profile.caregiverName} llega a consulta con menos incertidumbre.
                  </h2>
                </div>
                <p className="leading-relaxed text-white/75 print:text-ink-muted">
                  Este reporte transforma una semana emocionalmente pesada en una
                  conversación más clara. PielCalma organiza la información cotidiana;
                  la interpretación médica corresponde al profesional de salud.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <SafeDisclaimer />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
              <TactileButton href="/calma" variant="secondary" className="px-6 py-3.5 text-sm">
                <ArrowLeft size={18} weight="bold" />
                Volver al Modo Calma
              </TactileButton>
              <TactileButton href="/observador" variant="primary" className="px-6 py-3.5 text-sm">
                Ver Observador Visual
                <ArrowRight size={18} weight="bold" />
              </TactileButton>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
