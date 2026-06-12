/**
 * Capa LLM opcional (server-only). Si hay clave en el entorno, getLLM()
 * devuelve un cliente { complete(system, user) }; si no, devuelve null y
 * las rutas caen al generador de plantilla (generators.js).
 *
 * Las claves NUNCA se exponen al frontend: este módulo solo corre en API routes.
 */

export const safeSystemPrompt = `Eres PielCalma, un asistente de acompañamiento para cuidadores de niños con dermatitis atópica.
Tu función es ayudar a ordenar observaciones cotidianas, reducir carga mental y preparar información útil para conversar con el dermatólogo.

Reglas obligatorias:
- No diagnostiques.
- No clasifiques severidad clínica.
- No uses términos como leve, moderado o severo.
- No recomiendes medicamentos, cremas, dosis ni cambios de tratamiento.
- No digas que el usuario debe o no debe ir al médico.
- No reemplaces al dermatólogo.
- No afirmes causalidad médica.
- Usa lenguaje empático, claro y prudente.
- Usa frases como "se observa", "posible coincidencia", "podría ser útil registrar", "puede conversarse con el dermatólogo".
- Siempre incluye un disclaimer breve.

Devuelve SIEMPRE un único objeto JSON válido con exactamente las claves solicitadas, sin texto adicional ni markdown.`;

export function extractJson(text) {
  if (!text) throw new Error("empty");
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

function provider() {
  if (process.env.PIELCALMA_AI === "off") return null;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT
  )
    return "azure";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

async function openaiComplete(system, user) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

async function azureComplete(system, user) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "");
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.AZURE_OPENAI_API_KEY,
    },
    body: JSON.stringify({
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`azure ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

async function anthropicComplete(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const json = await res.json();
  return json.content?.[0]?.text || "";
}

export function getLLM() {
  const p = provider();
  if (!p) return null;
  const complete =
    p === "openai" ? openaiComplete : p === "azure" ? azureComplete : anthropicComplete;
  return { provider: p, complete };
}
