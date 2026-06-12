"use client";

import { useSyncExternalStore, useMemo } from "react";

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

/* ---------------- mutations ---------------- */
export function addLog(log) {
  return mutate((s) => {
    const pid = getActiveProfile(s).id;
    s.logs.push({
      id: uid("log"),
      profileId: pid,
      date: log.date || todayISO(),
      itchLevel: Number(log.itchLevel) || 0,
      sleepQuality: log.sleepQuality || "regular",
      routineStatus: log.routineStatus || "parcial",
      caregiverEmotion: log.caregiverEmotion || "tranquila",
      areas: log.areas || [],
      triggers: log.triggers || [],
      notes: log.notes || "",
      createdAt: Date.now(),
    });
    return s;
  });
}

export function addObservation(obs) {
  return mutate((s) => {
    const pid = getActiveProfile(s).id;
    s.observations.push({
      id: uid("obs"),
      profileId: pid,
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
    });
    // Conserva miniatura solo en las últimas 6 observaciones del perfil (cuota).
    s.observations
      .filter((o) => o.profileId === pid)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(6)
      .forEach((o) => {
        o.thumb = null;
      });
    return s;
  });
}

export function addCalmaEvent(emotion) {
  return mutate((s) => {
    const pid = getActiveProfile(s).id;
    s.calmaEvents.push({
      id: uid("calm"),
      profileId: pid,
      emotion,
      date: todayISO(),
      createdAt: Date.now(),
    });
    return s;
  });
}

export function setActiveProfile(id) {
  return mutate((s) => {
    if (s.profiles.some((p) => p.id === id)) s.activeProfileId = id;
    return s;
  });
}

export function addProfile({ childName, childAge, caregiverName, conditionLabel }) {
  const id = uid("p");
  mutate((s) => {
    s.profiles.push({
      id,
      caregiverName: caregiverName || "Cuidador/a",
      childName: childName || "Niño/a",
      childAge: Number(childAge) || null,
      conditionLabel: conditionLabel || "Dermatitis atópica",
      createdAt: Date.now(),
    });
    s.activeProfileId = id;
    return s;
  });
  return id;
}

export function resetProfileData() {
  return mutate((s) => {
    const pid = getActiveProfile(s).id;
    s.logs = s.logs.filter((l) => l.profileId !== pid);
    s.observations = s.observations.filter((o) => o.profileId !== pid);
    s.calmaEvents = s.calmaEvents.filter((e) => e.profileId !== pid);
    return s;
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
  return mutate((s) => {
    const pid = getActiveProfile(s).id;
    s.logs = s.logs.filter((l) => l.profileId !== pid);
    s.observations = s.observations.filter((o) => o.profileId !== pid);
    s.calmaEvents = s.calmaEvents.filter((e) => e.profileId !== pid);
    const demo = buildDemoSeed(pid);
    s.logs.push(...demo.logs);
    s.observations.push(...demo.observations);
    s.calmaEvents.push(...demo.calmaEvents);
    s.demoSeeded = true;
    return s;
  });
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
