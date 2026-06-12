"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const weeklyData = [
  {
    day: "Lun",
    itch: 5,
    sleep: "Regular",
    triggers: "Calor",
    routine: "Completa",
  },
  {
    day: "Mar",
    itch: 8,
    sleep: "Malo",
    triggers: "Calor, sudor",
    routine: "Parcial",
  },
  {
    day: "Mié",
    itch: 4,
    sleep: "Bueno",
    triggers: "Sin factor claro",
    routine: "Completa",
  },
  {
    day: "Jue",
    itch: 7,
    sleep: "Malo",
    triggers: "Detergente nuevo",
    routine: "Parcial",
  },
  {
    day: "Vie",
    itch: 6,
    sleep: "Regular",
    triggers: "Sudor",
    routine: "Completa",
  },
  {
    day: "Sáb",
    itch: 8,
    sleep: "Malo",
    triggers: "Calor, sudor",
    routine: "Parcial",
  },
  {
    day: "Dom",
    itch: 5,
    sleep: "Regular",
    triggers: "Polvo",
    routine: "Completa",
  },
];

const sleepData = [
  { label: "Bueno", value: 1 },
  { label: "Regular", value: 3 },
  { label: "Malo", value: 3 },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-[#F0DFCA] bg-[#FFFCF7] p-3 text-sm shadow-lg">
        <p className="font-bold text-[#25324B]">{label}</p>
        <p className="text-[#625A70]">Comezón registrada: {payload[0].value}/10</p>
      </div>
    );
  }

  return null;
}

export default function ReportePage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    setLoading(true);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setReport(data);
    } catch (error) {
      setReport({
        resumenSemanal:
          "No pudimos generar el reporte en este momento. Puedes revisar los registros manualmente y volver a intentarlo más tarde.",
        patronesObservados: [],
        preguntasDermatologo: [],
        observacionesVisuales: [],
        calmaFamiliar: 72,
        disclaimer:
          "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8EF] text-[#25324B]">
      <div className="print:hidden">
        <BrandNav active="reporte" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 py-10 lg:py-14 print:px-0 print:py-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#DCD7FF]/50 blur-3xl print:hidden" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#DFF5EA]/70 blur-3xl print:hidden" />

        <div className="relative z-10 mb-8 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10 print:border-0 print:shadow-none">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F0DFCA] bg-[#FFF8EF] px-4 py-2 text-sm font-semibold text-[#6F6680] shadow-sm print:hidden">
                <span className="h-2 w-2 rounded-full bg-[#F4A7A3]" />
                Reporte médico · Semana de seguimiento
              </div>

              <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#25324B] md:text-6xl print:text-4xl">
                La semana de Lucas, organizada para consulta.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#625A70] print:text-base">
                Este reporte convierte registros diarios de Ana en información
                clara: comezón, sueño, posibles coincidencias, observaciones
                visuales y preguntas útiles para conversar con el dermatólogo.
              </p>
            </div>

            <div className="rounded-[2rem] bg-[#25324B] p-6 text-white shadow-xl shadow-[#25324B]/10 print:bg-white print:text-[#25324B] print:shadow-none">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF] print:text-[#6B5BD6]">
                Paciente demo
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-white/60 print:text-[#625A70]">
                    Cuidadora
                  </p>
                  <p className="text-2xl font-black">Ana</p>
                </div>

                <div>
                  <p className="text-sm text-white/60 print:text-[#625A70]">
                    Niño
                  </p>
                  <p className="text-2xl font-black">Lucas · 4 años</p>
                </div>

                <div>
                  <p className="text-sm text-white/60 print:text-[#625A70]">
                    Condición registrada
                  </p>
                  <p className="text-lg font-bold">Dermatitis atópica</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
            <button
              onClick={handlePrint}
              className="rounded-full bg-[#6B5BD6] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
            >
              Imprimir / Descargar reporte
            </button>

            <Link
              href="/calma"
              className="rounded-full border border-[#E8DCCB] bg-white px-6 py-4 text-center text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
            >
              Volver al Modo Calma
            </Link>
          </div>
        </div>

        {loading && (
          <div className="relative z-10 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 text-[#625A70] shadow-sm">
            Generando reporte semanal...
          </div>
        )}

        {report && !loading && (
          <div className="relative z-10">
            <div className="mb-6 grid gap-5 md:grid-cols-4">
              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-5 shadow-sm">
                <p className="text-sm font-bold text-[#7B7289]">Semana</p>
                <p className="mt-3 text-3xl font-black text-[#25324B]">
                  7 días
                </p>
                <p className="mt-2 text-sm text-[#625A70]">
                  Registros organizados
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#DCD7FF] p-5 shadow-sm">
                <p className="text-sm font-bold text-[#6B5BD6]">Comezón alta</p>
                <p className="mt-3 text-3xl font-black text-[#25324B]">
                  3 días
                </p>
                <p className="mt-2 text-sm text-[#25324B]/75">
                  Según registro de Ana
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#DFF5EA] p-5 shadow-sm">
                <p className="text-sm font-bold text-[#4B7A61]">Sueño afectado</p>
                <p className="mt-3 text-3xl font-black text-[#25324B]">
                  3 noches
                </p>
                <p className="mt-2 text-sm text-[#25324B]/75">
                  Reportadas como malas
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#FFE6D9] p-5 shadow-sm">
                <p className="text-sm font-bold text-[#A7685D]">
                  Calma Familiar
                </p>
                <p className="mt-3 text-3xl font-black text-[#25324B]">
                  {report.calmaFamiliar}/100
                </p>
                <p className="mt-2 text-sm text-[#25324B]/75">
                  Claridad y continuidad
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                  Resumen generado
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                  Lo importante de esta semana
                </h2>

                <p className="mt-5 leading-8 text-[#625A70]">
                  {report.resumenSemanal}
                </p>

                <div className="mt-6 rounded-3xl bg-[#FFF8EF] p-5">
                  <h3 className="font-black text-[#25324B]">
                    ¿Por qué este reporte ayuda?
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#625A70]">
                    Ana no tiene que recordar todo de memoria. Puede llevar una
                    secuencia clara de observaciones, preguntas y posibles
                    coincidencias para revisarlas con el dermatólogo.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#25324B] p-6 text-white shadow-xl shadow-[#25324B]/10">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF]">
                  Interpretación segura
                </p>

                <h2 className="mt-4 font-serif text-3xl font-bold leading-tight">
                  El reporte organiza, no concluye.
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="font-bold">No diagnostica</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      No clasifica la condición ni emite juicio clínico.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="font-bold">No indica tratamiento</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      No sugiere cremas, medicamentos, dosis o cambios de
                      rutina médica.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="font-bold">Sí mejora la consulta</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">
                      Ordena información que Ana puede conversar con su
                      dermatólogo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                      Evolución registrada
                    </p>

                    <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                      Comezón reportada por día
                    </h2>
                  </div>

                  <p className="max-w-md text-sm leading-6 text-[#625A70]">
                    Escala registrada por Ana. No representa medición clínica ni
                    severidad médica.
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="itchColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B5BD6" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#6B5BD6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8DCCB" />
                      <XAxis dataKey="day" stroke="#8C8297" />
                      <YAxis domain={[0, 10]} stroke="#8C8297" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="itch"
                        stroke="#6B5BD6"
                        strokeWidth={3}
                        fill="url(#itchColor)"
                        dot={{ r: 5, fill: "#6B5BD6", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                  Sueño
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                  Noches registradas
                </h2>

                <div className="mt-6 space-y-4">
                  {sleepData.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-[#25324B]">
                          {item.label}
                        </p>
                        <p className="text-sm text-[#625A70]">
                          {item.value} noche{item.value > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-[#FFF8EF]">
                        <div
                          className="h-full rounded-full bg-[#6B5BD6]"
                          style={{ width: `${(item.value / 7) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-[#DFF5EA] p-5">
                  <h3 className="font-black text-[#25324B]">
                    Observación para Ana
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#25324B]/80">
                    El sueño aparece como una dimensión importante del
                    seguimiento familiar. Este dato puede ayudar a explicar cómo
                    se vivieron los brotes en casa.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                    Bitácora semanal
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                    Registros de Ana
                  </h2>
                </div>

                <p className="max-w-md text-sm leading-6 text-[#625A70]">
                  Esta tabla organiza los datos cotidianos sin asumir causas ni
                  emitir conclusiones médicas.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F0DFCA] text-[#8C8297]">
                      <th className="py-4 pr-4">Día</th>
                      <th className="py-4 pr-4">Comezón</th>
                      <th className="py-4 pr-4">Sueño</th>
                      <th className="py-4 pr-4">Posibles factores</th>
                      <th className="py-4 pr-4">Rutina indicada</th>
                    </tr>
                  </thead>

                  <tbody>
                    {weeklyData.map((item) => (
                      <tr
                        key={item.day}
                        className="border-b border-[#F0DFCA]/70 text-[#625A70]"
                      >
                        <td className="py-4 pr-4 font-black text-[#25324B]">
                          {item.day}
                        </td>
                        <td className="py-4 pr-4">{item.itch}/10</td>
                        <td className="py-4 pr-4">{item.sleep}</td>
                        <td className="py-4 pr-4">{item.triggers}</td>
                        <td className="py-4 pr-4">{item.routine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCD7FF] text-2xl">
                  🧩
                </div>

                <h2 className="font-serif text-2xl font-bold text-[#25324B]">
                  Posibles patrones observados
                </h2>

                <ul className="mt-5 space-y-3">
                  {report.patronesObservados?.map((pattern, index) => (
                    <li
                      key={index}
                      className="rounded-3xl bg-[#FFF8EF] p-4 text-sm leading-6 text-[#625A70]"
                    >
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DFF5EA] text-2xl">
                  💬
                </div>

                <h2 className="font-serif text-2xl font-bold text-[#25324B]">
                  Preguntas para el dermatólogo
                </h2>

                <ul className="mt-5 space-y-3">
                  {report.preguntasDermatologo?.map((question, index) => (
                    <li
                      key={index}
                      className="rounded-3xl bg-[#DFF5EA] p-4 text-sm leading-6 text-[#25324B]/80"
                    >
                      {question}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE6D9] text-2xl">
                  👁️
                </div>

                <h2 className="font-serif text-2xl font-bold text-[#25324B]">
                  Observaciones visuales
                </h2>

                <ul className="mt-5 space-y-3">
                  {report.observacionesVisuales?.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-3xl bg-[#FFE6D9] p-4 text-sm leading-6 text-[#25324B]/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6 rounded-[2rem] bg-[#25324B] p-8 text-white shadow-xl shadow-[#25324B]/10 print:bg-white print:text-[#25324B] print:shadow-none">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF] print:text-[#6B5BD6]">
                    Cierre del reporte
                  </p>

                  <h2 className="mt-4 font-serif text-4xl font-bold leading-tight">
                    Ana llega a consulta con menos incertidumbre.
                  </h2>
                </div>

                <p className="text-sm leading-7 text-white/75 print:text-[#625A70]">
                  Este reporte permite transformar una semana emocionalmente
                  pesada en una conversación más clara. PielCalma organiza la
                  información cotidiana; la interpretación médica corresponde al
                  profesional de salud.
                </p>
              </div>
            </div>

            <SafeDisclaimer />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
              <Link
                href="/calma"
                className="rounded-full border border-[#E8DCCB] bg-white px-6 py-4 text-center text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
              >
                Volver al Modo Calma
              </Link>

              <Link
                href="/observador"
                className="rounded-full bg-[#6B5BD6] px-6 py-4 text-center text-sm font-black text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
              >
                Ver Observador Visual
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}