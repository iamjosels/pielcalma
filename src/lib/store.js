"use client";

import { useSyncExternalStore, useMemo } from "react";
import * as cloud from "@/lib/cloud";

const KEY = "pielcalma:v1";
const EVENT = "pielcalma:change";

const DEFAULT_PROFILE = {
  id: "p_default",
  caregiverName: "Ana",
  childName: "Lucas",
  childAge: 4,
  conditionLabel: "Dermatitis atópica",
  createdAt: 0,
};

function emptyState() {
  return {
    version: 1,
    activeProfileId: DEFAULT_PROFILE.id,
    profiles: [DEFAULT_PROFILE],
    logs: [],
    observations: [],
    calmaEvents: [],
    demoSeeded: false,
  };
}

/* ---------------- low level ---------------- */
function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function readState() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.profiles)) return emptyState();
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

function writeState(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Cuota excedida: descarta miniaturas y reintenta para no romper la app.
    try {
      const pruned = {
        ...next,
        observations: next.observations.map((o) => ({ ...o, thumb: null })),
      };
      window.localStorage.setItem(KEY, JSON.stringify(pruned));
    } catch {
      // si aún falla, seguimos sin persistir (mejor que crashear).
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

function mutate(fn) {
  const state = readState();
  const next = fn(structuredCloneSafe(state)) || state;
  writeState(next);
  return next;
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ---------------- selectors ---------------- */
export function getActiveProfile(state = readState()) {
  return (
    state.profiles.find((p) => p.id === state.activeProfileId) ||
    state.profiles[0] ||
    DEFAULT_PROFILE
  );
}

export function getLogs(state = readState()) {
  const pid = getActiveProfile(state).id;
  return state.logs
    .filter((l) => l.profileId === pid)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
}

export function getObservations(state = readState()) {
  const pid = getActiveProfile(state).id;
  return state.observations
    .filter((o) => o.profileId === pid)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getCalmaEvents(state = readState()) {
  const pid = getActiveProfile(state).id;
  return state.calmaEvents.filter((e) => e.profileId === pid);
}

/* ---------------- mutations (localStorage + espejo a Supabase) ---------------- */
export function addLog(log) {
  const entry = {
    id: uid("log"),
    profileId: getActiveProfile().id,
    date: log.date || todayISO(),
    itchLevel: Number(log.itchLevel) || 0,
    sleepQuality: log.sleepQuality || "regular",
    routineStatus: log.routineStatus || "parcial",
    caregiverEmotion: log.caregiverEmotion || "tranquila",
    nutrition: log.nutrition || "equilibrada",
    physicalActivity: log.physicalActivity || "tranquila",
    stress: log.stress || "calmado",
    areas: log.areas || [],
    triggers: log.triggers || [],
    notes: log.notes || "",
    createdAt: Date.now(),
  };
  mutate((s) => {
    s.logs.push(entry);
    return s;
  });
  cloud.save("logs", entry);
  return entry;
}

export function addObservation(obs) {
  const entry = {
    id: uid("obs"),
    profileId: getActiveProfile().id,
    date: obs.date || todayISO(),
    imageName: obs.imageName || "imagen.jpg",
    redness: obs.redness ?? null,
    brightness: obs.brightness ?? null,
    thumb: obs.thumb ?? null,
    observacionVisual: obs.observacionVisual || "",
    comparacionAnterior: obs.comparacionAnterior || "",
    indiceVisualCambio: obs.indiceVisualCambio || "",
    limitaciones: obs.limitaciones || "",
    createdAt: Date.now(),
  };
  mutate((s) => {
    s.observations.push(entry);
    capThumbs(s, entry.profileId);
    return s;
  });
  cloud.save("observations", entry); // la nube conserva la miniatura completa
  return entry;
}

export function addCalmaEvent(emotion) {
  const entry = {
    id: uid("calm"),
    profileId: getActiveProfile().id,
    emotion,
    date: todayISO(),
    createdAt: Date.now(),
  };
  mutate((s) => {
    s.calmaEvents.push(entry);
    return s;
  });
  cloud.save("calmaEvents", entry);
  return entry;
}

export function setActiveProfile(id) {
  // Preferencia de dispositivo: solo local.
  return mutate((s) => {
    if (s.profiles.some((p) => p.id === id)) s.activeProfileId = id;
    return s;
  });
}

export function addProfile({ childName, childAge, caregiverName, conditionLabel }) {
  const profile = {
    id: uid("p"),
    caregiverName: caregiverName || "Cuidador/a",
    childName: childName || "Niño/a",
    childAge: Number(childAge) || null,
    conditionLabel: conditionLabel || "Dermatitis atópica",
    createdAt: Date.now(),
  };
  mutate((s) => {
    s.profiles.push(profile);
    s.activeProfileId = profile.id;
    return s;
  });
  cloud.save("profiles", profile);
  return profile.id;
}

export function resetProfileData() {
  const pid = getActiveProfile().id;
  mutate((s) => {
    s.logs = s.logs.filter((l) => l.profileId !== pid);
    s.observations = s.observations.filter((o) => o.profileId !== pid);
    s.calmaEvents = s.calmaEvents.filter((e) => e.profileId !== pid);
    return s;
  });
  cloud.removeProfileData(pid);
}

// Conserva miniatura solo en las últimas 6 observaciones del perfil (cuota local).
function capThumbs(s, pid) {
  s.observations
    .filter((o) => o.profileId === pid)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(6)
    .forEach((o) => {
      o.thumb = null;
    });
}

/**
 * Dataset de demo "rico" (14 días) con arco narrativo: arranca con brotes
 * (calor/sudor, sueño malo) y mejora hacia el final. Pensado para que el pitch
 * muestre todo el potencial: gráfico con tendencia, varios patrones, historial
 * visual con índices reales y Calma Familiar alta.
 * Cada fila: [offsetDías, comezón, sueño, rutina, emoción, zonas, factores, nota]
 */
const DEMO_DAYS = [
  [-13, 6, "regular", "completa", "con dudas", ["Cuello"], ["calor"], ""],
  [-12, 8, "malo", "parcial", "preocupada", ["Cuello", "Brazos"], ["calor", "sudor"], "Noche difícil, se rascó bastante."],
  [-11, 7, "malo", "parcial", "agotada", ["Brazos"], ["sudor"], ""],
  [-10, 5, "regular", "completa", "con dudas", ["Pliegues"], ["polvo"], ""],
  [-9, 4, "bueno", "completa", "tranquila", ["Cuello"], [], ""],
  [-8, 6, "regular", "completa", "con dudas", ["Brazos"], ["mascota"], ""],
  [-7, 5, "regular", "parcial", "con dudas", ["Pliegues"], ["calor"], ""],
  [-6, 8, "malo", "parcial", "agotada", ["Cuello", "Brazos"], ["calor", "sudor"], "Calor fuerte todo el día."],
  [-5, 6, "regular", "completa", "preocupada", ["Brazos"], ["sudor"], ""],
  [-4, 4, "bueno", "completa", "tranquila", ["Cuello"], [], ""],
  [-3, 7, "malo", "parcial", "preocupada", ["Pliegues", "Cuello"], ["detergente nuevo", "calor"], "Estrenamos detergente."],
  [-2, 5, "regular", "completa", "con dudas", ["Brazos"], ["polvo"], ""],
  [-1, 3, "bueno", "completa", "tranquila", ["Cuello"], [], "Mejor noche en días."],
  [0, 4, "regular", "completa", "tranquila", ["Cuello"], ["calor"], ""],
];

const DEMO_OBS = [
  [-10, 0.46, 0.55, "Se observa enrojecimiento visible y resequedad aparente en la zona registrada.", "Primera referencia visual de la bitácora.", "Primera referencia"],
  [-5, 0.43, 0.57, "Se observa enrojecimiento visible algo menos extenso que en el registro previo.", "Respecto al registro anterior, la coloración aparente se ve algo más tenue.", "−7%"],
  [-1, 0.4, 0.59, "Se observa una coloración aparente más uniforme en la zona registrada.", "Respecto al registro anterior, la coloración aparente se ve algo más tenue.", "−5%"],
];

const DEMO_CALMA = [
  [-6, "agotada"],
  [-3, "preocupada"],
  [-1, "tranquila"],
  [0, "tranquila"],
];

const VISUAL_LIMITS =
  "La observación puede verse afectada por iluminación, distancia y ángulo.";

function buildDemoSeed(pid) {
  const logs = DEMO_DAYS.map(
    ([off, itch, sleep, routine, emotion, areas, triggers, notes], i) => ({
      id: uid("log"),
      profileId: pid,
      date: todayISO(off),
      itchLevel: itch,
      sleepQuality: sleep,
      routineStatus: routine,
      caregiverEmotion: emotion,
      nutrition: i % 5 === 0 ? "algo nuevo" : i % 3 === 0 ? "irregular" : "equilibrada",
      physicalActivity:
        triggers.includes("sudor") && triggers.includes("calor")
          ? "mucho sudor"
          : triggers.includes("calor") || triggers.includes("sudor")
            ? "activa"
            : "tranquila",
      stress: ["preocupada", "agotada"].includes(emotion)
        ? "alto"
        : emotion === "con dudas"
          ? "algo"
          : "calmado",
      areas,
      triggers,
      notes,
      createdAt: Date.now() + i,
    })
  );
  const observations = DEMO_OBS.map(
    ([off, redness, brightness, obs, comp, idx], i) => ({
      id: uid("obs"),
      profileId: pid,
      date: todayISO(off),
      imageName: `registro-dia-${14 + off}.jpg`,
      redness,
      brightness,
      observacionVisual: obs,
      comparacionAnterior: comp,
      indiceVisualCambio: idx,
      limitaciones: VISUAL_LIMITS,
      createdAt: Date.now() + 100 + i,
    })
  );
  const calmaEvents = DEMO_CALMA.map(([off, emotion], i) => ({
    id: uid("calm"),
    profileId: pid,
    emotion,
    date: todayISO(off),
    createdAt: Date.now() + 200 + i,
  }));
  return { logs, observations, calmaEvents };
}

/** Siembra (o re-siembra) el perfil activo con el dataset rico. */
export function seedDemo() {
  const pid = getActiveProfile().id;
  const demo = buildDemoSeed(pid);
  mutate((s) => {
    s.logs = s.logs.filter((l) => l.profileId !== pid);
    s.observations = s.observations.filter((o) => o.profileId !== pid);
    s.calmaEvents = s.calmaEvents.filter((e) => e.profileId !== pid);
    s.logs.push(...demo.logs);
    s.observations.push(...demo.observations);
    s.calmaEvents.push(...demo.calmaEvents);
    s.demoSeeded = true;
    return s;
  });
  cloud.removeProfileData(pid); // reemplaza en la nube
  cloud.save("profiles", getActiveProfile());
  cloud.saveMany("logs", demo.logs);
  cloud.saveMany("observations", demo.observations);
  cloud.saveMany("calmaEvents", demo.calmaEvents);
}

/**
 * Primera visita: si no hay datos y no se sembró antes, precarga el perfil
 * demo automáticamente (la app abre ya llena para el pitch). Se ejecuta una
 * sola vez: tras un "Reiniciar datos" no vuelve a sembrar.
 */
export function ensureDemoSeed() {
  if (typeof window === "undefined") return;
  const s = readState();
  if (s.demoSeeded || s.logs.length > 0) {
    if (!s.demoSeeded) writeState({ ...s, demoSeeded: true });
    return;
  }
  const pid = getActiveProfile(s).id;
  const demo = buildDemoSeed(pid);
  writeState({
    ...s,
    logs: demo.logs,
    observations: demo.observations,
    calmaEvents: demo.calmaEvents,
    demoSeeded: true,
  });
  cloud.save("profiles", getActiveProfile(s));
  cloud.saveMany("logs", demo.logs);
  cloud.saveMany("observations", demo.observations);
  cloud.saveMany("calmaEvents", demo.calmaEvents);
}

/**
 * Trae los datos del usuario desde Supabase y los fusiona en local (la nube
 * gana por id). No-op si Supabase no está configurado o falla.
 */
export async function syncFromCloud() {
  if (typeof window === "undefined") return;
  const data = await cloud.fetchAll();
  if (!data) return;
  const s = readState();
  s.profiles = mergeById(s.profiles, data.profiles);
  s.logs = mergeById(s.logs, data.logs);
  s.observations = mergeById(s.observations, data.observations);
  s.calmaEvents = mergeById(s.calmaEvents, data.calmaEvents);
  if (!s.profiles.some((p) => p.id === s.activeProfileId)) {
    s.activeProfileId = s.profiles[0]?.id || DEFAULT_PROFILE.id;
  }
  [...new Set(s.observations.map((o) => o.profileId))].forEach((pid) =>
    capThumbs(s, pid)
  );
  writeState(s);
}

function mergeById(local, remote) {
  const map = new Map();
  for (const item of local) map.set(item.id, item);
  for (const item of remote) map.set(item.id, item); // la nube gana
  return [...map.values()];
}

/* ---------------- React hook ---------------- */
function subscribe(cb) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getClientSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) || "";
}

function getServerSnapshot() {
  return "";
}

export function useStore() {
  const raw = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  return useMemo(() => {
    const state = raw ? safeParse(raw) : emptyState();
    return {
      state,
      profile: getActiveProfile(state),
      logs: getLogs(state),
      observations: getObservations(state),
      calmaEvents: getCalmaEvents(state),
    };
  }, [raw]);
}

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.profiles)) return emptyState();
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}
