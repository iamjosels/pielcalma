"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useStore } from "@/lib/store";
import { monthHeatmap } from "@/lib/aggregate";
import { CaretRight, CaretDown, ArrowRight, X, NotePencil } from "@/components/icons";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const WD = ["D", "L", "M", "M", "J", "V", "S"];
const SLEEP = { bueno: "Bueno", regular: "Regular", malo: "Malo" };

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HeatmapCalendar() {
  const { logs } = useStore();
  const [mounted, setMounted] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [daySheet, setDaySheet] = useState(null); // {date, log, status}
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const hm = useMemo(
    () => monthHeatmap(mounted ? logs : [], cursor.y, cursor.m),
    [mounted, logs, cursor]
  );
  const today = localToday();

  function shift(delta) {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-card)]">
      {/* Encabezado del mes */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Resumen de este mes
          </p>
          <h2 className="mt-0.5 font-display text-xl font-semibold capitalize text-navy">
            {MESES[cursor.m]} {cursor.y}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Mes anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition active:scale-90 hover:text-navy"
          >
            <CaretDown size={18} weight="bold" className="rotate-90" />
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Mes siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition active:scale-90 hover:text-navy"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {WD.map((d, i) => (
          <span key={i} className="text-center text-[0.7rem] font-medium text-ink-faint">
            {d}
          </span>
        ))}
      </div>

      {/* Grilla del mes */}
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: hm.firstWeekday }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {hm.cells.map((c) => {
          const isToday = c.date === today;
          const base =
            c.status === "verde"
              ? "bg-wash-green text-navy"
              : c.status === "ambar"
                ? "bg-amber-soft text-navy ring-1 ring-inset ring-amber/60"
                : "bg-cream-sunk text-ink-faint";
          return (
            <button
              key={c.date}
              onClick={() => setDaySheet(c)}
              className={`flex aspect-square items-center justify-center rounded-[0.7rem] text-sm font-medium transition active:scale-90 ${base} ${
                isToday ? "ring-2 ring-accent ring-offset-1 ring-offset-cream-card" : ""
              }`}
            >
              {c.day}
            </button>
          );
        })}
      </div>

      {/* Leyenda + resumen de control */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-wash-green" /> Estable
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-soft ring-1 ring-inset ring-amber/60" /> Brote leve
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cream-sunk" /> Sin datos
        </span>
      </div>

      {hm.registrados > 0 && (
        <div className="mt-3 rounded-[1.2rem] bg-wash-green/60 p-4">
          <p className="text-sm leading-relaxed text-navy">
            <span className="font-mono font-semibold">{hm.verde}</span> de{" "}
            <span className="font-mono font-semibold">{hm.registrados}</span> días registrados este mes
            están en verde. Vas bien: la mayoría de los días están bajo control.
          </p>
        </div>
      )}

      {/* Hoja de detalle del día */}
      <AnimatePresence>
        {daySheet && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button aria-label="Cerrar" onClick={() => setDaySheet(null)} className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]" />
            <motion.div
              role="dialog"
              className="safe-bottom relative z-10 mx-auto w-full max-w-[520px] rounded-t-[var(--radius-card)] border-t border-hairline bg-cream-card px-5 pb-6 pt-3 shadow-[var(--shadow-lift)]"
              initial={reduce ? false : { y: "100%" }}
              animate={reduce ? {} : { y: 0 }}
              exit={reduce ? {} : { y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-hairline-strong" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">{daySheet.date}</p>
                <button onClick={() => setDaySheet(null)} aria-label="Cerrar" className="rounded-full p-1.5 text-ink-muted">
                  <X size={18} weight="bold" />
                </button>
              </div>

              {daySheet.log ? (
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      daySheet.status === "ambar" ? "bg-amber-soft text-navy" : "bg-wash-green text-navy"
                    }`}
                  >
                    {daySheet.status === "ambar" ? "Día de brote leve" : "Día estable"}
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-[1.1rem] bg-cream p-3 ring-1 ring-inset ring-hairline">
                      <p className="text-xs text-ink-muted">Comezón</p>
                      <p className="mt-1 font-mono text-lg font-semibold text-navy">{daySheet.log.itchLevel}/10</p>
                    </div>
                    <div className="rounded-[1.1rem] bg-cream p-3 ring-1 ring-inset ring-hairline">
                      <p className="text-xs text-ink-muted">Sueño</p>
                      <p className="mt-1 text-lg font-semibold text-navy">{SLEEP[daySheet.log.sleepQuality] || "—"}</p>
                    </div>
                  </div>
                  {daySheet.log.triggers?.length > 0 && (
                    <p className="mt-3 text-sm text-ink-muted">
                      <span className="font-medium text-navy">Factores:</span> {daySheet.log.triggers.join(", ")}
                    </p>
                  )}
                  {daySheet.log.notes && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{daySheet.log.notes}</p>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm leading-relaxed text-ink-muted">
                    No hay registro para este día. Puedes anotarlo cuando quieras.
                  </p>
                  <Link
                    href="/estado"
                    onClick={() => setDaySheet(null)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
                  >
                    <NotePencil size={18} weight="bold" />
                    Registrar un día
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
