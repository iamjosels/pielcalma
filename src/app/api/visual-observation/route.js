import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genVisualObservation } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/visual-observation" });
}

// Red de seguridad server-side: si el modelo se sale de la raya, se descarta.
const UNSAFE =
  /\b(diagn[oó]stic\w*|severo|severa|severidad|leve\w*|moderad\w*|infecci\w*|dermatitis|eccema|eczema|psoriasis|alergi\w*|melanoma|c[aá]ncer|cancer\w*|hongo\w*|bacteri\w*|grave\w*|urgen\w*|maligno|tumor)\b/i;

function isUnsafe(text) {
  return typeof text === "string" && UNSAFE.test(text);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  // El índice y la comparación numérica los calcula el código (no la IA).
  const base = genVisualObservation(body);
  const llm = getLLM();
  const { imageData, hasPrevious, deltaPct } = body;

  // --- Visión real: el modelo mira la imagen ---
  if (imageData && llm?.completeVision) {
    try {
      const dir =
        hasPrevious && deltaPct != null
          ? deltaPct > 4
            ? "Hay un registro anterior; la coloración aparente parece algo más marcada que antes."
            : deltaPct < -4
              ? "Hay un registro anterior; la coloración aparente parece algo más tenue que antes."
              : "Hay un registro anterior; la coloración aparente parece similar a antes."
          : "Es la primera referencia visual; no hay foto anterior con la cual comparar.";

      const user = `Observa la imagen de piel y describe ÚNICAMENTE lo visible, de forma prudente y NO diagnóstica.
Incluye, si aplica: color aparente, textura o resequedad aparente, y en qué zona se concentra.
${dir}
PROHIBIDO: diagnosticar, nombrar enfermedades, clasificar severidad (no uses "leve", "moderado", "severo"), afirmar causas o decir si es grave/urgente.
Usa frases como "se observa". Devuelve un objeto JSON con:
- "observacionVisual": 1-3 frases descriptivas y seguras.
- "comparacionAnterior": 1 frase sobre el cambio aparente respecto al registro anterior (o que es la primera referencia).`;

      const json = extractJson(await llm.completeVision(safeSystemPrompt, user, imageData));
      const obs = json.observacionVisual;
      const comp = json.comparacionAnterior;

      if (obs && !isUnsafe(obs) && !isUnsafe(comp)) {
        return Response.json({
          ...base,
          observacionVisual: obs,
          comparacionAnterior: comp || base.comparacionAnterior,
        });
      }
      // si trae algo inseguro o vacío -> cae a base
    } catch {
      // error de visión -> cae a base
    }
  }

  // --- Sin imagen pero con LLM: describe desde la señal (texto) ---
  if (!imageData && llm) {
    try {
      const user = `Describe de forma NO diagnóstica una observación visual de piel a partir de esta señal medida: ${JSON.stringify(
        body
      )}.
Devuelve un objeto JSON con la clave "observacionVisual": string descriptiva (sin diagnóstico, sin severidad). No incluyas números de cambio.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      if (json.observacionVisual && !isUnsafe(json.observacionVisual)) {
        return Response.json({ ...base, observacionVisual: json.observacionVisual });
      }
    } catch {
      // cae a base
    }
  }

  return Response.json(base);
}
