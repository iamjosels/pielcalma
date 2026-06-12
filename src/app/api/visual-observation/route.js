import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genVisualObservation } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/visual-observation" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  // El índice y la comparación se calculan desde la señal real (no por IA).
  const base = genVisualObservation(body);
  const llm = getLLM();

  if (llm) {
    try {
      const user = `Describe de forma NO diagnóstica una observación visual de piel a partir de esta señal medida: ${JSON.stringify(
        body
      )}.
Devuelve un objeto JSON con la clave "observacionVisual": string descriptiva (sin diagnóstico, sin severidad). No incluyas números de cambio.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      if (json.observacionVisual) {
        return Response.json({ ...base, observacionVisual: json.observacionVisual });
      }
    } catch {
      // cae a la base
    }
  }

  return Response.json(base);
}
