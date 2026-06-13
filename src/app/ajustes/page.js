"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, resetProfileData } from "@/lib/store";
import { useRoutine, setReminderTime } from "@/lib/routine";
import { useMemory } from "@/lib/memory";
import { resetOnboarding } from "@/lib/onboarding";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import Mascot from "@/components/Mascot";
import { Reveal } from "@/components/motion";
import {
  Stethoscope,
  Crown,
  Bell,
  ArrowClockwise,
  Sparkle,
  CaretRight,
  ArrowUpRight,
} from "@/components/icons";

export default function AjustesPage() {
  const { profile } = useStore();
  const routine = useRoutine();
  const memory = useMemory();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const caregiver = mounted ? profile.caregiverName : "Ana";
  const child = mounted ? profile.childName : "Lucas";

  return (
    <div className="mx-auto w-full max-w-3xl px-1 pb-10 pt-1 sm:px-4">
      {/* Perfil */}
      <Reveal className="flex items-center gap-3 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <Mascot size={52} mood="happy" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-navy">{caregiver}</p>
          <p className="text-sm text-ink-muted">
            Cuida a {child}
            {mounted && profile.childAge ? ` · ${profile.childAge} años` : ""}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">{mounted ? profile.conditionLabel : "Dermatitis atópica"}</p>
        </div>
      </Reveal>

      {/* Atajos */}
      <div className="mt-4 flex flex-col gap-2.5">
        {[
          { href: "/plan", label: "Plan del dermatólogo", Icon: Stethoscope, wash: "bg-wash-green" },
          { href: "/plus", label: "PielCalma Plus", Icon: Crown, wash: "bg-amber-soft" },
        ].map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex items-center gap-3 rounded-[1.2rem] border border-hairline bg-cream-card px-4 py-3.5 transition active:scale-[0.99]"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-[0.8rem] ${it.wash}`}>
              <it.Icon size={20} weight="duotone" className="text-navy" />
            </span>
            <span className="flex-1 font-semibold text-navy">{it.label}</span>
            <CaretRight size={15} weight="bold" className="text-ink-faint" />
          </Link>
        ))}
      </div>

      {/* Recordatorio de rutina */}
      <Reveal className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Bell size={18} weight="duotone" className="text-accent" />
          Hora del recordatorio de rutina
        </p>
        <input
          type="time"
          value={mounted ? routine.reminderTime : "20:00"}
          onChange={(e) => setReminderTime(e.target.value)}
          className="mt-3 w-full rounded-[var(--radius-control)] border border-hairline-strong bg-cream-card px-4 py-3 text-base text-navy outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft/55"
        />
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          Aviso local dentro de la app (sin notificaciones del sistema).
        </p>
      </Reveal>

      {/* Memoria de la IA */}
      <Reveal className="mt-4 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Sparkle size={18} weight="duotone" className="text-accent" />
          Lo que PielCalma ha aprendido
        </p>
        {mounted && memory.facts.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {memory.facts.map((f, i) => (
              <li key={i} className="rounded-[1rem] bg-cream-sunk px-3.5 py-2.5 text-sm leading-snug text-ink-muted">
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-faint">
            Aún no he aprendido nada nuevo. Conversa conmigo o registra el día y me iré nutriendo.
          </p>
        )}
      </Reveal>

      {/* Acciones */}
      <Reveal className="mt-4 flex flex-col gap-2.5">
        <button
          onClick={() => resetOnboarding()}
          className="flex items-center gap-3 rounded-[1.2rem] border border-hairline bg-cream-card px-4 py-3.5 text-left transition active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-accent-soft">
            <ArrowUpRight size={18} weight="bold" className="text-accent" />
          </span>
          <span className="flex-1 font-semibold text-navy">Ver la introducción otra vez</span>
          <CaretRight size={15} weight="bold" className="text-ink-faint" />
        </button>
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.confirm("¿Reiniciar los registros de este perfil? No se puede deshacer.")) {
              resetProfileData();
            }
          }}
          className="flex items-center gap-3 rounded-[1.2rem] border border-hairline bg-cream-card px-4 py-3.5 text-left transition active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-danger-soft">
            <ArrowClockwise size={18} weight="bold" className="text-danger" />
          </span>
          <span className="flex-1 font-semibold text-navy">Reiniciar mis datos</span>
          <CaretRight size={15} weight="bold" className="text-ink-faint" />
        </button>
      </Reveal>

      <div className="mt-6">
        <SafeDisclaimer />
      </div>
    </div>
  );
}
