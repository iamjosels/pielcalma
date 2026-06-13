/**
 * Predictor de riesgo de brote — heurística LOCAL y determinista.
 * NO es clínico ni diagnóstico: combina coincidencias de los propios registros
 * (tendencia de comezón, sueño, estrés, disparadores recientes y racha estable)
 * en una señal "bajo/medio/alto" para los próximos días, en el tono de
 * `anticipations()`. La IA solo lo REDACTA de forma segura (kind "forecast").
 */
import { weeklyData, metrics } from "@/lib/aggregate";

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Último log por fecha (logs llegan ordenados desc). */
function latestByDate(logs) {
  const map = new Map();
  for (const log of logs) if (!map.has(log.date)) map.set(log.date, log);
  return map;
}

function slope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den ? num / den : 0;
}

/**
 * flareRisk(logs) → { level, score, factors, horizonDays, registeredDays }
 *   level: "bajo" | "medio" | "alto"
 *   score: 0-100
 *   factors: [{ label, weight }] ordenados desc (peso = aporte al score)
 */
export function flareRisk(logs = []) {
  const factors = [];
  let score = 16; // base baja

  const byDate = latestByDate(logs);
  const all = Array.from(byDate.values());
  const week = weeklyData(logs);
  const itchPoints = week.filter((d) => d.itch != null).map((d) => d.itch);
  const m = metrics(logs);

  if (all.length < 3) {
    return {
      level: "bajo",
      score: 0,
      factors: [],
      horizonDays: 3,
      registeredDays: m.registeredDays,
      insufficient: true,
    };
  }

  // 1) Tendencia de comezón (pendiente al alza en la semana)
  if (itchPoints.length >= 3) {
    const s = slope(itchPoints);
    if (s > 0.3) {
      const w = Math.min(26, Math.round(s * 16));
      score += w;
      factors.push({ label: "Comezón en aumento", weight: w });
    } else if (s < -0.3) {
      const w = Math.min(18, Math.round(-s * 12));
      score -= w;
      factors.push({ label: "Comezón a la baja", weight: -w });
    }
  }

  // 2) Días de comezón alta recientes (umbral itch>=7)
  if (m.highItchDays > 0) {
    const w = Math.min(24, m.highItchDays * 8);
    score += w;
    factors.push({
      label: `${m.highItchDays} día${m.highItchDays > 1 ? "s" : ""} de comezón alta`,
      weight: w,
    });
  }

  // 3) Noches de sueño reportado como malo
  if (m.affectedSleepNights > 0) {
    const w = Math.min(18, m.affectedSleepNights * 6);
    score += w;
    factors.push({ label: "Noches de sueño irregular", weight: w });
  }

  // 4) Estrés alto en la semana
  const minWeek = isoDaysAgo(6);
  const weekLogs = all.filter((l) => l.date >= minWeek);
  const stressDays = weekLogs.filter((l) => l.stress === "alto").length;
  if (stressDays >= 1) {
    const w = Math.min(14, stressDays * 5);
    score += w;
    factors.push({ label: "Días de más estrés", weight: w });
  }

  // 5) Disparador frecuente en días de comezón alta, presente hace poco
  const high = all.filter((l) => l.itchLevel >= 7);
  const freq = {};
  for (const l of high) for (const t of l.triggers || []) freq[t] = (freq[t] || 0) + 1;
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2) {
    const recent = all.filter((l) => l.date >= isoDaysAgo(2));
    const present = recent.some((l) => (l.triggers || []).includes(top[0]));
    const w = present ? 12 : 6;
    score += w;
    factors.push({ label: `Factor frecuente: ${top[0]}`, weight: w });
  }

  // 6) Racha estable (protector): días seguidos sin día ámbar
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const log = byDate.get(isoDaysAgo(i));
    if (!log) continue;
    const ambar = Number(log.itchLevel) >= 7 || log.sleepQuality === "malo";
    if (ambar) break;
    streak += 1;
    if (streak >= 6) break;
  }
  if (streak >= 3) {
    const w = Math.min(20, streak * 4);
    score -= w;
    factors.push({ label: `${streak} días estables seguidos`, weight: -w });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level = score > 66 ? "alto" : score >= 34 ? "medio" : "bajo";

  // Ordenar por aporte absoluto desc, mostrar primero los que suben
  factors.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return { level, score, factors, horizonDays: 3, registeredDays: m.registeredDays };
}
