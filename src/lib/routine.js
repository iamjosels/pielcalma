"use client";

/**
 * Rutina diaria + recordatorio (local, sin push del sistema).
 * Nivel Basic de la propuesta. localStorage, patrón useSyncExternalStore.
 */
import { useSyncExternalStore, useMemo } from "react";

const KEY = "pielcalma:rutina:v1";
const EVENT = "pielcalma:rutina:change";

export const DEFAULT_ITEMS = [
  { id: "emoliente_am", label: "Emoliente (mañana)", period: "Mañana" },
  { id: "bano", label: "Baño tibio y secado suave", period: "Día" },
  { id: "emoliente_pm", label: "Emoliente (noche)", period: "Noche" },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyState() {
  return { version: 1, items: DEFAULT_ITEMS, doneByDate: {}, reminderTime: "20:00" };
}

function readState() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

function writeState(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function toggleRoutineItem(id) {
  const s = readState();
  const tk = todayKey();
  const done = new Set(s.doneByDate[tk] || []);
  if (done.has(id)) done.delete(id);
  else done.add(id);
  writeState({ ...s, doneByDate: { ...s.doneByDate, [tk]: [...done] } });
}

export function setReminderTime(time) {
  const s = readState();
  writeState({ ...s, reminderTime: time });
}

function subscribe(cb) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function getSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) || "";
}
function getServerSnapshot() {
  return "";
}

function dateKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useRoutine() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    const s = raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
    const items = s.items || DEFAULT_ITEMS;
    const total = items.length || 1;
    const tk = todayKey();
    const doneToday = s.doneByDate[tk] || [];

    // Adherencia: promedio de los días registrados en la última semana.
    let sum = 0;
    let counted = 0;
    for (let i = 0; i < 7; i++) {
      const k = dateKey(-i);
      const done = s.doneByDate[k];
      if (done && done.length) {
        sum += Math.min(done.length, total) / total;
        counted += 1;
      }
    }
    // Si no hay historial aún, refleja el día de hoy.
    const adherence = counted
      ? Math.round((sum / counted) * 100)
      : Math.round((doneToday.length / total) * 100);

    return {
      items,
      doneToday,
      reminderTime: s.reminderTime || "20:00",
      doneCount: doneToday.length,
      total,
      adherence,
    };
  }, [raw]);
}
