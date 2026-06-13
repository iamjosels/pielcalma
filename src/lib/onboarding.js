/**
 * Estado del onboarding de primer arranque (preferencia de dispositivo, solo local).
 * SSR-safe: en el servidor devuelve siempre "ya visto" para no parpadear.
 */
const KEY = "pielcalma:onboarded:v1";
const EVENT = "pielcalma:onboarding";

export function isOnboarded() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function setOnboarded() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export const ONBOARDING_EVENT = EVENT;
