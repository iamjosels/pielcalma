"use client";

import { useEffect, useState } from "react";
import { useTier, setTier } from "@/lib/tier";
import { Reveal } from "@/components/motion";
import { Crown, Check, UsersThree, Sparkle } from "@/components/icons";

const PLANS = [
  {
    key: "basic",
    name: "PielCalma Basic",
    price: "Gratis",
    tagline: "Para empezar a cuidar con orden.",
    Icon: Sparkle,
    wash: "bg-wash-green",
    features: [
      "Diario de registro manual",
      "Recordatorios de rutina",
      "Mapa de calor mensual",
    ],
  },
  {
    key: "plus",
    name: "PielCalma Plus",
    price: "S/ 15–20 / mes",
    tagline: "El copiloto completo. Menos que una consulta.",
    Icon: Crown,
    wash: "bg-accent-soft",
    featured: true,
    features: [
      "Registro por voz con IA",
      "Mapa de Calor (análisis visual)",
      "Validación según el plan de tu doctor",
      "Exportación de reportes PDF",
    ],
  },
  {
    key: "b2b2c",
    name: "Alianzas (B2B2C)",
    price: "Licenciamiento",
    tagline: "Laboratorios y aseguradoras.",
    Icon: UsersThree,
    wash: "bg-wash-peach",
    features: [
      "Códigos de suscripción al comprar dermocosméticos",
      "Cobertura por aseguradoras para prevención",
      "Fidelización institucional",
    ],
  },
];

export default function PlusPage() {
  const tier = useTier();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isPlus = mounted && tier === "plus";

  return (
    <div className="mx-auto w-full max-w-4xl px-1 pb-10 pt-1 sm:px-4">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-3.5 py-1.5 text-xs font-medium text-ink-muted">
          <Crown size={14} weight="duotone" className="text-accent" />
          Planes
        </span>
        <h1 className="mt-4 font-display text-[1.9rem] font-semibold leading-[1.08] tracking-tight text-navy">
          Elige cómo quieres acompañarte.
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-muted">
          Una consulta dermatológica cuesta S/ 150–250. PielCalma Plus, por el precio de un café al mes,
          hace que esa consulta rinda más.
        </p>
      </Reveal>

      <div className="mt-6 flex flex-col gap-4">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`rounded-[var(--radius-card)] p-6 ${
              p.featured
                ? "bg-navy text-white shadow-[var(--shadow-soft)]"
                : "border border-hairline bg-cream-card shadow-[var(--shadow-card)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${p.featured ? "bg-white/10" : p.wash}`}>
                <p.Icon size={24} weight="duotone" className={p.featured ? "text-accent-soft" : "text-navy"} />
              </span>
              {p.featured && (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Recomendado</span>
              )}
            </div>
            <h2 className={`mt-4 font-display text-xl font-semibold ${p.featured ? "text-white" : "text-navy"}`}>
              {p.name}
            </h2>
            <p className={`mt-1 text-sm ${p.featured ? "text-white/70" : "text-ink-muted"}`}>{p.tagline}</p>
            <p className={`mt-3 font-mono text-2xl font-semibold ${p.featured ? "text-accent-soft" : "text-navy"}`}>
              {p.price}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {p.features.map((f) => (
                <li key={f} className={`flex gap-2 text-sm leading-relaxed ${p.featured ? "text-white/85" : "text-ink-muted"}`}>
                  <Check size={16} weight="bold" className={`mt-0.5 shrink-0 ${p.featured ? "text-accent-soft" : "text-accent"}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Toggle demo (no bloquea nada) */}
      <div className="mt-6 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-navy">
          {isPlus ? "Estás en PielCalma Plus (demo)" : "Estás en PielCalma Basic"}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          En esta demo todas las funciones están disponibles para que las pruebes. Este botón solo cambia el
          estado de cuenta de ejemplo.
        </p>
        <button
          onClick={() => setTier(isPlus ? "free" : "plus")}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          {isPlus ? "Volver a Basic (demo)" : "Activar Plus (demo)"}
          <Crown size={16} weight="bold" />
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Modelo Freemium B2C + B2B2C · PielCalma Journal
      </p>
    </div>
  );
}
