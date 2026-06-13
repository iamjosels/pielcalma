import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genAssistant, ASSISTANT_ROUTES, DISCLAIMER } from "@/lib/generators";
import { buildAssistantUserPrompt } from "@/lib/assistantPrompt";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/assistant" });
}

const UNSAFE =
  /\b(diagn[oó]stic\w*|severo|severa|severidad|leve\w*|moderad\w*|infecci\w*|melanoma|c[aá]ncer|cancer\w*|maligno|tumor)\b/i;
function isUnsafe(text) {
  return typeof text === "string" && UNSAFE.test(text);
}

function cleanSuggestions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s) => s && typeof s.label === "string" && ASSISTANT_ROUTES.includes(s.route))
    .slice(0, 3)
    .map((s) => ({ label: s.label.slice(0, 40), route: s.route }));
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();

  if (llm) {
    try {
      const json = extractJson(
        await llm.complete(safeSystemPrompt, buildAssistantUserPrompt(body))
      );
      const reply = json.reply;
      if (reply && !isUnsafe(reply)) {
        return Response.json({
          reply,
          suggestions: cleanSuggestions(json.suggestions),
          disclaimer: DISCLAIMER,
        });
      }
      // respuesta vacía o insegura → cae al generador
    } catch {
      // error → cae al generador
    }
  }

  return Response.json(genAssistant(body));
}
