"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, ArrowClockwise, Warning } from "@/components/icons";

/**
 * Captura real desde la cámara (webcam o cámara del móvil).
 * onCapture(file) recibe un File JPEG; onClose() cierra el panel.
 */
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [facing, setFacing] = useState("environment");

  useEffect(() => {
    let cancelled = false;
    async function start() {
      stop();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        // segundo intento sin facingMode (laptops)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } catch {
          if (!cancelled) setError("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
        }
      }
    }
    start();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  function stop() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" });
        stop();
        onCapture(file);
      },
      "image/jpeg",
      0.9
    );
  }

  function close() {
    stop();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-cream-card shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-2">
            <Camera size={20} weight="duotone" className="text-accent" />
            <p className="font-semibold text-navy">Cámara</p>
          </div>
          <button onClick={close} aria-label="Cerrar" className="text-ink-muted transition hover:text-navy">
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="relative aspect-[4/3] bg-navy">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <Warning size={28} weight="duotone" className="text-coral" />
              <p className="text-sm leading-relaxed text-white/85">{error}</p>
            </div>
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <button
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:text-navy"
          >
            <ArrowClockwise size={16} weight="bold" />
            Cambiar cámara
          </button>
          <button
            onClick={capture}
            disabled={Boolean(error)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-accent-press active:scale-[0.98] disabled:opacity-55"
          >
            <Camera size={18} weight="bold" />
            Capturar
          </button>
        </div>
      </div>
    </div>
  );
}
