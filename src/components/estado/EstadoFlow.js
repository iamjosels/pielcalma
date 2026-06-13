"use client";

import { useEffect, useState } from "react";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { useStore, addLog, addObservation, todayISO } from "@/lib/store";
import { requestAI } from "@/lib/requestAI";
import { useMedicalPlan } from "@/lib/plan";
import { planToText } from "@/lib/planText";
import { memoryToText, addMemoryFacts } from "@/lib/memory";
import { prepareImage } from "@/lib/imageSignal";
import { metrics, calmaFamiliar, dayStatus } from "@/lib/aggregate";
import CameraCapture from "@/components/CameraCapture";
import Mascot from "@/components/Mascot";
import { Reveal, Stagger, StaggerItem, Skeleton } from "@/components/motion";
import {
  Camera,
  UploadSimple,
  CheckCircle,
  Check,
  ForkKnife,
  Cloud,
  TShirt,
  Waves,
  HandHeart,
  Sparkle,
  ChatCircleDots,
  Warning,
  Smiley,
  SmileyMeh,
  SmileySad,
  ArrowRight,
} from "@/components/icons";

const INFLUENCES = [
  { id: "alimentacion", label: "Alimentación", Icon: ForkKnife, wash: "bg-wash-green" },
  { id: "entorno", label: "Entorno", Icon: Cloud, wash: "bg-accent-soft" },
  { id: "ropa", label: "Ropa", Icon: TShirt, wash: "bg-accent-soft" },
  { id: "estres", label: "Estrés", Icon: Waves, wash: "bg-amber-soft" },
];

const VALOR = [
  { Icon: HandHeart, label: "Tranquilidad", desc: "Hoy quedó registrado y ordenado.", wash: "bg-wash-green" },
  { Icon: Sparkle, label: "Aprendizaje", desc: "Sumo este día a tus patrones.", wash: "bg-accent-soft" },
  { Icon: ChatCircleDots, label: "Feedback", desc: "Una lectura segura, sin diagnóstico.", wash: "bg-amber-soft" },
];

const WD = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
}
function sleepEnum(score) {
  return score >= 7 ? "bueno" : score >= 4 ? "regular" : "malo";
}
function moodIcon(log) {
  const st = dayStatus(log);
  if (st === "ambar") return SmileySad;
  if (log && log.itchLevel >= 4) return SmileyMeh;
  return Smiley;
}

export default function EstadoFlow() {
  const { profile, logs, observations, calmaEvents } = useStore();
  const medicalPlan = useMedicalPlan();
  const [mounted, setMounted] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const [influences, setInfluences] = useState({});
  const [itchLevel, setItchLevel] = useState(4);
  const [sleepScore, setSleepScore] = useState(6);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const child = mounted ? profile.childName : "Lucas";

  function applyFile(file) {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }
  function handleUpload(e) {
    applyFile(e.target.files?.[0]);
  }
  function toggleInfluence(id) {
    setInfluences((p) => ({ ...p, [id]: !p[id] }));
  }

  async function handleSave() {
    setLoading(true);
    setError(false);
    setResult(null);

    const date = todayISO();
    const triggers = [];
    if (influences.entorno) triggers.push("Polvo");
    if (influences.ropa) triggers.push("Detergente nuevo");
    const nutrition = influences.alimentacion ? "algo nuevo" : "equilibrada";
    const stress = influences.estres ? "alto" : "algo";
    const sleepQuality = sleepEnum(sleepScore);

    const entry = {
      itchLevel,
      sleepQuality,
      routineStatus: "completa",
      caregiverEmotion: "tranquila",
      nutrition,
      physicalActivity: "tranquila",
      stress,
      areas: [],
      triggers,
      notes,
      date,
    };

    // Persiste antes de pedir IA (no se pierde si falla)
    addLog(entry);

    // Foto (opcional) → observación visual
    if (photoFile) {
      try {
        const { redness, brightness, send, thumb } = await prepareImage(photoFile);
        const prev = observations[0];
        const deltaPct =
          prev && prev.redness ? Math.round(((redness - prev.redness) / prev.redness) * 100) : null;
        const obs = await requestAI("visual-observation", {
          imageName: photoFile.name || "estado.jpg",
          redness,
          brightness,
          hasPrevious: Boolean(prev),
          deltaPct,
          imageData: send,
        });
        addObservation({ ...obs, redness, brightness, imageName: photoFile.name || "estado.jpg", thumb });
      } catch {
        /* la foto es opcional; seguimos */
      }
    }

    // Aprendizaje (fire-and-forget): la IA se nutre del registro
    const learnText = `${notes} ${triggers.join(", ")} ${nutrition} ${stress === "alto" ? "estrés alto" : ""}`.trim();
    if (learnText) {
      requestAI("learn", { text: learnText, memory: memoryToText() })
        .then((r) => r?.facts && addMemoryFacts(r.facts))
        .catch(() => {});
    }

    try {
      const data = await requestAI("calm-summary", {
        ...entry,
        emotion: "tranquila",
        plan: planToText(medicalPlan),
      });
      setResult(data);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const m = mounted ? metrics(logs) : { registeredDays: 0, highItchDays: 0, affectedSleepNights: 0 };
  const calma = mounted ? calmaFamiliar(logs, observations, calmaEvents) : 0;
  const recent = mounted ? logs.slice(0, 4) : [];
  const headline = result
    ? itchLevel >= 7
      ? "Hoy fue un día más intenso"
      : "Todo dentro de lo esperado"
    : "";

  return (
    <div className="mx-auto w-full max-w-2xl px-1 pb-10 pt-1 sm:px-4">
      {/* Burbuja de la mascota */}
      <Reveal className="flex items-start gap-3">
        <Mascot size={46} mood="happy" />
        <div className="flex-1 rounded-[1.3rem] rounded-tl-md border border-hairline bg-cream-card px-4 py-3 shadow-[var(--shadow-card)]">
          <p className="text-sm leading-relaxed text-ink">
            Vamos a revisarlo juntas. Cuéntame cómo estuvo {child} hoy. 💚
          </p>
        </div>
      </Reveal>

      {/* RESULTADO (tras guardar) */}
      {loading && (
        <div className="mt-5 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-8 w-2/3" />
          <Skeleton className="mt-4 h-20 w-full rounded-[1.25rem]" />
        </div>
      )}

      {error && !loading && (
        <div className="mt-5 flex flex-col gap-3 rounded-[var(--radius-card)] border border-danger/40 bg-danger-soft/50 p-5">
          <div className="flex gap-3">
            <Warning size={22} weight="duotone" className="mt-0.5 shrink-0 text-danger" />
            <p className="text-sm leading-relaxed text-navy">
              Tu registro quedó guardado, pero no pude generar la lectura ahora mismo.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="rounded-full border border-hairline-strong bg-cream-card px-5 py-3 text-sm font-semibold text-navy active:scale-[0.98]"
          >
            Reintentar
          </button>
        </div>
      )}

      {result && !loading && (
        <Reveal className="mt-5 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <Mascot size={48} mood={itchLevel >= 7 ? "neutral" : "happy"} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Resultado</p>
              <h2 className="font-display text-xl font-bold leading-tight text-navy">{headline}</h2>
            </div>
          </div>
          <p className="mt-3 text-[0.97rem] leading-relaxed text-ink">{result.mensajeEmpatico}</p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-[1.3rem] bg-accent-soft p-4">
              <h3 className="text-sm font-semibold text-navy">Posible coincidencia</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/80">{result.posibleCoincidencia}</p>
            </div>
            <div className="rounded-[1.3rem] bg-wash-green p-4">
              <h3 className="text-sm font-semibold text-navy">Pregunta para tu dermatólogo</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/80">{result.preguntaDermatologo}</p>
            </div>
          </div>

          {/* Valor generado */}
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Valor de hoy</p>
          <Stagger className="mt-2.5 grid grid-cols-3 gap-2.5">
            {VALOR.map((v) => (
              <StaggerItem key={v.label} className={`rounded-[1.2rem] ${v.wash} p-3 text-center`}>
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/70">
                  <v.Icon size={18} weight="duotone" className="text-navy" />
                </span>
                <p className="mt-2 text-xs font-bold text-navy">{v.label}</p>
                <p className="mt-0.5 text-[0.66rem] leading-tight text-navy/70">{v.desc}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-4">
            <SafeDisclaimer compact />
          </div>
        </Reveal>
      )}

      {/* 1. Foto de la piel */}
      <Reveal className="mt-5 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="font-display text-base font-bold text-navy">1. Foto de la piel</p>
        <p className="mt-0.5 text-sm text-ink-muted">Toma una foto de la zona (opcional).</p>

        {previewUrl ? (
          <div className="mt-3">
            <div className="overflow-hidden rounded-[1.4rem] border border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Foto de la piel" className="h-60 w-full object-cover" />
            </div>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-wash-green px-3 py-1.5 text-xs font-semibold text-navy">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              Foto capturada
            </p>
          </div>
        ) : (
          <div className="mt-3 flex gap-2.5">
            <button
              onClick={() => setShowCamera(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              <Camera size={18} weight="bold" />
              Cámara
            </button>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-hairline-strong bg-cream-card px-4 py-3.5 text-sm font-semibold text-navy transition active:scale-[0.98]">
              <UploadSimple size={17} weight="bold" className="text-accent" />
              Galería
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        )}
      </Reveal>

      {/* 2. ¿Qué pudo influir hoy? */}
      <Reveal className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="font-display text-base font-bold text-navy">2. ¿Qué pudo influir hoy?</p>
        <p className="mt-0.5 text-sm text-ink-muted">Selecciona lo que aplique.</p>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {INFLUENCES.map((f) => {
            const on = !!influences[f.id];
            return (
              <button
                key={f.id}
                onClick={() => toggleInfluence(f.id)}
                aria-pressed={on}
                className={`flex flex-col items-center gap-1.5 rounded-[1.1rem] p-3 transition active:scale-[0.97] ${
                  on ? "bg-accent text-white ring-2 ring-accent" : `${f.wash} text-navy`
                }`}
              >
                <f.Icon size={22} weight="duotone" className={on ? "text-white" : "text-navy"} />
                <span className="text-[0.68rem] font-semibold leading-tight">{f.label}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* 3. ¿Cómo estuvo anoche? */}
      <Reveal className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="font-display text-base font-bold text-navy">3. ¿Cómo estuvo anoche?</p>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="itch" className="text-sm font-semibold text-navy">Comezón</label>
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
            className="mt-2 h-6 w-full"
            style={{ accentColor: "var(--accent)" }}
          />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="sleep" className="text-sm font-semibold text-navy">Calidad de sueño</label>
            <span className="rounded-full bg-wash-green px-3 py-1 font-mono text-sm font-semibold text-navy">
              {sleepScore}/10
            </span>
          </div>
          <input
            id="sleep"
            type="range"
            min="1"
            max="10"
            value={sleepScore}
            onChange={(e) => setSleepScore(Number(e.target.value))}
            className="mt-2 h-6 w-full"
            style={{ accentColor: "var(--navy)" }}
          />
          <p className="mt-1 text-xs text-ink-faint capitalize">{sleepEnum(sleepScore)}</p>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Cuéntame algo más del día (opcional)…"
          className="mt-4 w-full resize-none rounded-[var(--radius-control)] border border-hairline-strong bg-cream-card px-4 py-3 text-base text-navy outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft/55"
        />
      </Reveal>

      {/* Guardar y analizar */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98] disabled:opacity-55"
      >
        {loading ? "Analizando…" : "Guardar y analizar"}
        {!loading && <ArrowRight size={18} weight="bold" />}
      </button>

      {/* Estado actual */}
      <Reveal className="mt-7 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Estado actual</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[1.2rem] bg-wash-green p-4">
            <p className="font-mono text-3xl font-bold text-navy">{calma}</p>
            <p className="text-xs text-navy/70">Calma Familiar /100</p>
          </div>
          <div className="rounded-[1.2rem] bg-accent-soft p-4">
            <p className="font-mono text-3xl font-bold text-navy">{m.registeredDays}</p>
            <p className="text-xs text-navy/70">días registrados (semana)</p>
          </div>
          <div className="rounded-[1.2rem] bg-amber-soft p-4">
            <p className="font-mono text-3xl font-bold text-navy">{m.highItchDays}</p>
            <p className="text-xs text-navy/70">días de comezón alta</p>
          </div>
          <div className="rounded-[1.2rem] bg-cream-sunk p-4">
            <p className="font-mono text-3xl font-bold text-navy">{m.affectedSleepNights}</p>
            <p className="text-xs text-navy/70">noches de sueño irregular</p>
          </div>
        </div>
      </Reveal>

      {/* Línea de tiempo */}
      <Reveal className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Línea de tiempo</p>
        <h3 className="mt-0.5 font-display text-lg font-semibold text-navy">Así ha evolucionado {child}</h3>
        {recent.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2.5">
            {recent.map((l) => {
              const Mood = moodIcon(l);
              const ambar = dayStatus(l) === "ambar";
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-[1.2rem] bg-cream px-4 py-3 ring-1 ring-inset ring-hairline"
                >
                  <Mood
                    size={26}
                    weight="duotone"
                    className={ambar ? "text-amber" : "text-accent"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy">{fmtDate(l.date)}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {l.triggers?.length ? l.triggers.join(", ") : "Sin factores"} · sueño {l.sleepQuality}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-cream-sunk px-2.5 py-1 font-mono text-xs font-semibold text-navy">
                    {l.itchLevel}/10
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">Guarda tu primer estado para ver la evolución aquí.</p>
        )}
      </Reveal>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            applyFile(file);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
