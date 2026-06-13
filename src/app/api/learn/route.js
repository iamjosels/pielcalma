import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genLearn } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/learn" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();

  if (llm && body.text) {
    try {
      const user = `Extrae 0-3 datos DURABLES y NO clínicos para recordar de esta familia, a partir de su mensaje. Nada de diagnóstico, severidad ni tratamiento.
Lo que ya sé: ${String(body.memory || "—").slice(0, 800)}.
Mensaje nuevo: "${String(body.text).slice(0, 800)}".
Devuelve SOLO datos NUEVOS y útiles (preferencias, rutina, contexto, factores que la familia observa). Si no hay nada nuevo, devuelve lista vacía.
Devuelve un objeto JSON: { "facts": ["...", ...] }.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      const facts = Array.isArray(json.facts)
        ? json.facts.filter((f) => typeof f === "string" && f.trim()).map((f) => f.trim().slice(0, 140)).slice(0, 3)
        : [];
      return Response.json({ facts });
    } catch {
      // cae al generador
    }
  }

  return Response.json(genLearn(body));
}
