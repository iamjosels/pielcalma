"use client";

import { useEffect, useState } from "react";
import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { useStore, addObservation } from "@/lib/store";
import { prepareImage } from "@/lib/imageSignal";
import { makeSkinSample, SKIN_VARIANTS } from "@/lib/demoSkin";
import CameraCapture from "@/components/CameraCapture";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Skeleton,
  TactileButton,
} from "@/components/motion";
import {
  Camera,
  ImageSquare,
  UploadSimple,
  Eye,
  ArrowsLeftRight,
  Warning,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "@/components/icons";

export default function ObservadorPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [observation, setObservation] = useState(null);
  const [compare, setCompare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoSamples, setDemoSamples] = useState(null);

  const { observations, profile } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const caregiver = mounted ? profile.caregiverName : "Ana";
  const child = mounted ? profile.childName : "Lucas";

  // Limpieza del object URL para evitar fugas de memoria.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function applyFile(file) {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(file);
    setObservation(null);
    setCompare(null);
    setError(false);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleImageChange(event) {
    applyFile(event.target.files?.[0]);
  }

  // Botón "secreto" de demo: la tecla "d" alterna el panel de ejemplos.
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        setShowDemo((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Genera las muestras sintéticas la primera vez que se abre el panel.
  useEffect(() => {
    if (showDemo && !demoSamples) {
      Promise.all(SKIN_VARIANTS.map((v) => makeSkinSample(v)))
        .then(setDemoSamples)
        .catch(() => {});
    }
  }, [showDemo, demoSamples]);

  async function handleGenerateObservation() {
    if (!selectedImage) return;
    setLoading(true);
    setObservation(null);
    setError(false);

    try {
      // Decodifica una sola vez: señal (índice), imagen para el modelo y miniatura.
      const { redness, brightness, send, thumb } = await prepareImage(selectedImage);
      const prev = observations[0]; // observación más reciente del perfil
      const deltaPct =
        prev && prev.redness
          ? Math.round(((redness - prev.redness) / prev.redness) * 100)
          : null;
      const imageName = selectedImage?.name || "imagen.jpg";

      const response = await fetch("/api/visual-observation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageName,
          redness,
          brightness,
          hasPrevious: Boolean(prev),
          deltaPct,
          imageData: send, // 👈 la IA observa realmente la imagen
        }),
      });
      if (!response.ok) throw new Error("bad status");
      const data = await response.json();

      // Persiste la observación (con miniatura) en el historial del perfil.
      addObservation({ ...data, redness, brightness, imageName, thumb });
      setObservation(data);
      setCompare({ prev: prev?.thumb || null, current: thumb });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-cream text-ink">
      <BrandNav active="observador" />

      <section className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-wash-peach/60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-accent-soft/45 blur-3xl"
        />

        {/* Encabezado */}
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-4 py-2 text-sm font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Observador Visual · Descripción segura
            </span>
            <h1 className="font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl">
              Una foto para recordar mejor, no para diagnosticar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {caregiver} puede subir una imagen del brote de {child} para generar
              una observación visual descriptiva. La app compara cambios visibles,
              aclara sus limitaciones y prepara información para la consulta.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Límite ético
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-navy">
                La cámara no reemplaza al dermatólogo.
              </h2>
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex gap-3 rounded-[1.25rem] bg-wash-green p-4">
                  <CheckCircle size={22} weight="duotone" className="mt-0.5 shrink-0 text-navy" />
                  <div>
                    <p className="text-sm font-semibold text-navy">Sí hace</p>
                    <p className="mt-1 text-sm leading-relaxed text-navy/70">
                      Describe cambios visibles y ayuda a compararlos en el tiempo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-[1.25rem] bg-wash-peach p-4">
                  <Warning size={22} weight="duotone" className="mt-0.5 shrink-0 text-coral" />
                  <div>
                    <p className="text-sm font-semibold text-navy">No hace</p>
                    <p className="mt-1 text-sm leading-relaxed text-navy/70">
                      No diagnostica, no mide severidad médica y no indica
                      tratamientos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Subida + vista previa */}
        <div className="relative mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="relative rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            {/* Disparador discreto de ejemplos de demo (también tecla "d") */}
            <button
              onClick={() => setShowDemo((v) => !v)}
              title="Ejemplos de demo (tecla d)"
              aria-label="Ejemplos de demo"
              className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-ink-faint/30 transition hover:scale-125 hover:bg-accent"
            />
            <div className="mb-7 flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Registro visual
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-navy sm:text-3xl">
                  Sube una imagen del brote
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Para esta demo, la observación es simulada y segura. Muestra
                  cómo Ana documentaría cambios entre consultas.
                </p>
              </div>
              <div className="hidden shrink-0 flex-col items-center rounded-[1.25rem] bg-cream p-4 text-center ring-1 ring-inset ring-hairline md:flex">
                <Camera size={26} weight="duotone" className="text-accent" />
                <p className="mt-2 text-xs font-medium text-ink-muted">
                  Foto de apoyo
                </p>
              </div>
            </div>

            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-accent-soft bg-cream p-8 text-center transition hover:border-accent hover:bg-accent-soft/20">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft p-4 transition-transform group-hover:-translate-y-1">
                <UploadSimple size={30} weight="duotone" className="text-accent" />
              </span>
              <span className="mt-5 text-lg font-semibold text-navy">
                Seleccionar imagen
              </span>
              <span className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
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

            <button
              onClick={() => setShowCamera(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-hairline-strong bg-cream-card px-6 py-3 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:border-accent/45 hover:text-accent active:scale-[0.98]"
            >
              <Camera size={18} weight="bold" />
              Usar cámara
            </button>

            {showDemo && (
              <div className="mt-4 rounded-[1.25rem] border border-dashed border-accent/40 bg-accent-soft/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Ejemplos de demo
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Imágenes sintéticas para mostrar el flujo (no son fotos reales).
                </p>
                <div className="mt-3 flex gap-3">
                  {demoSamples ? (
                    demoSamples.map((s) => (
                      <button
                        key={s.variant}
                        onClick={() => {
                          applyFile(s.file);
                          setShowDemo(false);
                        }}
                        className="group flex flex-col items-center gap-1"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.dataUrl}
                          alt={`Ejemplo ${s.label}`}
                          className="h-16 w-16 rounded-[0.8rem] object-cover ring-1 ring-hairline transition group-hover:ring-2 group-hover:ring-accent"
                        />
                        <span className="text-[0.7rem] text-ink-muted">{s.label}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-ink-faint">Generando ejemplos…</p>
                  )}
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="mt-5 flex items-center gap-3 rounded-[1.25rem] bg-cream p-4 ring-1 ring-inset ring-hairline">
                <ImageSquare size={22} weight="duotone" className="shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">
                    Imagen seleccionada
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {selectedImage.name}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateObservation}
              disabled={loading || !selectedImage}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-accent-press active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? "Generando observación…" : "Generar observación visual"}
              {!loading && <Eye size={18} weight="bold" />}
            </button>
            {!selectedImage && (
              <p className="mt-2 text-center text-xs text-ink-faint">
                Selecciona una imagen para activar la observación.
              </p>
            )}

            <div className="mt-5 rounded-[1.25rem] bg-wash-green p-5">
              <h3 className="font-semibold text-navy">¿Qué buscamos observar?</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-navy/80">
                <li className="flex gap-2">
                  <Eye size={16} weight="bold" className="mt-0.5 shrink-0 text-navy/60" />
                  Cambios visibles de coloración aparente.
                </li>
                <li className="flex gap-2">
                  <ArrowsLeftRight size={16} weight="bold" className="mt-0.5 shrink-0 text-navy/60" />
                  Diferencias de extensión respecto al registro previo.
                </li>
                <li className="flex gap-2">
                  <Warning size={16} weight="bold" className="mt-0.5 shrink-0 text-navy/60" />
                  Limitaciones por luz, ángulo o distancia.
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Vista previa
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-navy sm:text-3xl">
                La memoria visual de {caregiver}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                La imagen no se interpreta como diagnóstico. Sirve como parte de
                la bitácora para comparar registros.
              </p>
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-[1.75rem] border border-hairline bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Vista previa del registro visual de Lucas"
                  className="h-96 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-[1.75rem] border border-dashed border-hairline-strong bg-cream text-center">
                <div className="max-w-sm px-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-wash-peach">
                    <ImageSquare size={34} weight="duotone" className="text-navy" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-navy">
                    Aún no hay imagen
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    Cuando {caregiver} seleccione una foto, aparecerá aquí para
                    revisar el registro visual antes de generar la observación.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="flex gap-3 rounded-[1.25rem] bg-accent-soft p-5">
                <ArrowsLeftRight size={20} weight="duotone" className="mt-0.5 shrink-0 text-navy" />
                <div>
                  <p className="text-sm font-semibold text-navy">Comparación</p>
                  <p className="mt-1 text-sm leading-relaxed text-navy/80">
                    Contrasta el registro actual con el anterior en lenguaje
                    simple.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-[1.25rem] bg-wash-peach p-5">
                <Warning size={20} weight="duotone" className="mt-0.5 shrink-0 text-coral" />
                <div>
                  <p className="text-sm font-semibold text-navy">Precaución</p>
                  <p className="mt-1 text-sm leading-relaxed text-navy/80">
                    Luz, distancia y ángulo pueden cambiar la observación.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Carga */}
        {loading && (
          <div className="relative mt-8 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="mt-4 h-9 w-3/4" />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="flex flex-col gap-5">
                <Skeleton className="h-28 w-full rounded-[1.25rem]" />
                <Skeleton className="h-28 w-full rounded-[1.25rem]" />
              </div>
              <Skeleton className="h-60 w-full rounded-[1.75rem]" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="relative mt-8 flex flex-col gap-4 rounded-[var(--radius-card)] border border-coral/40 bg-wash-peach/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex gap-3">
              <Warning size={24} weight="duotone" className="mt-0.5 shrink-0 text-coral" />
              <div>
                <p className="font-semibold text-navy">
                  No pudimos generar la observación ahora mismo.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Tu imagen sigue cargada. Puedes intentarlo de nuevo en un
                  momento.
                </p>
              </div>
            </div>
            <TactileButton
              onClick={handleGenerateObservation}
              variant="secondary"
              className="shrink-0 px-5 py-3 text-sm"
            >
              Reintentar
            </TactileButton>
          </div>
        )}

        {/* Observación */}
        {observation && !loading && (
          <div className="relative mt-8 rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Observación generada
              </p>
              {mounted && observations.length > 0 && (
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                  {observations.length} en el historial
                </span>
              )}
            </div>
            <h2 className="mt-3 max-w-4xl font-display text-2xl font-semibold leading-tight text-navy sm:text-3xl">
              Una descripción para recordar mejor lo que {caregiver} observó.
            </h2>

            {/* Comparación visual antes / ahora */}
            {compare && (
              <div className="mt-6 rounded-[1.5rem] border border-hairline bg-cream p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Comparación visual
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                  {compare.prev ? (
                    <figure className="flex flex-col items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={compare.prev}
                        alt="Registro visual anterior"
                        className="h-28 w-28 rounded-[1rem] object-cover ring-1 ring-hairline"
                      />
                      <figcaption className="text-xs text-ink-muted">Anterior</figcaption>
                    </figure>
                  ) : (
                    <div className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-[1rem] border border-dashed border-hairline-strong text-center">
                      <ImageSquare size={20} weight="duotone" className="text-ink-faint" />
                      <span className="px-2 text-[0.65rem] leading-tight text-ink-faint">
                        Sin foto anterior
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center">
                    <ArrowsLeftRight size={22} weight="bold" className="text-accent" />
                    <span className="mt-1 rounded-full bg-accent-soft px-3 py-1 font-mono text-sm font-semibold text-accent">
                      {observation.indiceVisualCambio}
                    </span>
                  </div>

                  <figure className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={compare.current}
                      alt="Registro visual actual"
                      className="h-28 w-28 rounded-[1rem] object-cover ring-2 ring-accent/50"
                    />
                    <figcaption className="text-xs font-medium text-navy">Ahora</figcaption>
                  </figure>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                  Comparación descriptiva entre fotos. No es una medida clínica ni de
                  severidad.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Stagger className="flex flex-col gap-5">
                <StaggerItem className="rounded-[1.5rem] bg-cream p-5 ring-1 ring-inset ring-hairline">
                  <h3 className="font-semibold text-navy">Lo que se observa</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {observation.observacionVisual}
                  </p>
                </StaggerItem>
                <StaggerItem className="rounded-[1.5rem] bg-accent-soft p-5">
                  <h3 className="font-semibold text-navy">
                    Comparación con registro anterior
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy/80">
                    {observation.comparacionAnterior}
                  </p>
                </StaggerItem>
                <StaggerItem className="rounded-[1.5rem] bg-wash-peach p-5">
                  <h3 className="font-semibold text-navy">
                    Limitaciones de la imagen
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy/80">
                    {observation.limitaciones}
                  </p>
                </StaggerItem>
              </Stagger>

              <div className="flex flex-col gap-5">
                <div className="rounded-[1.5rem] bg-navy p-6 text-white shadow-[var(--shadow-soft)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
                    Índice Visual de Cambio
                  </p>
                  <div className="mt-4 font-mono text-6xl font-semibold">
                    {observation.indiceVisualCambio}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/75">
                    Este índice es comparativo y descriptivo. No mide severidad
                    médica, no confirma causas y no reemplaza evaluación
                    profesional.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-hairline bg-cream p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} weight="duotone" className="text-accent" />
                    <h3 className="font-display text-xl font-semibold text-navy">
                      ¿Por qué ayuda?
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    Ana puede llevar una secuencia visual ordenada, explicar mejor
                    los cambios percibidos y preparar preguntas más concretas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <SafeDisclaimer compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TactileButton href="/reporte" variant="primary" className="px-6 py-3.5 text-sm">
                Generar reporte médico
                <ArrowRight size={18} weight="bold" />
              </TactileButton>
              <TactileButton href="/registro" variant="secondary" className="px-6 py-3.5 text-sm">
                <ArrowLeft size={18} weight="bold" />
                Volver al registro
              </TactileButton>
            </div>
          </div>
        )}

        <div className="relative mt-8">
          <SafeDisclaimer />
        </div>

        {showCamera && (
          <CameraCapture
            onCapture={(file) => {
              applyFile(file);
              setShowCamera(false);
            }}
            onClose={() => setShowCamera(false)}
          />
        )}
      </section>
    </main>
  );
}
