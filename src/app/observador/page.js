"use client";

import { useState } from "react";
import Link from "next/link";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";

export default function ObservadorPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [observation, setObservation] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
    setObservation(null);

    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
  }

  async function handleGenerateObservation() {
    setLoading(true);
    setObservation(null);

    try {
      const response = await fetch("/api/visual-observation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageName: selectedImage?.name || "registro-lucas-dia-7.jpg",
        }),
      });

      const data = await response.json();
      setObservation(data);
    } catch (error) {
      setObservation({
        observacionVisual:
          "No pudimos generar la observación visual en este momento.",
        comparacionAnterior:
          "Puedes guardar la imagen y volver a intentarlo más tarde.",
        indiceVisualCambio: "No disponible",
        limitaciones:
          "La observación puede verse afectada por iluminación, distancia, ángulo y calidad de imagen.",
        disclaimer:
          "Esta observación no constituye diagnóstico médico y no reemplaza la evaluación del dermatólogo.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8EF] text-[#25324B]">
      <BrandNav active="observador" />

      <section className="relative mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#FFE6D9]/70 blur-3xl" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#DCD7FF]/60 blur-3xl" />

        <div className="relative z-10 mb-8 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F0DFCA] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#6F6680] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#F4A7A3]" />
              Observador Visual · Descripción segura
            </div>

            <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#25324B] md:text-6xl">
              Una foto para recordar mejor, no para diagnosticar.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625A70]">
              Ana puede subir una imagen del brote de Lucas para generar una
              observación visual descriptiva. La app compara cambios visibles,
              aclara sus limitaciones y prepara información para la consulta.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              Límite ético
            </p>

            <h2 className="mt-4 font-serif text-3xl font-bold text-[#25324B]">
              La cámara no reemplaza al dermatólogo.
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-[#DFF5EA] p-4">
                <p className="text-sm font-bold text-[#4B7A61]">
                  Sí hace
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]">
                  Describe cambios visibles y ayuda a compararlos en el tiempo.
                </p>
              </div>

              <div className="rounded-3xl bg-[#FFE6D9] p-4">
                <p className="text-sm font-bold text-[#A7685D]">
                  No hace
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]">
                  No diagnostica, no mide severidad médica y no indica
                  tratamientos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                  Registro visual
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                  Sube una imagen del brote
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#625A70]">
                  Para esta demo, la observación es simulada y segura. El flujo
                  muestra cómo Ana podría documentar cambios entre consultas.
                </p>
              </div>

              <div className="hidden rounded-3xl bg-[#FFF8EF] p-4 text-center md:block">
                <p className="text-3xl">📷</p>
                <p className="mt-2 text-xs font-bold text-[#7B7289]">
                  Foto de apoyo
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#DCD7FF] bg-[#FFF8EF] p-8 text-center transition hover:bg-[#F7F3FF]">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCD7FF] text-4xl">
                🖼️
              </span>

              <span className="mt-5 text-lg font-black text-[#25324B]">
                Seleccionar imagen
              </span>

              <span className="mt-2 max-w-sm text-sm leading-6 text-[#625A70]">
                Sube una foto para que PielCalma genere una observación
                descriptiva y comparativa.
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {selectedImage && (
              <div className="mt-5 rounded-3xl bg-[#FFF8EF] p-5">
                <p className="text-sm font-black text-[#25324B]">
                  Imagen seleccionada
                </p>
                <p className="mt-1 break-all text-sm text-[#625A70]">
                  {selectedImage.name}
                </p>
              </div>
            )}

            <button
              onClick={handleGenerateObservation}
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#6B5BD6] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Generando observación..."
                : "Generar observación visual"}
            </button>

            <div className="mt-5 rounded-3xl bg-[#DFF5EA] p-5">
              <h3 className="font-black text-[#25324B]">
                ¿Qué buscamos observar?
              </h3>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#25324B]/80">
                <li>• Cambios visibles de coloración aparente.</li>
                <li>• Diferencias de extensión respecto al registro previo.</li>
                <li>• Limitaciones por luz, ángulo o distancia.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
                  Vista previa
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-[#25324B]">
                  La memoria visual de Ana
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#625A70]">
                  La imagen no se interpreta como diagnóstico. Sirve como parte
                  de la bitácora para comparar registros.
                </p>
              </div>
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-[2rem] border border-[#F0DFCA] bg-[#FFF8EF] shadow-inner">
                <img
                  src={previewUrl}
                  alt="Vista previa del registro visual"
                  className="h-96 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-[2rem] border border-[#F0DFCA] bg-[#FFF8EF] text-center">
                <div className="max-w-sm px-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFE6D9] text-4xl">
                    🌤️
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-bold text-[#25324B]">
                    Aún no hay imagen
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#625A70]">
                    Cuando Ana seleccione una foto, aparecerá aquí para revisar
                    el registro visual antes de generar la observación.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-[#DCD7FF] p-5">
                <p className="text-sm font-bold text-[#6B5BD6]">
                  Comparación
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]/80">
                  La app contrasta el registro actual con el anterior en
                  lenguaje simple.
                </p>
              </div>

              <div className="rounded-3xl bg-[#FFE6D9] p-5">
                <p className="text-sm font-bold text-[#A7685D]">
                  Precaución
                </p>
                <p className="mt-2 text-sm leading-6 text-[#25324B]/80">
                  Luz, distancia y ángulo pueden cambiar la observación.
                </p>
              </div>
            </div>
          </div>
        </div>

        {observation && (
          <div className="relative z-10 mt-8 rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-xl shadow-[#C8B7A6]/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              Observación generada
            </p>

            <h2 className="mt-3 max-w-4xl font-serif text-3xl font-bold leading-tight text-[#25324B]">
              Una descripción para recordar mejor lo que Ana observó.
            </h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="rounded-3xl bg-[#FFF8EF] p-5">
                  <h3 className="font-black text-[#25324B]">
                    Lo que se observa
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#625A70]">
                    {observation.observacionVisual}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#DCD7FF] p-5">
                  <h3 className="font-black text-[#25324B]">
                    Comparación con registro anterior
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#25324B]/80">
                    {observation.comparacionAnterior}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#FFE6D9] p-5">
                  <h3 className="font-black text-[#25324B]">
                    Limitaciones de la imagen
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#25324B]/80">
                    {observation.limitaciones}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2rem] bg-[#25324B] p-6 text-white shadow-xl shadow-[#25324B]/10">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF]">
                    Índice Visual de Cambio
                  </p>

                  <div className="mt-5 text-6xl font-black">
                    {observation.indiceVisualCambio}
                  </div>

                  <p className="mt-5 text-sm leading-6 text-white/75">
                    Este índice es comparativo y descriptivo. No mide severidad
                    médica, no confirma causas y no reemplaza evaluación
                    profesional.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-[#F0DFCA] bg-white p-6">
                  <h3 className="font-serif text-2xl font-bold text-[#25324B]">
                    ¿Por qué ayuda?
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#625A70]">
                    Ana puede llevar una secuencia visual ordenada, explicar
                    mejor los cambios percibidos y preparar preguntas más
                    concretas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <SafeDisclaimer compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/reporte"
                className="rounded-full bg-[#6B5BD6] px-6 py-4 text-center text-sm font-bold text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
              >
                Generar reporte médico
              </Link>

              <Link
                href="/registro"
                className="rounded-full border border-[#E8DCCB] bg-white px-6 py-4 text-center text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
              >
                Volver al registro
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