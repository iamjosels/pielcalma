"use client";

import { useState } from "react";
import Link from "next/link";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";

const affectedAreas = ["Cuello", "Brazos", "Piernas", "Rostro", "Pliegues"];
const triggerOptions = [
  "Calor",
  "Sudor",
  "Polvo",
  "Detergente nuevo",
  "Comida nueva",
  "Estrés",
  "Mascota",
];

export default function RegistroPage() {
  const [itchLevel, setItchLevel] = useState(8);
  const [sleepQuality, setSleepQuality] = useState("malo");
  const [routineStatus, setRoutineStatus] = useState("parcial");
  const [caregiverEmotion, setCaregiverEmotion] = useState("preocupada");
  const [selectedAreas, setSelectedAreas] = useState(["Cuello", "Brazos"]);
  const [selectedTriggers, setSelectedTriggers] = useState(["Calor", "Sudor"]);
  const [notes, setNotes] = useState(
    "Lucas se rascó durante la noche y durmió interrumpido."
  );

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  function toggleArea(area) {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((item) => item !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  }

  function toggleTrigger(trigger) {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((item) => item !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setSummary(null);

    try {
      const response = await fetch("/api/calm-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotion: caregiverEmotion,
          itchLevel,
          sleepQuality,
          triggers: selectedTriggers,
        }),
      });

      const data = await response.json();

      setSummary({
        ...data,
        registro: {
          itchLevel,
          sleepQuality,
          routineStatus,
          caregiverEmotion,
          selectedAreas,
          selectedTriggers,
          notes,
        },
      });
    } catch (error) {
      setSummary({
        mensajeEmpatico:
          "El registro fue completado, pero no pudimos generar el resumen inteligente en este momento.",
        datosOrdenados: [
          `Comezón registrada: ${itchLevel}/10`,
          `Sueño: ${sleepQuality}`,
          `Zonas registradas: ${selectedAreas.join(", ")}`,
          `Posibles factores: ${selectedTriggers.join(", ")}`,
        ],
        posibleCoincidencia:
          "La información quedó organizada para revisarla luego.",
        preguntaDermatologo:
          "¿Qué información de este registro sería más útil revisar en consulta?",
        disclaimer:
          "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8EF] text-[#25324B]">
      <BrandNav active="registro" />

      <section className="relative mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#DFF5EA]/60 blur-3xl" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#FFE6D9]/70 blur-3xl" />

        <div className="relative z-10 mb-8 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F0DFCA] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#6F6680] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#F4A7A3]" />
              Registro inteligente · 1 minuto al día
            </div>

            <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#25324B] md:text-6xl">
              Que Ana no tenga que recordarlo todo de memoria.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625A70]">
              Registra lo importante del brote de Lucas: comezón, sueño, zonas
              observadas, posibles factores y cómo se siente Ana. PielCalma
              convierte esos datos en un resumen claro y seguro.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              Bitácora de hoy
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-[#DCD7FF] p-4">
                <p className="text-sm font-bold text-[#6B5BD6]">
                  Lo esencial
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]">
                  Sueño, comezón y posibles factores. Nada más. Sin complicar a
                  Ana.
                </p>
              </div>

              <div className="rounded-3xl bg-[#DFF5EA] p-4">
                <p className="text-sm font-bold text-[#4B7A61]">
                  Lo humano
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]">
                  También se registra cómo se siente la cuidadora, porque la
                  carga mental importa.
                </p>
              </div>

              <div className="rounded-3xl bg-[#FFE6D9] p-4">
                <p className="text-sm font-bold text-[#A7685D]">
                  Lo útil
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]">
                  Cada registro alimenta el reporte médico semanal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm"
          >
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                  Registro de brote
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                  ¿Qué ocurrió hoy con Lucas?
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#625A70]">
                  Esta información no interpreta clínicamente el brote. Solo
                  ordena observaciones cotidianas para dar seguimiento.
                </p>
              </div>

              <div className="hidden rounded-3xl bg-[#FFF8EF] p-4 text-center md:block">
                <p className="text-3xl">✍️</p>
                <p className="mt-2 text-xs font-bold text-[#7B7289]">
                  Menos de 1 min
                </p>
              </div>
            </div>

            <div className="mb-7 rounded-[1.5rem] bg-[#FFF8EF] p-5">
              <label className="mb-4 block font-black text-[#25324B]">
                Nivel de comezón reportado: {itchLevel}/10
              </label>

              <input
                type="range"
                min="1"
                max="10"
                value={itchLevel}
                onChange={(event) => setItchLevel(Number(event.target.value))}
                className="w-full accent-[#6B5BD6]"
              />

              <div className="mt-3 flex justify-between text-xs font-semibold text-[#8C8297]">
                <span>Menor incomodidad</span>
                <span>Mayor incomodidad</span>
              </div>
            </div>

            <div className="mb-7 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-[#25324B]">
                  Calidad de sueño
                </label>

                <select
                  value={sleepQuality}
                  onChange={(event) => setSleepQuality(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8DCCB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B5BD6] focus:ring-4 focus:ring-[#DCD7FF]/50"
                >
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-[#25324B]">
                  Rutina indicada
                </label>

                <select
                  value={routineStatus}
                  onChange={(event) => setRoutineStatus(event.target.value)}
                  className="w-full rounded-2xl border border-[#E8DCCB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B5BD6] focus:ring-4 focus:ring-[#DCD7FF]/50"
                >
                  <option value="completa">Completa</option>
                  <option value="parcial">Parcial</option>
                  <option value="no realizada">No realizada</option>
                </select>
              </div>
            </div>

            <div className="mb-7">
              <label className="mb-3 block text-sm font-black text-[#25324B]">
                Zonas observadas
              </label>

              <div className="flex flex-wrap gap-2">
                {affectedAreas.map((area) => (
                  <button
                    type="button"
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      selectedAreas.includes(area)
                        ? "bg-[#25324B] text-white shadow-sm"
                        : "border border-[#E8DCCB] bg-white text-[#625A70] hover:bg-[#FFF8EF]"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <label className="mb-3 block text-sm font-black text-[#25324B]">
                Posibles factores observados
              </label>

              <div className="flex flex-wrap gap-2">
                {triggerOptions.map((trigger) => (
                  <button
                    type="button"
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      selectedTriggers.includes(trigger)
                        ? "bg-[#6B5BD6] text-white shadow-sm"
                        : "border border-[#E8DCCB] bg-white text-[#625A70] hover:bg-[#FFF8EF]"
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-[#8C8297]">
                Estos factores son observaciones de Ana. No confirman causas
                médicas.
              </p>
            </div>

            <div className="mb-7">
              <label className="mb-2 block text-sm font-black text-[#25324B]">
                ¿Cómo se siente Ana?
              </label>

              <select
                value={caregiverEmotion}
                onChange={(event) => setCaregiverEmotion(event.target.value)}
                className="w-full rounded-2xl border border-[#E8DCCB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B5BD6] focus:ring-4 focus:ring-[#DCD7FF]/50"
              >
                <option value="tranquila">Tranquila</option>
                <option value="con dudas">Con dudas</option>
                <option value="preocupada">Preocupada</option>
                <option value="agotada">Agotada</option>
              </select>
            </div>

            <div className="mb-7">
              <label className="mb-2 block text-sm font-black text-[#25324B]">
                Nota de Ana
              </label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows="4"
                className="w-full resize-none rounded-2xl border border-[#E8DCCB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6B5BD6] focus:ring-4 focus:ring-[#DCD7FF]/50"
                placeholder="Ejemplo: Lucas se rascó más después de jugar y sudar..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#6B5BD6] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Ordenando registro..." : "Guardar y generar resumen"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                Caso demo
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                Ana y Lucas
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-6 text-[#625A70]">
                <p>
                  <strong className="text-[#25324B]">Ana</strong> vive en Lima y
                  cuida a Lucas, un niño de 4 años con dermatitis atópica
                  diagnosticada.
                </p>

                <p>
                  En los brotes, su mayor problema no es falta de información,
                  sino la incertidumbre: qué observar, qué recordar y cómo
                  explicarlo después.
                </p>

                <p>
                  PielCalma convierte ese momento en una bitácora clara para la
                  consulta.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#25324B] p-6 text-white shadow-xl shadow-[#25324B]/10">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF]">
                Ritual de seguimiento
              </p>

              <h3 className="mt-4 font-serif text-3xl font-bold">
                Registrar no es vigilar. Es liberar memoria.
              </h3>

              <p className="mt-4 text-sm leading-6 text-white/75">
                Cada dato registrado reduce la carga mental de Ana y prepara
                una conversación más concreta con el dermatólogo.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
              <h3 className="font-black text-[#25324B]">Siguiente paso</h3>

              <p className="mt-3 text-sm leading-6 text-[#625A70]">
                Después de guardar el registro, Ana puede subir una foto para
                generar una observación visual descriptiva.
              </p>

              <Link
                href="/observador"
                className="mt-5 inline-flex rounded-full border border-[#E8DCCB] bg-white px-5 py-3 text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
              >
                Ir al Observador Visual
              </Link>
            </div>

            <SafeDisclaimer />
          </div>
        </div>

        {summary && !loading && (
          <div className="relative z-10 mt-8 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              Registro guardado
            </p>

            <h2 className="mt-3 max-w-4xl font-serif text-3xl font-bold leading-tight text-[#25324B]">
              {summary.mensajeEmpatico}
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-[#DCD7FF] p-5">
                <p className="text-sm font-bold text-[#6B5BD6]">Comezón</p>
                <p className="mt-3 text-3xl font-black text-[#25324B]">
                  {itchLevel}/10
                </p>
              </div>

              <div className="rounded-3xl bg-[#DFF5EA] p-5">
                <p className="text-sm font-bold text-[#4B7A61]">Sueño</p>
                <p className="mt-3 text-3xl font-black capitalize text-[#25324B]">
                  {sleepQuality}
                </p>
              </div>

              <div className="rounded-3xl bg-[#FFE6D9] p-5">
                <p className="text-sm font-bold text-[#A7685D]">Rutina</p>
                <p className="mt-3 text-3xl font-black capitalize text-[#25324B]">
                  {routineStatus}
                </p>
              </div>

              <div className="rounded-3xl bg-[#E6F0FF] p-5">
                <p className="text-sm font-bold text-[#496B9E]">Ana</p>
                <p className="mt-3 text-2xl font-black capitalize text-[#25324B]">
                  {caregiverEmotion}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl bg-[#FFF8EF] p-5">
                <h3 className="font-black text-[#25324B]">
                  Zonas observadas
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#625A70]">
                  {selectedAreas.join(", ") || "Sin selección"}
                </p>
              </div>

              <div className="rounded-3xl bg-[#FFF8EF] p-5">
                <h3 className="font-black text-[#25324B]">
                  Posibles factores
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#625A70]">
                  {selectedTriggers.join(", ") || "Sin selección"}
                </p>
              </div>

              <div className="rounded-3xl bg-[#FFF8EF] p-5">
                <h3 className="font-black text-[#25324B]">Nota de Ana</h3>
                <p className="mt-3 text-sm leading-6 text-[#625A70]">
                  {notes || "Sin nota adicional"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl bg-[#DCD7FF] p-5">
                <h3 className="font-black text-[#25324B]">
                  Posible coincidencia observada
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#25324B]/80">
                  {summary.posibleCoincidencia}
                </p>
              </div>

              <div className="rounded-3xl bg-[#DFF5EA] p-5">
                <h3 className="font-black text-[#25324B]">
                  Pregunta sugerida para el dermatólogo
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#25324B]/80">
                  {summary.preguntaDermatologo}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <SafeDisclaimer compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/observador"
                className="rounded-full bg-[#6B5BD6] px-6 py-4 text-center text-sm font-bold text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
              >
                Continuar al Observador Visual
              </Link>

              <Link
                href="/reporte"
                className="rounded-full border border-[#E8DCCB] bg-white px-6 py-4 text-center text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
              >
                Ver reporte semanal
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