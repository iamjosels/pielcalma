"use client";

/**
 * Nivel de suscripción (local). Para la DEMO el default es "plus" (todo
 * desbloqueado para el jurado); las features Plus muestran badge pero no se
 * bloquean. Patrón useSyncExternalStore.
 */
import { useSyncExternalStore } from "react";

const KEY = "pielcalma:tier";
const EVENT = "pielcalma:tier:change";

export function getTier() {
  if (typeof window === "undefined") return "plus";
  try {
    return window.localStorage.getItem(KEY) || "plus"; // demo: plus por defecto
  } catch {
    return "plus";
  }
}

export function setTier(t) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, t);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
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

export function useTier() {
  return useSyncExternalStore(subscribe, getTier, () => "plus");
}
