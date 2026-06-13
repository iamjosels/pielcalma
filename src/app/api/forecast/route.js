import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genForecast, DISCLAIMER } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/forecast" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();
  const base = genForecast(body);

  if (llm && body.risk && !body.risk.insufficient) {
    try {
      const user = `A partir de esta señal LOCAL de coincidencias de los propios registros (NO es clínica), redacta una anticipación cálida y segura para los próximos días.
Señal: ${JSON.stringify(body.risk)}.
Contexto agregado (no inventes cifras): ${JSON.stringify(body.context || {})}.
Reglas: NO predigas un brote, NO uses severidad (leve/moderado/severo), NO diagnostiques, NO cambies tratamiento. Habla de "tus registros" y "podría ser útil observar".
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "frase": una sola frase empática y prudente sobre los próximos días.
- "observaciones": array de 2-3 strings de "qué observar" derivadas de los factores.
- "disclaimer": string breve.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      return Response.json({
        frase: json.frase || base.frase,
        observaciones: Array.isArray(json.observaciones) ? json.observaciones : base.observaciones,
        disclaimer: json.disclaimer || DISCLAIMER,
      });
    } catch {
      // cae al generador
    }
  }

  return Response.json(base);
}
