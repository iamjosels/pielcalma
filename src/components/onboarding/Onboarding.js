"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { isOnboarded, setOnboarded, ONBOARDING_EVENT } from "@/lib/onboarding";
import { requestAI } from "@/lib/requestAI";
import { updateActiveProfile, getActiveProfile } from "@/lib/store";
import { seedMemory } from "@/lib/memory";
import Mascot from "@/components/Mascot";
import { ArrowRight, ArrowLeft, ShieldCheck, Check, Sparkle } from "@/components/icons";

const WASH = {
  green: "radial-gradient(125% 70% at 50% -5%, var(--wash-green) 0%, var(--cream) 58%)",
  mint: "radial-gradient(125% 70% at 50% -5%, var(--accent-soft) 0%, var(--cream) 58%)",
  amber: "radial-gradient(125% 70% at 50% -5%, var(--amber-soft) 0%, var(--cream) 58%)",
};

// Pantallas de bienvenida + explicación (mascota)
const SLIDES = [
  {
    key: "welcome",
    wash: "green",
    mood: "happy",
    eyebrow: "Hola, soy PielCalma",
    title: "Acompañamos cada paso.",
    text: "Tu copiloto cálido para el cuidado de la piel atópica. Sin diagnósticos, sin presiones: solo claridad, un día a la vez.",
    size: 132,
  },
  {
    key: "registra",
    wash: "mint",
    mood: "happy",
    eyebrow: "Cada día, en segundos",
    title: "Registra cómo estuvo el día.",
    text: "Una foto, un par de toques y un deslizador. Yo ordeno lo importante por ti.",
    size: 108,
  },
  {
    key: "anticipa",
    wash: "amber",
    mood: "neutral",
    eyebrow: "Con tus propios datos",
    title: "Te aviso qué observar.",
    text: "Aprendo de cada conversación y registro para anticipar coincidencias y darte calma.",
    size: 108,
  },
  {
    key: "consulta",
    wash: "green",
    mood: "happy",
    eyebrow: "Tú decides, tu doctor guía",
    title: "Llega preparada a la consulta.",
    text: "Todo se vuelve un reporte claro para conversar con tu dermatólogo. No reemplazo su criterio.",
    size: 108,
  },
];

const CONDITIONS = ["Dermatitis atópica", "Eccema", "Piel sensible", "Otro"];
const TRIGGERS = ["Calor", "Sudor", "Polvo", "Detergente nuevo", "Comida nueva", "Estrés", "Mascota"];
const QUESTIONS = [
  "¿Qué es lo que más te preocupa del cuidado de su piel?",
  "¿Cómo suele empezar un brote en casa?",
  "¿Qué te gustaría que te ayude a recordar?",
];

const inputClass =
  "w-full rounded-[var(--radius-control)] border border-hairline-strong bg-cream-card px-4 py-3 text-base text-navy outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft/55";

const variants = {
  enter: (d) => ({ x: d >= 0 ? 90 : -90, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d >= 0 ? -90 : 90, opacity: 0 }),
};

export default function Onboarding() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [[page, dir], setPage] = useState([0, 0]);
  const [saving, setSaving] = useState(false);

  // Intake
  const [caregiverName, setCaregiverName] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [condition, setCondition] = useState("Dermatitis atópica");
  const [triggers, setTriggers] = useState([]);
  const [answers, setAnswers] = useState(["", "", ""]);

  useEffect(() => {
    setMounted(true);
    setShow(!isOnboarded());
    const onEvent = () => {
      const onboarded = isOnboarded();
      setShow(!onboarded);
      if (!onboarded) setPage([0, 0]);
    };
    window.addEventListener(ONBOARDING_EVENT, onEvent);
    return () => window.removeEventListener(ONBOARDING_EVENT, onEvent);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!mounted) return null;

  const INTAKE = SLIDES.length; // índice del paso de intake
  const total = SLIDES.length + 1;
  const onIntake = page === INTAKE;
  const slide = SLIDES[page] || SLIDES[0];

  function go(step) {
    const target = Math.min(total - 1, Math.max(0, page + step));
    if (target !== page) setPage([target, step]);
  }
  function toggleTrigger(t) {
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function setAnswer(i, v) {
    setAnswers((prev) => prev.map((a, k) => (k === i ? v : a)));
  }

  async function finish() {
    setSaving(true);
    const taps = {
      caregiverName: caregiverName.trim(),
      childName: childName.trim(),
      childAge,
      condition,
      triggers,
    };
    const openAnswers = answers.map((a) => a.trim()).filter(Boolean);
    try {
      const data = await requestAI("intake", { taps, answers: openAnswers });
      updateActiveProfile(data.profile || {});
      seedMemory(getActiveProfile().id, {
        facts: data.memorySeed || [],
        summary: data.welcomeMessage || "",
      });
    } catch {
      // Fallback mínimo si la IA falla: usa los toques directos.
      updateActiveProfile({
        caregiverName: taps.caregiverName,
        childName: taps.childName,
        childAge: taps.childAge,
        conditionLabel: taps.condition,
      });
    } finally {
      setOnboarded();
      setShow(false);
      setSaving(false);
    }
  }

  const canFinish = caregiverName.trim() && childName.trim();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex justify-center bg-navy/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.3 }}
          aria-modal="true"
          role="dialog"
          aria-label="Introducción a PielCalma"
        >
          <div className="relative flex h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden bg-cream">
            <AnimatePresence initial={false}>
              <motion.div
                key={(onIntake ? "intake" : slide.wash) + page}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: WASH[onIntake ? "mint" : slide.wash] }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
              />
            </AnimatePresence>

            {/* Barra superior */}
            <div className="safe-top relative z-10 flex h-14 items-center justify-between px-4">
              {page > 0 ? (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition active:scale-90"
                >
                  <ArrowLeft size={20} weight="bold" />
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}
              <span className="h-9 w-9" />
            </div>

            {/* Contenido */}
            <div className="relative z-10 flex-1 overflow-hidden">
              <AnimatePresence custom={dir} initial={false} mode="popLayout">
                {!onIntake ? (
                  <motion.div
                    key={page}
                    custom={dir}
                    variants={reduce ? undefined : variants}
                    initial={reduce ? false : "enter"}
                    animate={reduce ? {} : "center"}
                    exit={reduce ? {} : "exit"}
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 32 },
                      opacity: { duration: 0.2 },
                    }}
                    drag={reduce ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(e, { offset, velocity }) => {
                      if (offset.x < -70 || velocity.x < -450) go(1);
                      else if (offset.x > 70 || velocity.x > 450) go(-1);
                    }}
                    className="absolute inset-0 flex touch-pan-y flex-col px-7"
                  >
                    <div className="flex flex-1 items-center justify-center pb-2 pt-4">
                      <Mascot size={slide.size} mood={slide.mood} />
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{slide.eyebrow}</p>
                      <h2 className="mt-3 font-display text-[2rem] font-bold leading-[1.08] tracking-tight text-navy">
                        {slide.title}
                      </h2>
                      <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-muted">{slide.text}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="intake"
                    custom={dir}
                    variants={reduce ? undefined : variants}
                    initial={reduce ? false : "enter"}
                    animate={reduce ? {} : "center"}
                    exit={reduce ? {} : "exit"}
                    transition={{ x: { type: "spring", stiffness: 300, damping: 32 }, opacity: { duration: 0.2 } }}
                    className="absolute inset-0 flex flex-col overflow-y-auto px-7 pb-4"
                  >
                    <div className="flex items-center gap-3 pt-2">
                      <Mascot size={48} mood="happy" />
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                          <Sparkle size={13} weight="duotone" />
                          Personalicemos tu app
                        </p>
                        <h2 className="font-display text-xl font-bold text-navy">Cuéntame de ustedes</h2>
                      </div>
                    </div>

                    {/* Toques rápidos */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-sm font-semibold text-navy">Tu nombre</label>
                        <input value={caregiverName} onChange={(e) => setCaregiverName(e.target.value)} placeholder="Ej. Ana" className={`${inputClass} mt-1.5`} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-navy">Nombre del peque</label>
                        <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Ej. Lucas" className={`${inputClass} mt-1.5`} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-navy">Edad</label>
                        <input value={childAge} onChange={(e) => setChildAge(e.target.value)} inputMode="numeric" placeholder="Ej. 4" className={`${inputClass} mt-1.5`} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-semibold text-navy">Condición</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {CONDITIONS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCondition(c)}
                            className={`rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
                              condition === c ? "bg-accent text-white" : "border border-hairline-strong bg-cream-card text-ink-muted"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-semibold text-navy">¿Qué factores ya identificas?</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {TRIGGERS.map((t) => {
                          const on = triggers.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTrigger(t)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
                                on ? "bg-accent text-white" : "border border-hairline-strong bg-cream-card text-ink-muted"
                              }`}
                            >
                              {on && <Check size={13} weight="bold" />}
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preguntas abiertas (la IA las interpreta) */}
                    <div className="mt-5 flex flex-col gap-4">
                      {QUESTIONS.map((q, i) => (
                        <div key={i}>
                          <label className="text-sm font-semibold leading-snug text-navy">{q}</label>
                          <textarea
                            value={answers[i]}
                            onChange={(e) => setAnswer(i, e.target.value)}
                            rows={2}
                            placeholder="Cuéntame con tus palabras (opcional)…"
                            className={`${inputClass} mt-1.5 resize-none`}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controles inferiores */}
            <div className="safe-bottom relative z-10 px-7 pb-4 pt-3">
              {!onIntake && (
                <div className="flex items-center justify-center gap-2">
                  {SLIDES.map((s, i) => (
                    <span
                      key={s.key}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-accent" : "w-1.5 bg-hairline-strong"}`}
                    />
                  ))}
                </div>
              )}

              {onIntake && (
                <div className="mb-3 flex items-center justify-center gap-2 text-center">
                  <ShieldCheck size={16} weight="duotone" className="shrink-0 text-navy" />
                  <p className="text-xs leading-relaxed text-ink-muted">
                    PielCalma no diagnostica ni reemplaza a tu dermatólogo.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => (onIntake ? finish() : go(1))}
                disabled={saving || (onIntake && !canFinish)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98] disabled:opacity-55"
              >
                {onIntake ? (saving ? "Creando tu espacio…" : "Crear mi PielCalma") : page === 0 ? "Empezar" : "Continuar"}
                {!saving && <ArrowRight size={18} weight="bold" />}
              </button>
              {onIntake && !canFinish && (
                <p className="mt-2 text-center text-xs text-ink-faint">Cuéntame al menos tu nombre y el de tu peque.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
