"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { buildAIContext } from "@/lib/aiContext";
import { memoryToText, addMemoryFacts } from "@/lib/memory";
import { requestAI } from "@/lib/requestAI";
import { ASSISTANT_ROUTES } from "@/lib/generators";
import {
  isSpeechConfigured,
  recognizeOnce,
  speakText,
  stopSpeaking,
  cancelListening,
  stopAllSpeech,
} from "@/lib/speech";
import Mascot from "@/components/Mascot";
import { Microphone, MicrophoneSlash, Waveform, X, PhoneX, CaretRight } from "@/components/icons";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Colchón tras hablar antes de abrir el micrófono: evita que la app se
// "escuche a sí misma" (eco) y se interrumpa.
const TAIL_MS = 500;

const VIEW = {
  idle: { label: "En pausa", hint: "Toca el micrófono para hablar", mood: "happy" },
  greeting: { label: "Hola 👋", hint: "PielCalma te saluda", mood: "happy" },
  listening: { label: "Escuchando…", hint: "Habla con naturalidad", mood: "happy" },
  thinking: { label: "Pensando…", hint: "Ordenando lo que dijiste", mood: "neutral" },
  speaking: { label: "Hablando…", hint: "El micrófono está en pausa", mood: "happy" },
  denied: { label: "Sin micrófono", hint: "Activa el permiso del micrófono", mood: "concern" },
  error: { label: "Voz no disponible", hint: "Revisa la conexión", mood: "concern" },
};

export default function VoiceConversation({ open, onClose }) {
  const router = useRouter();
  const { profile, logs, observations, calmaEvents } = useStore();

  const [phase, setPhase] = useState("idle");
  const [micOn, setMicOn] = useState(true);
  const [turns, setTurns] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const aliveRef = useRef(false);
  const micOnRef = useRef(true);
  const phaseRef = useRef("idle");
  const cancelRef = useRef(false);
  const historyRef = useRef([]);
  const scrollRef = useRef(null);

  const caregiver = profile?.caregiverName || "Ana";
  const child = profile?.childName || "Lucas";

  const setPh = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };
  function pushTurn(role, text) {
    setTurns((t) => [...t, { role, text }]);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, phase]);

  async function askAssistant(question) {
    const context = {
      childName: profile.childName,
      childAge: profile.childAge,
      conditionLabel: profile.conditionLabel,
      ...buildAIContext(logs, observations, calmaEvents),
    };
    const data = await requestAI("assistant", {
      question,
      history: historyRef.current.map(({ role, text }) => ({ role, text })),
      context,
      caregiverName: caregiver,
    });
    requestAI("learn", { text: question, memory: memoryToText() })
      .then((r) => r?.facts && addMemoryFacts(r.facts))
      .catch(() => {});
    return data;
  }

  // --- Hablar (micrófono SIEMPRE en pausa aquí) ---
  async function doSpeak(text) {
    if (!aliveRef.current) return;
    setPh("speaking");
    pushTurn("assistant", text);
    try {
      await speakText(text);
    } catch {
      /* si el audio no arranca, seguimos */
    }
  }

  // Tras hablar: solo escucha si el micrófono está encendido (manos libres).
  async function afterSpeak() {
    if (!aliveRef.current) return;
    if (micOnRef.current) {
      await sleep(TAIL_MS); // deja terminar el audio antes de abrir el micro
      if (aliveRef.current && micOnRef.current && phaseRef.current === "speaking") doListen();
    } else {
      setPh("idle");
    }
  }

  // --- Escuchar un turno ---
  async function doListen() {
    if (!aliveRef.current) return;
    if (phaseRef.current === "speaking") stopSpeaking();
    setPh("listening");
    let heard = "";
    try {
      heard = await recognizeOnce();
    } catch {
      if (!aliveRef.current) return;
      if (cancelRef.current) {
        cancelRef.current = false;
        setPh("idle");
        return;
      }
      setPh("denied");
      return;
    }
    if (!aliveRef.current) return;
    heard = (heard || "").trim();
    if (!heard) {
      // No se entendió nada: si está en manos libres, sigue esperando; si no, pausa.
      if (micOnRef.current) {
        await sleep(150);
        if (aliveRef.current && micOnRef.current) doListen();
      } else {
        setPh("idle");
      }
      return;
    }
    handleUtterance(heard);
  }

  async function handleUtterance(text) {
    pushTurn("user", text);
    setSuggestions([]);
    setPh("thinking");
    let reply = "";
    let sugg = [];
    try {
      const data = await askAssistant(text);
      reply = (data?.reply || "").trim();
      sugg = data?.suggestions || [];
    } catch {
      reply = "Perdona, no pude responder ahora mismo. ¿Lo intentamos otra vez?";
    }
    if (!aliveRef.current) return;
    if (!reply) reply = "Estoy contigo. ¿Me lo cuentas de nuevo?";
    historyRef.current = [...historyRef.current, { role: "user", text }, { role: "assistant", text: reply }];
    await doSpeak(reply);
    setSuggestions(sugg);
    afterSpeak();
  }

  // --- Ciclo de vida ---
  useEffect(() => {
    if (!open) return;
    aliveRef.current = true;
    cancelRef.current = false;
    historyRef.current = [];
    micOnRef.current = true;
    setMicOn(true);
    setTurns([]);
    setSuggestions([]);

    (async () => {
      if (!isSpeechConfigured()) {
        setPh("error");
        return;
      }
      setPh("greeting");
      const greeting = `Hola, ${caregiver}. Cuéntame, ¿cómo está la piel de ${child} hoy?`;
      await doSpeak(greeting);
      afterSpeak();
    })();

    return () => {
      aliveRef.current = false;
      stopAllSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    aliveRef.current = false;
    stopAllSpeech();
    onClose?.();
  }

  // Encender / apagar el micrófono
  function toggleMic() {
    const next = !micOn;
    setMicOn(next);
    micOnRef.current = next;
    if (next) {
      // Encender → empieza a escuchar (interrumpe la voz si está hablando)
      if (phaseRef.current === "speaking") stopSpeaking();
      if (["idle", "speaking", "denied", "greeting"].includes(phaseRef.current)) doListen();
    } else {
      // Apagar → corta la escucha; la IA podrá hablar sin interrupciones
      cancelRef.current = true;
      cancelListening();
      if (phaseRef.current === "listening") setPh("idle");
    }
  }

  // Tocar el orbe = hablar ahora (o interrumpir a la IA para responder)
  function handleOrbTap() {
    if (phaseRef.current === "thinking") return;
    if (phaseRef.current === "speaking") stopSpeaking();
    if (phaseRef.current !== "listening") doListen();
  }

  function goTo(route) {
    if (!ASSISTANT_ROUTES.includes(route)) return;
    handleClose();
    router.push(route);
  }

  const view = VIEW[phase] || VIEW.idle;
  const isError = phase === "error" || phase === "denied";
  const listening = phase === "listening";
  const speaking = phase === "speaking";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex flex-col"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 8%, var(--accent-soft, #d6f0e3) 0%, var(--cream, #f3faf6) 55%, var(--cream, #f3faf6) 100%)",
          }}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1rem)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card/80 px-3.5 py-1.5 text-xs font-semibold text-navy backdrop-blur">
              <Mascot size={18} mood="happy" />
              PielCalma · Modo voz
            </span>
            <button
              onClick={handleClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-cream-card/80 text-ink-muted backdrop-blur transition active:scale-95"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Orbe + estado */}
          <div className="flex flex-col items-center px-6 pt-4">
            <button
              onClick={handleOrbTap}
              aria-label="Hablar ahora"
              className="relative flex h-44 w-44 items-center justify-center"
            >
              {!isError &&
                [0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className={`absolute rounded-full ${speaking ? "bg-navy" : "bg-accent"} opacity-20`}
                    style={{ height: 120, width: 120 }}
                    animate={
                      listening
                        ? { scale: [1, 1.55, 1], opacity: [0.22, 0, 0.22] }
                        : speaking
                        ? { scale: [1, 1.35, 1], opacity: [0.25, 0.05, 0.25] }
                        : { scale: [1, 1.12, 1], opacity: [0.16, 0.08, 0.16] }
                    }
                    transition={{
                      duration: speaking ? 0.9 : 2.2,
                      repeat: Infinity,
                      delay: i * (speaking ? 0.18 : 0.5),
                      ease: "easeInOut",
                    }}
                  />
                ))}

              <motion.span
                className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-[0_20px_60px_-15px_rgba(31,77,63,0.5)] ${
                  isError ? "bg-danger" : "bg-gradient-to-br from-accent to-navy"
                }`}
                animate={
                  phase === "thinking"
                    ? { scale: [1, 1.06, 1] }
                    : speaking
                    ? { scale: [1, 1.08, 0.98, 1.05, 1] }
                    : { scale: [1, 1.03, 1] }
                }
                transition={{
                  duration: speaking ? 0.7 : phase === "thinking" ? 1.1 : 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {listening && <Microphone size={40} weight="fill" className="text-white" />}
                {speaking && <Waveform size={40} weight="fill" className="text-white" />}
                {phase === "greeting" && <Waveform size={40} weight="fill" className="text-white" />}
                {phase === "idle" && <Mascot size={56} mood="happy" />}
                {phase === "thinking" && (
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((k) => (
                      <motion.span
                        key={k}
                        className="h-2.5 w-2.5 rounded-full bg-white"
                        animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: k * 0.15 }}
                      />
                    ))}
                  </span>
                )}
                {isError && <MicrophoneSlash size={40} weight="fill" className="text-white" />}
              </motion.span>
            </button>

            <p className="mt-6 font-display text-2xl font-bold text-navy">{view.label}</p>
            <p className="mt-1 text-sm text-ink-muted">{view.hint}</p>
          </div>

          {/* Transcripción */}
          <div ref={scrollRef} className="mt-4 flex-1 overflow-y-auto px-6">
            <div className="mx-auto flex max-w-sm flex-col gap-2.5 pb-2">
              {turns.slice(-8).map((t, i) =>
                t.role === "user" ? (
                  <div key={i} className="self-end max-w-[85%] rounded-[1.2rem] rounded-br-md bg-accent px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                    {t.text}
                  </div>
                ) : (
                  <div key={i} className="self-start flex max-w-[88%] gap-2">
                    <Mascot size={26} mood="happy" />
                    <div className="rounded-[1.2rem] rounded-tl-md border border-hairline bg-cream-card/90 px-4 py-2.5 text-sm leading-relaxed text-ink backdrop-blur">
                      {t.text}
                    </div>
                  </div>
                )
              )}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s, k) => (
                    <button
                      key={k}
                      onClick={() => goTo(s.route)}
                      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft/60 px-3 py-1.5 text-xs font-semibold text-accent transition active:scale-95"
                    >
                      {s.label}
                      <CaretRight size={12} weight="bold" />
                    </button>
                  ))}
                </div>
              )}
              {isError && (
                <p className="mx-auto max-w-xs text-center text-xs leading-relaxed text-ink-muted">
                  {phase === "denied"
                    ? "Necesito permiso del micrófono. Actívalo en los ajustes y toca el micrófono para reintentar."
                    : "La voz no está disponible ahora. Puedes seguir escribiendo en el asistente."}
                </p>
              )}
            </div>
          </div>

          {/* Controles: micrófono on/off + terminar */}
          <div className="flex items-end justify-center gap-8 px-6 pb-[calc(env(safe-area-inset-bottom)+1.6rem)] pt-2">
            {/* Micrófono on/off */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleMic}
                disabled={isError && phase === "error"}
                aria-pressed={micOn}
                aria-label={micOn ? "Apagar micrófono" : "Encender micrófono"}
                className={`flex h-16 w-16 items-center justify-center rounded-full shadow-[var(--shadow-soft)] transition active:scale-95 disabled:opacity-50 ${
                  micOn ? "bg-accent text-white" : "border border-hairline-strong bg-cream-card text-ink-muted"
                }`}
              >
                {micOn ? <Microphone size={26} weight="fill" /> : <MicrophoneSlash size={26} weight="fill" />}
              </button>
              <span className="text-xs font-medium text-ink-muted">{micOn ? "Micrófono" : "Apagado"}</span>
            </div>

            {/* Terminar */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleClose}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-white shadow-[0_14px_30px_-8px_rgba(224,106,90,0.7)] transition active:scale-95"
                aria-label="Terminar conversación"
              >
                <PhoneX size={26} weight="fill" />
              </button>
              <span className="text-xs font-medium text-ink-muted">Terminar</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
