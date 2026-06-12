"use client";

import { useEffect, useState } from "react";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { useStore, addCalmaEvent } from "@/lib/store";
import { calmaFamiliar, anticipations } from "@/lib/aggregate";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Skeleton,
  TactileButton,
} from "@/components/motion";
import {
  Wind,
  Question,
  Waves,
  Moon,
  ArrowRight,
  ArrowUpRight,
  Warning,
  Sparkle,
} from "@/components/icons";

const emotions = [
  {
    id: "tranquila",
    label: "Estoy tranquila",
    Icon: Wind,
    description: "Quiero registrar cómo va Lucas hoy.",
    wash: "bg-wash-green",
  },
  {
    id: "con dudas",
    label: "Tengo dudas",
    Icon: Question,
    description: "No sé bien qué observar o anotar.",
    wash: "bg-accent-soft",
  },
  {
    id: "preocupada",
    label: "Estoy preocupada",
    Icon: Waves,
    description: "Siento que el brote me está sobrepasando.",
    wash: "bg-wash-peach",
  },
  {
    id: "agotada",
    label: "Estoy agotada",
    Icon: Moon,
    description: "Fue una noche difícil y necesito ordenar todo.",
    wash: "bg-coral/20",
  },
];

const steps = [
  {
    n: "01",
    title: "Nombrar la emoción",
    text: "Ana reconoce si está tranquila, con dudas, preocupada o agotada.",
  },
  {
    n: "02",
    title: "Ordenar lo observado",
    text: "La IA toma sueño, comezón y posibles factores para crear un resumen seguro.",
  },
  {
    n: "03",
    title: "Preparar la consulta",
    text: "La app sugiere preguntas útiles para conversar con el dermatólogo.",
  },
];

export default function CalmaPage() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { logs, observations, calmaEvents, profile } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const caregiver = mounted ? profile.caregiverName : "Ana";
  const child = mounted ? profile.childName : "Lucas";
  const calma = mounted ? calmaFamiliar(logs, observations, calmaEvents) : 72;
  const antic = mounted ? anticipations(logs) : [];

  async function handleEmotionClick(emotion) {
    setSelectedEmotion(emotion);
    // Registra el check-in emocional (alimenta Calma Familiar).
    addCalmaEvent(emotion);
    setLoading(true);
    setSummary(null);
    setError(false);

    // Usa el último registro real si existe.
    const last = logs[0];

    try {
      const response = await fetch("/api/calm-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion,
          itchLevel: last?.itchLevel ?? 0,
          sleepQuality: last?.sleepQuality ?? "regular",
          triggers: last?.triggers ?? [],
          areas: last?.areas ?? [],
          notes: last?.notes ?? "",
        }),
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
      <BrandNav active="calma" />

      <section className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-accent-soft/45 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-wash-green/55 blur-3xl"
        />

        {/* Encabezado + indicador */}
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-4 py-2 text-sm font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Modo Calma · Primer paso del cuidado
            </span>
            <h1 className="font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl">
              Respira, {caregiver}.
              <br />
              Vamos a ordenar la noche de {child}.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Cuando un brote aparece, PielCalma no responde con diagnósticos.
              Transforma la preocupación en datos claros, preguntas útiles y una
              conversación mejor preparada con el dermatólogo.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Calma Familiar
              </p>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="font-mono text-6xl font-semibold leading-none text-navy">
                  {calma}
                </span>
                <span className="pb-2 text-ink-muted">/100</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Este indicador no mide la enfermedad. Mide continuidad de
                registro, claridad y preparación para la consulta.
              </p>
              <div className="mt-5 flex gap-3 rounded-[1.25rem] bg-wash-green p-4">
                <Sparkle size={20} weight="duotone" className="mt-0.5 shrink-0 text-navy" />
                <div>
                  <p className="text-sm font-semibold text-navy">Ritual de hoy</p>
                  <p className="mt-1 text-sm leading-relaxed text-navy/70">
                    Registrar sueño, comezón y posibles factores en menos de un
                    minuto.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Selección de emoción + cómo funciona */}
        <div className="relative mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              ¿Cómo estás viviendo este brote?
            </h2>
            <p className="mt-3 text-ink-muted">
              Elige cómo te sientes ahora. La app adaptará el mensaje para
              ayudarte a ordenar la situación sin juzgarte.
            </p>

            <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
              {emotions.map((emotion) => {
                const isActive = selectedEmotion === emotion.id;
                return (
                  <StaggerItem key={emotion.id}>
                    <button
                      onClick={() => handleEmotionClick(emotion.id)}
                      aria-pressed={isActive}
                      className={`group h-full w-full rounded-[1.4rem] border p-5 text-left transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 active:scale-[0.98] ${
                        isActive
                          ? "border-accent bg-cream-card ring-4 ring-accent-soft/60"
                          : "border-hairline bg-cream hover:shadow-[var(--shadow-soft)]"
                      }`}
                    >
                      <span
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-[1.1rem] ${emotion.wash}`}
                      >
                        <emotion.Icon size={26} weight="duotone" className="text-navy" />
                      </span>
                      <h3 className="text-lg font-semibold text-navy">
                        {emotion.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {emotion.description}
                      </p>
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>

          <Reveal delay={0.1} className="rounded-[var(--radius-card)] bg-navy p-6 text-white shadow-[var(--shadow-soft)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Cómo funciona
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]">
              La app no intenta resolverlo todo. Primero calma, luego ordena.
            </h2>
            <div className="mt-6 flex flex-col">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  className={`flex gap-4 py-4 ${i > 0 ? "border-t border-white/10" : ""}`}
                >
                  <span className="font-mono text-sm text-white/40">{step.n}</span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="relative mt-8 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-9 w-3/4" />
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {[0, 1, 2].map((k) => (
                <Skeleton key={k} className="h-44 w-full rounded-[1.25rem]" />
              ))}
            </div>
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div className="relative mt-8 flex flex-col gap-4 rounded-[var(--radius-card)] border border-coral/40 bg-wash-peach/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex gap-3">
              <Warning size={24} weight="duotone" className="mt-0.5 shrink-0 text-coral" />
              <div>
                <p className="font-semibold text-navy">
                  No pudimos generar el resumen ahora mismo.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Puedes intentarlo de nuevo o continuar registrando lo
                  observado; tu información no se pierde.
                </p>
              </div>
            </div>
            <TactileButton
              onClick={() => handleEmotionClick(selectedEmotion)}
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Resumen generado
            </p>
            <h2 className="mt-3 max-w-4xl font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">
              {summary.mensajeEmpatico}
            </h2>

            <Stagger className="mt-6 grid gap-5 lg:grid-cols-3">
              <StaggerItem className="rounded-[1.5rem] bg-cream p-5">
                <h3 className="font-semibold text-navy">Datos ordenados</h3>
                <ul className="mt-4 space-y-3">
                  {summary.datosOrdenados?.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-[1rem] bg-cream-card px-4 py-3 text-sm leading-relaxed text-ink-muted ring-1 ring-inset ring-hairline"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>

              <StaggerItem className="rounded-[1.5rem] bg-accent-soft p-5">
                <h3 className="font-semibold text-navy">Posible coincidencia</h3>
                <p className="mt-4 text-sm leading-relaxed text-navy/80">
                  {summary.posibleCoincidencia}
                </p>
              </StaggerItem>

              <StaggerItem className="rounded-[1.5rem] bg-wash-green p-5">
                <h3 className="font-semibold text-navy">Pregunta para consulta</h3>
                <p className="mt-4 text-sm leading-relaxed text-navy/80">
                  {summary.preguntaDermatologo}
                </p>
              </StaggerItem>
            </Stagger>

            {antic.length > 0 && (
              <div className="mt-6 flex gap-3 rounded-[1.5rem] bg-accent-soft/40 p-5 ring-1 ring-inset ring-accent/20">
                <Sparkle size={20} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Para los próximos días
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-navy/80">
                    {antic[0]}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <SafeDisclaimer compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TactileButton href="/registro" variant="primary" className="px-6 py-3.5 text-sm">
                Registrar brote
                <ArrowRight size={18} weight="bold" />
              </TactileButton>
              <TactileButton href="/observador" variant="secondary" className="px-6 py-3.5 text-sm">
                Ir al Observador Visual
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
