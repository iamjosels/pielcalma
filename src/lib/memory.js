"use client";

/**
 * Memoria del cuidador (local, por perfil) — la IA "se nutre" en cada
 * interacción (chat, voz, registro) acumulando datos durables y NO clínicos.
 * Se inyecta en los prompts (buildAIContext) para personalizar el acompañamiento.
 * localStorage, sin cloud, patrón useSyncExternalStore (como plan.js).
 */
import { useSyncExternalStore, useMemo } from "react";
import { useStore, getActiveProfile } from "@/lib/store";

const KEY = "pielcalma:memory:v1";
const EVENT = "pielcalma:memory:change";
const MAX_FACTS = 12;

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

function now() {
  return typeof Date !== "undefined" ? Date.now() : 0;
}

function mergeFacts(existing, incoming) {
  const out = [];
  const seen = new Set();
  // nuevos primero, luego los previos; dedupe case-insensitive; tope MAX_FACTS
  for (const f of [...incoming, ...existing]) {
    const k = String(f || "").trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(String(f).trim());
    if (out.length >= MAX_FACTS) break;
  }
  return out;
}

/** Siembra la memoria del perfil (al crear el usuario en el onboarding). */
export function seedMemory(pid, { facts = [], summary = "" } = {}) {
  if (!pid) return;
  const s = readState();
  const entry = s.byProfile[pid] || { facts: [], summary: "", updatedAt: 0 };
  writeState({
    byProfile: {
      ...s.byProfile,
      [pid]: {
        facts: mergeFacts(entry.facts, facts),
        summary: summary || entry.summary,
        updatedAt: now(),
      },
    },
  });
}

/** Añade datos al perfil ACTIVO (fire-and-forget tras interacciones). */
export function addMemoryFacts(facts = []) {
  if (!Array.isArray(facts) || facts.length === 0) return;
  const pid = getActiveProfile().id;
  const s = readState();
  const entry = s.byProfile[pid] || { facts: [], summary: "", updatedAt: 0 };
  writeState({
    byProfile: {
      ...s.byProfile,
      [pid]: {
        facts: mergeFacts(entry.facts, facts),
        summary: entry.summary,
        updatedAt: now(),
      },
    },
  });
}

/** Memoria del perfil activo como texto compacto (para los prompts). */
export function memoryToText() {
  if (typeof window === "undefined") return "";
  const pid = getActiveProfile().id;
  const entry = readState().byProfile[pid];
  if (!entry || !entry.facts || entry.facts.length === 0) return "";
  return `Memoria del cuidador:\n${entry.facts.map((f) => `- ${f}`).join("\n")}`;
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

export function useMemory() {
  const { profile } = useStore();
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    let byProfile = {};
    try {
      byProfile = raw ? JSON.parse(raw).byProfile || {} : {};
    } catch {}
    return byProfile[profile.id] || { facts: [], summary: "", updatedAt: 0 };
  }, [raw, profile.id]);
}
