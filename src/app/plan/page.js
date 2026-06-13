"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useMedicalPlan, setMedicalPlan, EMPTY_PLAN } from "@/lib/plan";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { Reveal, TactileButton } from "@/components/motion";
import { Stethoscope, Check, FloppyDisk, ArrowRight } from "@/components/icons";

const FIELDS = [
  { key: "doctorName", label: "Dermatólogo/a", placeholder: "Nombre del especialista", rows: 1 },
  { key: "emoliente", label: "Rutina de emoliente", placeholder: "Ej. crema 2 veces al día sobre piel húmeda", rows: 2 },
  { key: "bano", label: "Rutina de baño", placeholder: "Ej. agua tibia, secar con toques, emoliente después", rows: 2 },
  { key: "brote", label: "Qué hacer en un brote", placeholder: "Indicaciones de tu doctor para los brotes", rows: 3 },
  { key: "medicacion", label: "Medicación indicada", placeholder: "Lo que tu doctor indicó (sin cambiar dosis)", rows: 2 },
  { key: "notas", label: "Otras notas del plan", placeholder: "Evitar lana, uñas cortas, ambiente fresco…", rows: 2 },
];

const inputClass =
  "w-full rounded-[var(--radius-control)] border border-hairline-strong bg-cream-card px-4 py-3 text-base text-navy outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft/55";

export default function PlanPage() {
  const { profile } = useStore();
  const saved = useMedicalPlan();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_PLAN);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => setMounted(true), []);
  // Sincroniza el form con el plan guardado al montar / cambiar de perfil.
  useEffect(() => {
    if (mounted) setForm(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, profile.id]);

  const child = mounted ? profile.childName : "Lucas";

  function save() {
    setMedicalPlan(form);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-1 pb-10 pt-1 sm:px-4">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-3.5 py-1.5 text-xs font-medium text-ink-muted">
          <Stethoscope size={14} weight="duotone" className="text-accent" />
          Plan del dermatólogo
        </span>
        <h1 className="mt-4 font-display text-[1.9rem] font-semibold leading-[1.08] tracking-tight text-navy">
          La guía de {child}, siempre a la mano.
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-muted">
          Guarda aquí lo que indicó tu dermatólogo. PielCalma usa este plan para acompañarte y validar el
          cuidado en casa, sin cambiarlo nunca.
        </p>
      </Reveal>

      <div className="mt-6 flex flex-col gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label htmlFor={f.key} className="text-sm font-semibold text-navy">
              {f.label}
            </label>
            {f.rows === 1 ? (
              <input
                id={f.key}
                value={form[f.key] || ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={inputClass}
              />
            ) : (
              <textarea
                id={f.key}
                rows={f.rows}
                value={form[f.key] || ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={`${inputClass} resize-none`}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
      >
        {savedFlash ? (
          <>
            Plan guardado <Check size={18} weight="bold" />
          </>
        ) : (
          <>
            Guardar plan <FloppyDisk size={18} weight="bold" />
          </>
        )}
      </button>

      <div className="mt-6">
        <SafeDisclaimer />
      </div>

      <div className="mt-5">
        <TactileButton href="/estado" variant="secondary" className="w-full px-6 py-3.5 text-sm">
          Registrar con este plan
          <ArrowRight size={18} weight="bold" />
        </TactileButton>
      </div>
    </div>
  );
}
