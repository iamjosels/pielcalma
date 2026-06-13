"use client";

/**
 * Plan del dermatólogo (local, scopeado por perfil).
 * Es la guía que el especialista dejó; la IA ancla su validación a este plan
 * (nunca lo modifica). localStorage, sin cloud, patrón useSyncExternalStore.
 */
import { useSyncExternalStore, useMemo } from "react";
import { useStore, getActiveProfile } from "@/lib/store";

const KEY = "pielcalma:plan:v1";
const EVENT = "pielcalma:plan:change";

export const EMPTY_PLAN = {
  doctorName: "",
  emoliente: "",
  bano: "",
  brote: "",
  medicacion: "",
  notas: "",
};

const DEMO_PLAN = {
  doctorName: "Dra. Salas (Dermatología)",
  emoliente: "Crema emoliente 2 veces al día (mañana y noche), sobre piel ligeramente húmeda.",
  bano: "Baño corto con agua tibia; secar con toques, sin frotar; aplicar emoliente en los 3 min siguientes.",
  brote: "Si hay brote, mantener la rutina de emoliente y usar la crema indicada por la doctora en las zonas afectadas, según lo conversado.",
  medicacion: "Crema indicada por la dermatóloga para las zonas con más reacción (según su indicación).",
  notas: "Evitar lana y telas ásperas; uñas cortas; ambiente fresco.",
};

function readState() {
  if (typeof window === "undefined") return { byProfile: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { byProfile: {} };
    const parsed = JSON.parse(raw);
    return { byProfile: parsed.byProfile || {} };
  } catch {
    return { byProfile: {} };
  }
}

function writeState(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function setMedicalPlan(plan) {
  const pid = getActiveProfile().id;
  const s = readState();
  writeState({ byProfile: { ...s.byProfile, [pid]: { ...EMPTY_PLAN, ...plan } } });
}

/** Siembra un plan demo para el perfil activo si aún no tiene uno. */
export function ensurePlanSeed() {
  if (typeof window === "undefined") return;
  const pid = getActiveProfile().id;
  const s = readState();
  if (s.byProfile[pid]) return;
  writeState({ byProfile: { ...s.byProfile, [pid]: DEMO_PLAN } });
}

/** ¿El plan tiene algún contenido? */
export function planHasContent(plan) {
  if (!plan) return false;
  return ["emoliente", "bano", "brote", "medicacion", "notas"].some((k) => (plan[k] || "").trim());
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

export function useMedicalPlan() {
  const { profile } = useStore();
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    let byProfile = {};
    try {
      byProfile = raw ? JSON.parse(raw).byProfile || {} : {};
    } catch {}
    return { ...EMPTY_PLAN, ...(byProfile[profile.id] || {}) };
  }, [raw, profile.id]);
}
