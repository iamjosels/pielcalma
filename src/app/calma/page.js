"use client";

import { useState } from "react";
import Link from "next/link";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";

const emotions = [
  {
    id: "tranquila",
    label: "Estoy tranquila",
    emoji: "🌿",
    description: "Quiero registrar cómo va Lucas hoy.",
    color: "bg-[#DFF5EA]",
  },
  {
    id: "con dudas",
    label: "Tengo dudas",
    emoji: "💭",
    description: "No sé bien qué observar o anotar.",
    color: "bg-[#E6F0FF]",
  },
  {
    id: "preocupada",
    label: "Estoy preocupada",
    emoji: "🤍",
    description: "Siento que el brote me está sobrepasando.",
    color: "bg-[#DCD7FF]",
  },
  {
    id: "agotada",
    label: "Estoy agotada",
    emoji: "🌙",
    description: "Fue una noche difícil y necesito ordenar todo.",
    color: "bg-[#FFE6D9]",
  },
];

export default function CalmaPage() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleEmotionClick(emotion) {
    setSelectedEmotion(emotion);
    setLoading(true);
    setSummary(null);

    try {
      const response = await fetch("/api/calm-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotion,
          itchLevel: 8,
          sleepQuality: "malo",
          triggers: ["calor", "sudor"],
        }),
      });

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      setSummary({
        mensajeEmpatico:
          "No pudimos generar el resumen en este momento, pero puedes continuar registrando lo observado.",
        datosOrdenados: [],
        posibleCoincidencia: "",
        preguntaDermatologo: "",
        disclaimer:
          "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8EF] text-[#25324B]">
      <BrandNav active="calma" />

      <section className="relative mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#DCD7FF]/50 blur-3xl" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#DFF5EA]/70 blur-3xl" />

        <div className="relative z-10 mb-8 grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F0DFCA] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#6F6680] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#F4A7A3]" />
              Modo Calma · Primer paso del cuidado
            </div>

            <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#25324B] md:text-6xl">
              Respira, Ana.
              <br />
              Vamos a ordenar la noche de Lucas.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625A70]">
              Cuando un brote aparece, PielCalma no responde con diagnósticos.
              Te ayuda a transformar preocupación en datos claros, preguntas
              útiles y una conversación mejor preparada con el dermatólogo.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              Calma Familiar
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-6xl font-black text-[#25324B]">72</span>
              <span className="pb-3 text-[#7B7289]">/100</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#625A70]">
              Este indicador no mide la enfermedad. Mide continuidad de
              registro, claridad y preparación para la consulta.
            </p>

            <div className="mt-5 rounded-3xl bg-[#DFF5EA] p-4">
              <p className="text-sm font-bold text-[#4B7A61]">
                Ritual de hoy
              </p>
              <p className="mt-2 text-sm leading-6 text-[#25324B]">
                Registrar sueño, comezón y posibles factores en menos de un
                minuto.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-[#25324B]">
              ¿Cómo estás viviendo este brote?
            </h2>

            <p className="mt-3 text-[#625A70]">
              Elige cómo te sientes ahora. La app adaptará el mensaje para
              ayudarte a ordenar la situación sin juzgarte.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => handleEmotionClick(emotion.id)}
                  className={`group rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C8B7A6]/20 ${
                    selectedEmotion === emotion.id
                      ? "border-[#6B5BD6] bg-white ring-4 ring-[#DCD7FF]/60"
                      : "border-[#F0DFCA] bg-[#FFF8EF]"
                  }`}
                >
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${emotion.color}`}
                  >
                    <span className="text-2xl">{emotion.emoji}</span>
                  </div>

                  <h3 className="text-lg font-black text-[#25324B]">
                    {emotion.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#625A70]">
                    {emotion.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#25324B] p-6 text-white shadow-xl shadow-[#25324B]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF]">
              Cómo funciona
            </p>

            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight">
              La app no intenta resolverlo todo. Primero calma, luego ordena.
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-white/10 p-4">
                <p className="font-bold">1. Nombrar la emoción</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Ana reconoce si está tranquila, con dudas, preocupada o
                  agotada.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-4">
                <p className="font-bold">2. Ordenar lo observado</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  La IA toma sueño, comezón y posibles factores para crear un
                  resumen seguro.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-4">
                <p className="font-bold">3. Preparar la consulta</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  La app sugiere preguntas útiles para conversar con el
                  dermatólogo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="relative z-10 mt-8 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 text-[#625A70] shadow-sm">
            Generando resumen de calma...
          </div>
        )}

        {summary && !loading && (
          <div className="relative z-10 mt-8 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              Resumen generado
            </p>

            <h2 className="mt-3 max-w-4xl font-serif text-3xl font-bold leading-tight text-[#25324B]">
              {summary.mensajeEmpatico}
            </h2>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl bg-[#FFF8EF] p-5">
                <h3 className="font-black text-[#25324B]">Datos ordenados</h3>

                <ul className="mt-4 space-y-3">
                  {summary.datosOrdenados?.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-[#625A70]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-[#DCD7FF] p-5">
                <h3 className="font-black text-[#25324B]">
                  Posible coincidencia
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#25324B]/80">
                  {summary.posibleCoincidencia}
                </p>
              </div>

              <div className="rounded-3xl bg-[#DFF5EA] p-5">
                <h3 className="font-black text-[#25324B]">
                  Pregunta para consulta
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#25324B]/80">
                  {summary.preguntaDermatologo}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <SafeDisclaimer compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="rounded-full bg-[#6B5BD6] px-6 py-4 text-center text-sm font-bold text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
              >
                Registrar brote
              </Link>

              <Link
                href="/observador"
                className="rounded-full border border-[#E8DCCB] bg-white px-6 py-4 text-center text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
              >
                Ir al Observador Visual
              </Link>
            </div>
          </div>
        )}

        <div className="relative z-10 mt-8">
          <SafeDisclaimer />
        </div>
      </section>
    </main>
  );
}