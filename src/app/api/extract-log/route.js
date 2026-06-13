import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genExtractLog, DISCLAIMER } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/extract-log" });
}

const TRIGGERS = ["Calor", "Sudor", "Polvo", "Detergente nuevo", "Comida nueva", "Estrés", "Mascota"];
const AREAS = ["Cuello", "Brazos", "Piernas", "Rostro", "Pliegues"];
const SLEEP = ["bueno", "regular", "malo"];

const UNSAFE =
  /\b(diagn[oó]stic\w*|severo|severa|severidad|infecci\w*|melanoma|c[aá]ncer|cancer\w*|maligno|tumor|psoriasis)\b/i;

function clean(json, body) {
  const itch = Math.max(0, Math.min(10, Math.round(Number(json.itchLevel))));
  const sleep = SLEEP.includes(json.sleepQuality) ? json.sleepQuality : "regular";
  const triggers = Array.isArray(json.triggers) ? json.triggers.filter((t) => TRIGGERS.includes(t)) : [];
  const areas = Array.isArray(json.areas) ? json.areas.filter((a) => AREAS.includes(a)) : [];
  const sintoma = typeof json.sintoma === "string" && !UNSAFE.test(json.sintoma) ? json.sintoma : "Molestia observada";
  const validacion =
    typeof json.mensajeValidacion === "string" && !UNSAFE.test(json.mensajeValidacion)
      ? json.mensajeValidacion
      : genExtractLog(body).mensajeValidacion;
  return {
    itchLevel: Number.isFinite(itch) ? itch : 5,
    sleepQuality: sleep,
    triggers,
    areas,
    notes: typeof json.notes === "string" && json.notes.trim() ? json.notes.trim() : String(body.text || "").trim(),
    disparador: typeof json.disparador === "string" ? json.disparador : triggers[0] || "Sin factor claro",
    sintoma,
    mensajeValidacion: validacion,
    disclaimer: DISCLAIMER,
  };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();

  if (llm && body.text) {
    try {
      const user = `Extrae un registro estructurado del relato del cuidador (es-PE), SOLO observacional, sin diagnóstico.
Relato: "${String(body.text).slice(0, 1200)}".
${body.plan ? `Plan del dermatólogo (para anclar el refuerzo, NO lo cambies): ${String(body.plan).slice(0, 700)}.` : ""}
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "itchLevel": entero 0-10 estimado del relato (usa 5 si no hay pista).
- "sleepQuality": "bueno" | "regular" | "malo".
- "triggers": array, solo de [Calor, Sudor, Polvo, Detergente nuevo, Comida nueva, Estrés, Mascota].
- "areas": array, solo de [Cuello, Brazos, Piernas, Rostro, Pliegues].
- "notes": resumen breve y fiel del relato.
- "disparador": frase corta del posible factor observado.
- "sintoma": frase corta y NO diagnóstica de lo observado.
- "mensajeValidacion": refuerzo empático breve; si hay plan, ánclalo ("según el plan de tu doctor…"); nunca cambies tratamiento ni dosis.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      return Response.json(clean(json, body));
    } catch {
      // cae al generador
    }
  }

  return Response.json(genExtractLog(body));
}
