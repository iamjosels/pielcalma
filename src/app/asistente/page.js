"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { buildAIContext } from "@/lib/aiContext";
import { memoryToText, addMemoryFacts } from "@/lib/memory";
import { requestAI } from "@/lib/requestAI";
import { ASSISTANT_ROUTES } from "@/lib/generators";
import { isSpeechConfigured } from "@/lib/speech";
import VoiceConversation from "@/components/VoiceConversation";
import Mascot from "@/components/Mascot";
import TypewriterText from "@/components/TypewriterText";
import { PaperPlaneTilt, CaretRight, Sparkle, Microphone, Waveform } from "@/components/icons";

const QUICK = [
  "¿Dónde registro el día de hoy?",
  "¿Qué dice mi semana?",
  "Quiero ver mi historial",
  "¿Qué observo en los próximos días?",
];

export default function AsistentePage() {
  const router = useRouter();
  const { profile, logs, observations, calmaEvents } = useStore();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const bottomRef = useRef(null);
  const voiceReady = mounted && isSpeechConfigured();

  const caregiver = mounted ? profile.caregiverName : "Ana";

  useEffect(() => setMounted(true), []);

  // Saludo inicial (una vez montado, con el nombre del perfil).
  useEffect(() => {
    if (!mounted) return;
    setMessages([
      {
        role: "assistant",
        text: `Hola, ${caregiver}. Soy PielCalma. Puedo ayudarte a registrar el día, entender tu semana o anticipar qué observar. Aprendo de cada conversación. ¿Qué necesitas?`,
        suggestions: [
          { label: "Registrar hoy", route: "/estado" },
          { label: "Ver historial", route: "/historial" },
          { label: "Mi plan", route: "/plan" },
        ],
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function scrollToEnd() {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }

  function navigate(route) {
    if (ASSISTANT_ROUTES.includes(route)) router.push(route);
  }

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const context = {
        childName: profile.childName,
        childAge: profile.childAge,
        conditionLabel: profile.conditionLabel,
        ...buildAIContext(logs, observations, calmaEvents),
      };
      const data = await requestAI("assistant", {
        question: q,
        history,
        context,
        caregiverName: caregiver,
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply, suggestions: data.suggestions || [] },
      ]);
      requestAI("learn", { text: q, memory: memoryToText() })
        .then((r) => r?.facts && addMemoryFacts(r.facts))
        .catch(() => {});
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "No pude responder ahora mismo. Intenta de nuevo en un momento.",
          suggestions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-accent-soft">
          <Mascot size={28} mood="happy" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-navy">Asistente PielCalma</h1>
          <p className="text-sm text-ink-muted">Conversa por chat o por voz. Aprendo de ti.</p>
        </div>
      </div>

      {/* Conversación */}
      <div className="pt-4">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="max-w-[80%] self-end rounded-[1.3rem] rounded-br-md bg-accent px-4 py-2.5 text-sm leading-relaxed text-white"
              >
                {m.text}
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex gap-2.5"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                  <Mascot size={22} mood="happy" />
                </span>
                <div className="max-w-[80%]">
                  <div className="rounded-[1.3rem] rounded-tl-md border border-hairline bg-cream-card px-4 py-2.5 text-sm leading-relaxed text-ink">
                    <TypewriterText text={m.text} onTick={scrollToEnd} />
                  </div>
                  {m.suggestions?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="mt-2 flex flex-wrap gap-2"
                    >
                      {m.suggestions.map((s, k) => (
                        <button
                          key={k}
                          onClick={() => navigate(s.route)}
                          className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft/50 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent-soft active:scale-95"
                        >
                          {s.label}
                          <CaretRight size={12} weight="bold" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          )}

          {loading && (
            <div className="flex gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                <Mascot size={22} mood="happy" />
              </span>
              <div className="flex items-center gap-1 rounded-[1.3rem] rounded-tl-md border border-hairline bg-cream-card px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
              </div>
            </div>
          )}

          {/* Modo voz conversacional */}
          {voiceReady && messages.length <= 1 && !loading && (
            <button
              onClick={() => setVoiceOpen(true)}
              className="mt-2 flex w-full items-center gap-3 rounded-[1.3rem] border border-accent/30 bg-gradient-to-br from-accent-soft/70 to-cream-card p-4 text-left transition hover:border-accent/50 active:scale-[0.99]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-navy">
                <Waveform size={24} weight="fill" className="text-white" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-navy">Hablar con PielCalma</span>
                <span className="mt-0.5 block text-sm leading-snug text-ink-muted">
                  Conversa por voz: habla y te respondo en voz alta.
                </span>
              </span>
              <CaretRight size={16} weight="bold" className="shrink-0 text-accent" />
            </button>
          )}

          {/* Sugerencias rápidas (solo al inicio) */}
          {messages.length <= 1 && !loading && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex items-center justify-between gap-2 rounded-[1.1rem] border border-hairline bg-cream-card px-4 py-3 text-left text-sm font-medium text-navy transition hover:border-hairline-strong active:scale-[0.99]"
                >
                  {q}
                  <CaretRight size={14} weight="bold" className="shrink-0 text-ink-faint" />
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer sticky (al fondo de la columna) */}
      <div className="no-print sticky bottom-4 z-20 mt-4 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 rounded-full border border-hairline bg-cream-card/95 p-1.5 pl-2 shadow-[var(--shadow-soft)] backdrop-blur-xl"
        >
          {voiceReady && (
            <button
              type="button"
              onClick={() => setVoiceOpen(true)}
              aria-label="Hablar por voz"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition hover:bg-accent-soft/70 active:scale-95"
            >
              <Microphone size={19} weight="fill" />
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale a PielCalma…"
            className="flex-1 bg-transparent px-1 text-base text-navy outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Enviar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-press active:scale-95 disabled:opacity-45"
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </form>
      </div>

      <VoiceConversation open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}
