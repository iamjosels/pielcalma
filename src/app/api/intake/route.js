import { getLLM, safeSystemPrompt, extractJson } from "@/lib/ai";
import { genIntake } from "@/lib/generators";

export async function GET() {
  return Response.json({ status: "ok", endpoint: "/api/intake" });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const llm = getLLM();
  const base = genIntake(body);

  if (llm) {
    try {
      const user = `Eres el onboarding de PielCalma. La cuidadora respondió unos toques rápidos y 2-3 preguntas abiertas.
Toques: ${JSON.stringify(body.taps || {})}.
Respuestas abiertas: ${JSON.stringify(body.answers || [])}.
Tu tarea: normalizar el perfil y extraer "memoria" durable y NO clínica (preferencias, rutina, contexto, qué le preocupa, posibles factores observados por la familia), sin diagnosticar.
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "profile": objeto { "caregiverName", "childName", "childAge" (número o null), "conditionLabel" }.
- "memorySeed": array de 4-8 frases cortas, durables y seguras.
- "welcomeMessage": string cálido de bienvenida, 1-2 frases, sin diagnóstico.`;
      const json = extractJson(await llm.complete(safeSystemPrompt, user));
      const p = json.profile || {};
      const ageNum = Number(p.childAge);
      return Response.json({
        profile: {
          caregiverName: (p.caregiverName || base.profile.caregiverName || "").toString().slice(0, 40),
          childName: (p.childName || base.profile.childName || "").toString().slice(0, 40),
          childAge: Number.isFinite(ageNum) ? ageNum : base.profile.childAge,
          conditionLabel: (p.conditionLabel || base.profile.conditionLabel || "Dermatitis atópica")
            .toString()
            .slice(0, 60),
        },
        memorySeed: Array.isArray(json.memorySeed) && json.memorySeed.length ? json.memorySeed.slice(0, 8) : base.memorySeed,
        welcomeMessage: json.welcomeMessage || base.welcomeMessage,
        disclaimer: base.disclaimer,
      });
    } catch {
      // cae al generador
    }
  }

  return Response.json(base);
}
