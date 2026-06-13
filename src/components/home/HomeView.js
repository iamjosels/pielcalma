"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useRoutine, toggleRoutineItem } from "@/lib/routine";
import { isSpeechConfigured } from "@/lib/speech";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import PredictorCard from "@/components/PredictorCard";
import VoiceConversation from "@/components/VoiceConversation";
import Mascot from "@/components/Mascot";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import {
  HandHeart,
  Microphone,
  ChatCircleDots,
  Check,
  CheckCircle,
  ArrowRight,
  Sparkle,
} from "@/components/icons";

/**
 * Inicio — versión WEB. Dashboard de varias columnas que aprovecha el ancho de
 * escritorio (mapa de calor + asistente + predictor + adherencia) y colapsa a
 * una sola columna en pantallas angostas.
 */
export default function HomeView() {
  const { profile } = useStore();
  const routine = useRoutine();
  const [mounted, setMounted] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const caregiver = mounted ? profile.caregiverName : "Ana";
  const voiceReady = mounted && isSpeechConfigured();

  const pct = mounted ? routine.adherence : 0;
  const R = 26;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* Saludo */}
      <Reveal>
        <div className="flex items-center gap-4">
          <Mascot size={56} mood="happy" />
          <div>
            <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-navy">
              Hola, {caregiver} <span className="inline-block">👋</span>
            </h1>
            <p className="text-[0.98rem] text-ink-muted">
              Vamos juntas, lo estás haciendo muy bien.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Dashboard */}
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Columna izquierda: datos */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <HeatmapCalendar />
          <PredictorCard />
        </div>

        {/* Columna derecha: asistente + rutina */}
        <div className="flex flex-col gap-5 lg:col-span-5">
        {/* Asistente */}
        <Reveal className="overflow-hidden rounded-[var(--radius-card)] bg-navy p-6 text-white shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Mascot size={34} mood="neutral" />
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">
                <Sparkle size={13} weight="duotone" />
                Asistente
              </p>
              <h2 className="mt-0.5 font-display text-xl font-bold">Habla conmigo</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                Pregúntame por chat o por voz. Aprendo de cada conversación para
                acompañarte mejor.
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-2.5">
            <Link
              href="/asistente"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/12 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
            >
              <ChatCircleDots size={18} weight="fill" />
              Chat
            </Link>
            {voiceReady ? (
              <button
                onClick={() => setVoiceOpen(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-press active:scale-[0.98]"
              >
                <Microphone size={18} weight="fill" />
                Hablar
              </button>
            ) : (
              <Link
                href="/asistente"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-press active:scale-[0.98]"
              >
                <Microphone size={18} weight="fill" />
                Voz
              </Link>
            )}
          </div>
        </Reveal>

        {/* Adherencia a la rutina */}
        <Reveal className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                <circle cx="32" cy="32" r={R} fill="none" stroke="var(--cream-sunk)" strokeWidth="7" />
                <circle
                  cx="32"
                  cy="32"
                  r={R}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC - (CIRC * pct) / 100}
                  style={{ transition: "stroke-dashoffset 0.7s ease" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-navy">
                {pct}%
              </span>
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-semibold text-navy">
                Adherencia a la rutina
              </p>
              <p className="mt-0.5 text-sm leading-snug text-ink-muted">
                {pct >= 80
                  ? "¡Excelente trabajo! Sigue así 💚"
                  : "Cada paso suma. Marca lo de hoy abajo."}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(mounted ? routine.items : []).map((it) => {
              const done = routine.doneToday.includes(it.id);
              return (
                <button
                  key={it.id}
                  onClick={() => toggleRoutineItem(it.id)}
                  className={`flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99] ${
                    done ? "bg-wash-green text-navy" : "bg-cream-sunk text-ink-muted"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-accent text-white" : "border-2 border-hairline-strong"
                    }`}
                  >
                    {done && <Check size={14} weight="bold" />}
                  </span>
                  {it.label}
                </button>
              );
            })}
          </div>
        </Reveal>
        </div>
      </div>

      {/* CTA + línea ética */}
      <Reveal className="mt-6 flex flex-col items-center gap-5 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-7 text-center shadow-[var(--shadow-card)] sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">¿Registramos el día de hoy?</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Una foto, cómo durmió y un par de toques. Menos de un minuto.
          </p>
        </div>
        <Link
          href="/estado"
          className="flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-4 font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-accent-press active:scale-[0.98]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <HandHeart size={16} weight="fill" />
          </span>
          Registrar estado de hoy
          <ArrowRight size={18} weight="bold" />
        </Link>
      </Reveal>

      <Stagger className="mt-5 flex flex-wrap justify-center gap-2">
        {["No diagnostica", "No cambia tratamientos", "Sigue el plan de tu doctor"].map((p) => (
          <StaggerItem key={p}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-card px-3 py-1.5 text-[0.72rem] font-medium text-ink-muted ring-1 ring-inset ring-hairline">
              <CheckCircle size={13} weight="duotone" className="text-accent" />
              {p}
            </span>
          </StaggerItem>
        ))}
      </Stagger>

      <p className="mt-7 text-center text-xs text-ink-faint">
        PielCalma · Acompañamos cada paso
      </p>

      {voiceReady && <VoiceConversation open={voiceOpen} onClose={() => setVoiceOpen(false)} />}
    </div>
  );
}
