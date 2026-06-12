"use client";

import { useEffect, useState } from "react";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { useStore, addLog, todayISO } from "@/lib/store";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Skeleton,
  TactileButton,
} from "@/components/motion";
import {
  NotePencil,
  Sparkle,
  HandHeart,
  ChartLineUp,
  ArrowRight,
  ArrowUpRight,
  Warning,
} from "@/components/icons";

const affectedAreas = ["Cuello", "Brazos", "Piernas", "Rostro", "Pliegues"];
const triggerOptions = [
  "Calor",
  "Sudor",
  "Polvo",
  "Detergente nuevo",
  "Comida nueva",
  "Estrés",
  "Mascota",
];

const sidebarNotes = [
  {
    Icon: Sparkle,
    title: "Lo esencial",
    text: "Sueño, comezón y posibles factores. Nada más. Sin complicar a Ana.",
    wash: "bg-accent-soft",
  },
  {
    Icon: HandHeart,
    title: "Lo humano",
    text: "También se registra cómo se siente la cuidadora, porque la carga mental importa.",
    wash: "bg-wash-green",
  },
  {
    Icon: ChartLineUp,
    title: "Lo útil",
    text: "Cada registro alimenta el reporte médico semanal.",
    wash: "bg-wash-peach",
  },
];

const selectClass =
  "w-full rounded-[var(--radius-control)] border border-hairline-strong bg-cream-card px-4 py-3 text-sm text-navy outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft/55";

const WD = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
}

export default function RegistroPage() {
  const [itchLevel, setItchLevel] = useState(8);
  const [sleepQuality, setSleepQuality] = useState("malo");
  const [routineStatus, setRoutineStatus] = useState("parcial");
  const [caregiverEmotion, setCaregiverEmotion] = useState("preocupada");
  const [selectedAreas, setSelectedAreas] = useState(["Cuello", "Brazos"]);
  const [selectedTriggers, setSelectedTriggers] = useState(["Calor", "Sudor"]);
  const [notes, setNotes] = useState(
    "Lucas se rascó durante la noche y durmió interrumpido."
  );
  const [nutrition, setNutrition] = useState("equilibrada");
  const [physicalActivity, setPhysicalActivity] = useState("activa");
  const [stress, setStress] = useState("algo");
  const [logDate, setLogDate] = useState("");

  const [summary, setSummary] = useState(null);
  const [savedDate, setSavedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { profile, logs } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setLogDate(todayISO());
  }, []);
  const child = mounted ? profile.childName : "Lucas";
  const caregiver = mounted ? profile.caregiverName : "Ana";

  function toggleArea(area) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((i) => i !== area) : [...prev, area]
    );
  }

  function toggleTrigger(trigger) {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((i) => i !== trigger)
        : [...prev, trigger]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const date = logDate || todayISO();
    const entry = {
      itchLevel,
      sleepQuality,
      routineStatus,
      caregiverEmotion,
      nutrition,
      physicalActivity,
      stress,
      areas: selectedAreas,
      triggers: selectedTriggers,
      notes,
      date,
    };

    // Persiste el registro real ANTES de pedir el resumen (no se pierde si falla la IA).
    addLog(entry);
    setSavedDate(date);
    setLoading(true);
    setSummary(null);
    setError(false);

    try {
      const response = await fetch("/api/calm-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, emotion: caregiverEmotion }),
      });
      if (!response.ok) throw new Error("bad status");
      const data = await response.json();
      setSummary(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-cream text-ink">
      <BrandNav active="registro" />

      <section className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-wash-green/55 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-wash-peach/60 blur-3xl"
        />

        {/* Encabezado */}
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-4 py-2 text-sm font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Registro inteligente · 1 minuto al día
            </span>
            <h1 className="font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl">
              Que {caregiver} no tenga que recordarlo todo de memoria.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Registra lo importante del brote de {child}: comezón, sueño, zonas,
              posibles factores y cómo se siente {caregiver}. PielCalma convierte
              esos datos en un resumen claro y seguro.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Bitácora de hoy
              </p>
              <div className="mt-5 flex flex-col gap-3">
                {sidebarNotes.map((note) => (
                  <div key={note.title} className="flex gap-3 rounded-[1.25rem] bg-cream p-4 ring-1 ring-inset ring-hairline">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] ${note.wash}`}>
                      <note.Icon size={18} weight="duotone" className="text-navy" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">{note.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {note.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Formulario + barra lateral */}
        <div className="relative mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-7 flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Registro de brote
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-navy sm:text-3xl">
                    ¿Qué ocurrió hoy con {child}?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    Esta información no interpreta clínicamente el brote. Solo
                    ordena observaciones cotidianas para dar seguimiento.
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-center rounded-[1.25rem] bg-cream p-4 text-center ring-1 ring-inset ring-hairline md:flex">
                  <NotePencil size={26} weight="duotone" className="text-accent" />
                  <p className="mt-2 text-xs font-medium text-ink-muted">
                    Menos de 1 min
                  </p>
                </div>
              </div>

              {/* Día del registro */}
              <div className="mb-7 rounded-[1.5rem] bg-cream p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="logdate" className="text-sm font-semibold text-navy">
                      Día del registro
                    </label>
                    <input
                      id="logdate"
                      type="date"
                      value={logDate}
                      max={mounted ? todayISO() : undefined}
                      onChange={(e) => setLogDate(e.target.value)}
                      className={`${selectClass} w-auto`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["Hoy", 0],
                      ["Ayer", -1],
                      ["-2", -2],
                      ["-3", -3],
                    ].map(([lbl, off]) => {
                      const d = mounted ? todayISO(off) : "";
                      const on = logDate === d;
                      return (
                        <button
                          type="button"
                          key={lbl}
                          onClick={() => setLogDate(d)}
                          className={`rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
                            on
                              ? "bg-accent text-white"
                              : "border border-hairline-strong bg-cream-card text-ink-muted hover:border-accent/40 hover:text-navy"
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                  Puedes registrar días anteriores; cada registro se ubica en su
                  fecha dentro del reporte.
                </p>
              </div>

              {/* Comezón */}
              <div className="mb-7 rounded-[1.5rem] bg-cream p-5">
                <div className="mb-4 flex items-center justify-between">
                  <label htmlFor="itch" className="block font-semibold text-navy">
                    Nivel de comezón reportado
                  </label>
                  <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-sm font-semibold text-accent">
                    {itchLevel}/10
                  </span>
                </div>
                <input
                  id="itch"
                  type="range"
                  min="1"
                  max="10"
                  value={itchLevel}
                  onChange={(e) => setItchLevel(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "var(--accent)" }}
                />
                <div className="mt-3 flex justify-between text-xs font-medium text-ink-faint">
                  <span>Menor incomodidad</span>
                  <span>Mayor incomodidad</span>
                </div>
              </div>

              {/* Sueño + rutina */}
              <div className="mb-7 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="sleep" className="text-sm font-semibold text-navy">
                    Calidad de sueño
                  </label>
                  <select
                    id="sleep"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value)}
                    className={selectClass}
                  >
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="malo">Malo</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="routine" className="text-sm font-semibold text-navy">
                    Rutina indicada
                  </label>
                  <select
                    id="routine"
                    value={routineStatus}
                    onChange={(e) => setRoutineStatus(e.target.value)}
                    className={selectClass}
                  >
                    <option value="completa">Completa</option>
                    <option value="parcial">Parcial</option>
                    <option value="no realizada">No realizada</option>
                  </select>
                </div>
              </div>

              {/* Hábitos del día */}
              <div className="mb-7 rounded-[1.5rem] bg-cream p-5">
                <p className="mb-4 text-sm font-semibold text-navy">Hábitos del día</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nutrition" className="text-xs font-medium text-ink-muted">
                      Nutrición
                    </label>
                    <select id="nutrition" value={nutrition} onChange={(e) => setNutrition(e.target.value)} className={selectClass}>
                      <option value="equilibrada">Equilibrada</option>
                      <option value="irregular">Irregular</option>
                      <option value="algo nuevo">Algo nuevo</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="activity" className="text-xs font-medium text-ink-muted">
                      Actividad física
                    </label>
                    <select id="activity" value={physicalActivity} onChange={(e) => setPhysicalActivity(e.target.value)} className={selectClass}>
                      <option value="tranquila">Tranquila</option>
                      <option value="activa">Activa</option>
                      <option value="mucho sudor">Mucho sudor</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="stress" className="text-xs font-medium text-ink-muted">
                      Estrés
                    </label>
                    <select id="stress" value={stress} onChange={(e) => setStress(e.target.value)} className={selectClass}>
                      <option value="calmado">Calmado</option>
                      <option value="algo">Algo</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                  Sueño, nutrición, actividad física y estrés ayudan a notar
                  patrones del día a día.
                </p>
              </div>

              {/* Zonas */}
              <div className="mb-7 flex flex-col gap-3">
                <label className="text-sm font-semibold text-navy">
                  Zonas observadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {affectedAreas.map((area) => {
                    const on = selectedAreas.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        onClick={() => toggleArea(area)}
                        aria-pressed={on}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.97] ${
                          on
                            ? "bg-navy text-white"
                            : "border border-hairline-strong bg-cream-card text-ink-muted hover:border-accent/40 hover:text-navy"
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Factores */}
              <div className="mb-7 flex flex-col gap-3">
                <label className="text-sm font-semibold text-navy">
                  Posibles factores observados
                </label>
                <div className="flex flex-wrap gap-2">
                  {triggerOptions.map((trigger) => {
                    const on = selectedTriggers.includes(trigger);
                    return (
                      <button
                        type="button"
                        key={trigger}
                        onClick={() => toggleTrigger(trigger)}
                        aria-pressed={on}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.97] ${
                          on
                            ? "bg-accent text-white"
                            : "border border-hairline-strong bg-cream-card text-ink-muted hover:border-accent/40 hover:text-navy"
                        }`}
                      >
                        {trigger}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs leading-relaxed text-ink-faint">
                  Estos factores son observaciones de Ana. No confirman causas
                  médicas.
                </p>
              </div>

              {/* Emoción */}
              <div className="mb-7 flex flex-col gap-2">
                <label htmlFor="emotion" className="text-sm font-semibold text-navy">
                  ¿Cómo se siente {caregiver}?
                </label>
                <select
                  id="emotion"
                  value={caregiverEmotion}
                  onChange={(e) => setCaregiverEmotion(e.target.value)}
                  className={selectClass}
                >
                  <option value="tranquila">Tranquila</option>
                  <option value="con dudas">Con dudas</option>
                  <option value="preocupada">Preocupada</option>
                  <option value="agotada">Agotada</option>
                </select>
              </div>

              {/* Nota */}
              <div className="mb-7 flex flex-col gap-2">
                <label htmlFor="notes" className="text-sm font-semibold text-navy">
                  Nota de Ana
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  className={`${selectClass} resize-none`}
                  placeholder="Ejemplo: Lucas se rascó más después de jugar y sudar..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-accent-press active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? "Ordenando registro…" : "Guardar y generar resumen"}
                {!loading && <ArrowRight size={18} weight="bold" />}
              </button>
            </form>
          </Reveal>

          {/* Barra lateral */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.05} className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Caso demo
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-navy">
                Ana y Lucas
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-ink-muted">
                <p>
                  <strong className="text-navy">Ana</strong> vive en Lima y cuida
                  a Lucas, un niño de 4 años con dermatitis atópica diagnosticada.
                </p>
                <p>
                  En los brotes, su mayor problema no es falta de información,
                  sino la incertidumbre: qué observar, qué recordar y cómo
                  explicarlo después.
                </p>
                <p>
                  PielCalma convierte ese momento en una bitácora clara para la
                  consulta.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="rounded-[var(--radius-card)] bg-navy p-6 text-white shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
                Ritual de seguimiento
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold">
                Registrar no es vigilar. Es liberar memoria.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/75">
                Cada dato registrado reduce la carga mental de Ana y prepara una
                conversación más concreta con el dermatólogo.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold text-navy">Siguiente paso</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Después de guardar el registro, Ana puede subir una foto para
                generar una observación visual descriptiva.
              </p>
              <TactileButton href="/observador" variant="secondary" className="mt-5 px-5 py-3 text-sm">
                Ir al Observador Visual
                <ArrowUpRight size={16} weight="bold" />
              </TactileButton>
            </Reveal>

            {/* Registros recientes — ver cómo se manejan los días */}
            <Reveal delay={0.2} className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy">Registros recientes</h3>
                {mounted && (
                  <span className="text-xs text-ink-muted">{logs.length} en total</span>
                )}
              </div>
              {mounted && logs.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {logs.slice(0, 5).map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center justify-between rounded-[1rem] bg-cream px-4 py-2.5 text-sm ring-1 ring-inset ring-hairline"
                    >
                      <span className="font-medium text-navy">{fmtDate(l.date)}</span>
                      <span className="flex items-center gap-3 text-ink-muted">
                        <span className="font-mono">{l.itchLevel}/10</span>
                        <span className="capitalize">{l.sleepQuality}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-faint">
                  Aún no hay registros. Guarda el primero.
                </p>
              )}
            </Reveal>

            <SafeDisclaimer />
          </div>
        </div>

        {/* Carga */}
        {loading && (
          <div className="relative mt-8 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-9 w-2/3" />
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-28 w-full rounded-[1.25rem]" />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="relative mt-8 flex flex-col gap-4 rounded-[var(--radius-card)] border border-coral/40 bg-wash-peach/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex gap-3">
              <Warning size={24} weight="duotone" className="mt-0.5 shrink-0 text-coral" />
              <div>
                <p className="font-semibold text-navy">
                  No pudimos generar el resumen ahora mismo.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Tu registro sigue completo. Puedes reintentar sin perder lo que
                  anotaste.
                </p>
              </div>
            </div>
            <TactileButton
              onClick={handleSubmit}
              variant="secondary"
              className="shrink-0 px-5 py-3 text-sm"
            >
              Reintentar
            </TactileButton>
          </div>
        )}

        {/* Resumen */}
        {summary && !loading && (
          <div className="relative mt-8 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Registro guardado{savedDate ? ` · ${fmtDate(savedDate)}` : ""}
              </p>
              {mounted && (
                <span className="rounded-full bg-wash-green px-3 py-1 text-xs font-medium text-navy">
                  {logs.length} registro{logs.length === 1 ? "" : "s"} guardado
                  {logs.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <h2 className="mt-3 max-w-4xl font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">
              {summary.mensajeEmpatico}
            </h2>

            <Stagger className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StaggerItem className="rounded-[1.25rem] bg-accent-soft p-5">
                <p className="text-sm font-medium text-navy/60">Comezón</p>
                <p className="mt-2 font-mono text-3xl font-semibold text-navy">
                  {itchLevel}/10
                </p>
              </StaggerItem>
              <StaggerItem className="rounded-[1.25rem] bg-wash-green p-5">
                <p className="text-sm font-medium text-navy/60">Sueño</p>
                <p className="mt-2 text-2xl font-semibold capitalize text-navy">
                  {sleepQuality}
                </p>
              </StaggerItem>
              <StaggerItem className="rounded-[1.25rem] bg-wash-peach p-5">
                <p className="text-sm font-medium text-navy/60">Rutina</p>
                <p className="mt-2 text-2xl font-semibold capitalize text-navy">
                  {routineStatus}
                </p>
              </StaggerItem>
              <StaggerItem className="rounded-[1.25rem] bg-cream p-5 ring-1 ring-inset ring-hairline">
                <p className="text-sm font-medium text-navy/60">Ana</p>
                <p className="mt-2 text-2xl font-semibold capitalize text-navy">
                  {caregiverEmotion}
                </p>
              </StaggerItem>
            </Stagger>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {[
                { t: "Zonas observadas", v: selectedAreas.join(", ") || "Sin selección" },
                { t: "Posibles factores", v: selectedTriggers.join(", ") || "Sin selección" },
                { t: "Nota de Ana", v: notes || "Sin nota adicional" },
              ].map((b) => (
                <div key={b.t} className="rounded-[1.25rem] bg-cream p-5 ring-1 ring-inset ring-hairline">
                  <h3 className="font-semibold text-navy">{b.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.25rem] bg-accent-soft p-5">
                <h3 className="font-semibold text-navy">
                  Posible coincidencia observada
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/80">
                  {summary.posibleCoincidencia}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-wash-green p-5">
                <h3 className="font-semibold text-navy">
                  Pregunta sugerida para el dermatólogo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/80">
                  {summary.preguntaDermatologo}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <SafeDisclaimer compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TactileButton href="/observador" variant="primary" className="px-6 py-3.5 text-sm">
                Continuar al Observador Visual
                <ArrowRight size={18} weight="bold" />
              </TactileButton>
              <TactileButton href="/reporte" variant="secondary" className="px-6 py-3.5 text-sm">
                Ver reporte semanal
                <ArrowUpRight size={18} weight="bold" />
              </TactileButton>
            </div>
          </div>
        )}

        <div className="relative mt-8">
          <SafeDisclaimer />
        </div>
      </section>
    </main>
  );
}
