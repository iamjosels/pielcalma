/**
 * Punto único para pedir texto de IA desde las páginas.
 * - Web (Vercel): hace fetch a las API routes server-side (clave protegida).
 * - APK (Capacitor, NEXT_PUBLIC_APK_BUILD="1"): corre la IA en el cliente con
 *   clave embebida (aiClient), porque el APK no tiene servidor.
 * En ambos casos devuelve el mismo contrato JSON.
 */
import {
  calmSummaryClient,
  visualObservationClient,
  reportClient,
  assistantClient,
  extractLogClient,
  forecastClient,
  intakeClient,
  learnClient,
} from "@/lib/aiClient";

const IS_APK = process.env.NEXT_PUBLIC_APK_BUILD === "1";

const CLIENT = {
  "calm-summary": calmSummaryClient,
  "visual-observation": visualObservationClient,
  report: reportClient,
  assistant: assistantClient,
  "extract-log": extractLogClient,
  forecast: forecastClient,
  intake: intakeClient,
  learn: learnClient,
};

export async function requestAI(kind, body) {
  if (IS_APK) {
    return CLIENT[kind](body);
  }
  const res = await fetch(`/api/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("bad status");
  return res.json();
}
