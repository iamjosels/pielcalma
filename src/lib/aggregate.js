/**
 * Agregaciones puras sobre los flareLogs (registros reales).
 * Sin React, sin estado: entran logs, salen datos para gráficos/métricas.
 * El indicador Calma Familiar mide continuidad/preparación, NO la enfermedad.
 */

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function last7DatesAsc() {
  return Array.from({ length: 7 }, (_, i) => isoDaysAgo(6 - i));
}

function weekdayLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return WEEKDAYS[d.getDay()];
}

/** Último log por fecha (los logs llegan ordenados desc por fecha/createdAt). */
function latestByDate(logs) {
  const map = new Map();
  for (const log of logs) {
    if (!map.has(log.date)) map.set(log.date, log);
  }
  return map;
}

function logsWithinLast7(logs) {
  const min = isoDaysAgo(6);
  return logs.filter((l) => l.date >= min);
}

export function weeklyData(logs) {
  const byDate = latestByDate(logs);
  return last7DatesAsc().map((iso) => {
    const log = byDate.get(iso);
    return {
      day: weekdayLabel(iso),
      date: iso,
      itch: log ? log.itchLevel : null,
      sleep: log ? cap(log.sleepQuality) : "—",
      triggers: log && log.triggers.length ? log.triggers.join(", ") : "—",
      routine: log ? cap(log.routineStatus) : "—",
      hasData: Boolean(log),
    };
  });
}

export function sleepDistribution(logs) {
  const week = Array.from(latestByDate(logsWithinLast7(logs)).values());
  const counts = { Bueno: 0, Regular: 0, Malo: 0 };
  for (const log of week) {
    const key = cap(log.sleepQuality);
    if (key in counts) counts[key] += 1;
  }
  return [
    { label: "Bueno", value: counts.Bueno },
    { label: "Regular", value: counts.Regular },
    { label: "Malo", value: counts.Malo },
  ];
}

export function metrics(logs) {
  const week = Array.from(latestByDate(logsWithinLast7(logs)).values());
  const registeredDays = week.length;
  const highItchDays = week.filter((l) => l.itchLevel >= 7).length;
  const affectedSleepNights = week.filter((l) => l.sleepQuality === "malo").length;
  return { registeredDays, highItchDays, affectedSleepNights };
}

/**
 * Calma Familiar (0–100): continuidad de registro + preparación.
 * Determinista. NO mide severidad ni estado clínico.
 */
export function calmaFamiliar(logs, observations = [], calmaEvents = []) {
  const week = Array.from(latestByDate(logsWithinLast7(logs)).values());
  const coverage = Math.min(week.length, 7) / 7;
  const minDate = isoDaysAgo(6);
  const hasObs = observations.some((o) => o.date >= minDate);
  const hasCheckin = calmaEvents.some((e) => e.date >= minDate);
  const score = 35 + 45 * coverage + (hasObs ? 10 : 0) + (hasCheckin ? 10 : 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}

const CAVEAT = "No confirma una causa médica; es una coincidencia útil para conversar con el dermatólogo.";

/** Patrones observados — reglas no causales sobre los registros. */
export function observedPatterns(logs) {
  const week = Array.from(latestByDate(logsWithinLast7(logs)).values());
  if (week.length === 0) return [];

  const patterns = [];
  const highItch = week.filter((l) => l.itchLevel >= 7);

  if (highItch.some((l) => l.sleepQuality === "malo")) {
    patterns.push("La comezón más alta coincidió con noches de sueño reportado como malo.");
  }

  // Factor más frecuente en días de comezón alta
  const freq = {};
  for (const l of highItch) {
    for (const t of l.triggers) freq[t] = (freq[t] || 0) + 1;
  }
  const topTrigger = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  if (topTrigger && topTrigger[1] >= 2) {
    patterns.push(
      `Varios registros de mayor comezón coincidieron con "${topTrigger[0]}".`
    );
  }

  if (highItch.some((l) => l.routineStatus !== "completa")) {
    patterns.push("La rutina indicada fue parcial o no realizada en algunos días de mayor comezón.");
  }

  const worried = week.filter((l) => ["preocupada", "agotada"].includes(l.caregiverEmotion));
  if (worried.length >= 2) {
    patterns.push("En varios días la cuidadora reportó sentirse preocupada o agotada.");
  }

  if (patterns.length === 0) {
    patterns.push("La semana se mantuvo relativamente estable según lo registrado.");
  }
  patterns.push(CAVEAT);
  return patterns;
}

/** Resumen compacto en texto, base para el generador / la IA. */
export function buildReportContext(logs, observations, calmaEvents) {
  const m = metrics(logs);
  return {
    registeredDays: m.registeredDays,
    highItchDays: m.highItchDays,
    affectedSleepNights: m.affectedSleepNights,
    calmaFamiliar: calmaFamiliar(logs, observations, calmaEvents),
    patrones: observedPatterns(logs),
    weekly: weeklyData(logs),
    observaciones: observations.slice(0, 4).map((o) => o.observacionVisual).filter(Boolean),
  };
}
