import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genCalmSummary, DISCLAIMER } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/calm-summary" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();

  if (llm) {
    try {
      const user = `Genera el acompañamiento de "Modo Calma" para la cuidadora a partir de estos datos reales del día: ${JSON.stringify(
        body
      )}.
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "mensajeEmpatico": string breve y cálido según la emoción.
- "datosOrdenados": array de strings con lo registrado (comezón, sueño, factores).
- "posibleCoincidencia": string que describa una posible coincidencia sin afirmar causa médica.
- "preguntaDermatologo": string con una pregunta útil para la consulta.
- "disclaimer": string breve.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      return Response.json({
        mensajeEmpatico: json.mensajeEmpatico || "",
        datosOrdenados: Array.isArray(json.datosOrdenados) ? json.datosOrdenados : [],
        posibleCoincidencia: json.posibleCoincidencia || "",
        preguntaDermatologo: json.preguntaDermatologo || "",
        disclaimer: json.disclaimer || DISCLAIMER,
      });
    } catch {
      // cae al generador
    }
  }

  return Response.json(genCalmSummary(body));
}
