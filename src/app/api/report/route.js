import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genReport, DISCLAIMER } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/report" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();

  if (llm) {
    try {
      const user = `Redacta el reporte semanal a partir de estos datos AGREGADOS reales (no inventes cifras): ${JSON.stringify(
        body
      )}.
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "resumenSemanal": string que resuma la semana usando las cifras dadas, sin diagnóstico.
- "patronesObservados": array de strings con coincidencias no causales.
- "preguntasDermatologo": array de strings con preguntas útiles para la consulta.
- "observacionesVisuales": array de strings descriptivas (usa las dadas si existen).
- "calmaFamiliar": número (usa el valor dado).
- "disclaimer": string breve.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      return Response.json({
        resumenSemanal: json.resumenSemanal || "",
        patronesObservados: Array.isArray(json.patronesObservados)
          ? json.patronesObservados
          : [],
        preguntasDermatologo: Array.isArray(json.preguntasDermatologo)
          ? json.preguntasDermatologo
          : [],
        observacionesVisuales: Array.isArray(json.observacionesVisuales)
          ? json.observacionesVisuales
          : [],
        calmaFamiliar:
          typeof json.calmaFamiliar === "number"
            ? json.calmaFamiliar
            : body.calmaFamiliar || 0,
        disclaimer: json.disclaimer || DISCLAIMER,
      });
    } catch {
      // cae al generador
    }
  }

  return Response.json(genReport(body));
}
