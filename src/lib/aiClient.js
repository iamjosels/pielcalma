/**
 * IA en el CLIENTE (para el APK offline de Capacitor).
 * Llama al endpoint OpenAI-compatible directamente desde el dispositivo usando
 * claves NEXT_PUBLIC_* embebidas en el build del APK. En nativo, CapacitorHttp
 * enruta el fetch por código nativo y evita CORS.
 *
 * ⚠️ La clave queda embebida en el APK (decisión consciente para el demo).
 * En la web NO se usa este módulo: ahí corren las API routes server-side.
 *
 * Si el LLM falla o no hay clave, cae a los generadores deterministas seguros.
 */
import {
  genCalmSummary,
  genVisualObservation,
  genReport,
  genAssistant,
  genExtractLog,
  genForecast,
  genIntake,
  genLearn,
  ASSISTANT_ROUTES,
  DISCLAIMER,
} from "@/lib/generators";
import { buildAssistantUserPrompt } from "@/lib/assistantPrompt";

const BASE = (process.env.NEXT_PUBLIC_OPENAI_BASE_URL || "").replace(/\/+$/, "");
const MODEL = process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4o-mini";
const KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

const safeSystemPrompt = `Eres PielCalma, un asistente de acompañamiento para cuidadores de niños con dermatitis atópica.
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

const UNSAFE =
  /\b(diagn[oó]stic\w*|severo|severa|severidad|leve\w*|moderad\w*|infecci\w*|dermatitis|eccema|eczema|psoriasis|alergi\w*|melanoma|c[aá]ncer|cancer\w*|hongo\w*|bacteri\w*|grave\w*|urgen\w*|maligno|tumor)\b/i;

function isUnsafe(text) {
  return typeof text === "string" && UNSAFE.test(text);
}

function extractJson(text) {
  if (!text) throw new Error("empty");
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  return JSON.parse(raw.slice(start, end + 1));
}

export function hasClientLLM() {
  return Boolean(BASE && KEY);
}

async function chat(messages) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages,
    }),
  });
  if (!res.ok) throw new Error(`llm ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

function complete(system, user) {
  return chat([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
}

function completeVision(system, userText, imageDataUrl) {
  return chat([
    { role: "system", content: system },
    {
      role: "user",
      content: [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ],
    },
  ]);
}

/* ---------------- endpoints replicados ---------------- */
export async function calmSummaryClient(body) {
  if (hasClientLLM()) {
    try {
      const user = `Genera el acompañamiento de "Modo Calma" para la cuidadora a partir de estos datos reales del día: ${JSON.stringify(
        body
      )}.
Si los datos incluyen "plan" (indicaciones del dermatólogo), ancla el "mensajeEmpatico" a ese plan (p.ej. "según el plan de tu doctor, mantén la rutina de emoliente; lo estás manejando muy bien"), SIN cambiarlo, sin sugerir tratamientos nuevos ni modificar dosis.
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "mensajeEmpatico": string breve y cálido según la emoción.
- "datosOrdenados": array de strings con lo registrado (comezón, sueño, factores).
- "posibleCoincidencia": string que describa una posible coincidencia sin afirmar causa médica.
- "preguntaDermatologo": string con una pregunta útil para la consulta.
- "disclaimer": string breve.`;
      const json = extractJson(await complete(safeSystemPrompt, user));
      return {
        mensajeEmpatico: json.mensajeEmpatico || "",
        datosOrdenados: Array.isArray(json.datosOrdenados) ? json.datosOrdenados : [],
        posibleCoincidencia: json.posibleCoincidencia || "",
        preguntaDermatologo: json.preguntaDermatologo || "",
        disclaimer: json.disclaimer || DISCLAIMER,
      };
    } catch {
      // cae al generador
    }
  }
  return genCalmSummary(body);
}

export async function visualObservationClient(body) {
  const base = genVisualObservation(body);
  const { imageData, hasPrevious, deltaPct } = body;

  if (imageData && hasClientLLM()) {
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

      const json = extractJson(await completeVision(safeSystemPrompt, user, imageData));
      const obs = json.observacionVisual;
      const comp = json.comparacionAnterior;
      if (obs && !isUnsafe(obs) && !isUnsafe(comp)) {
        return { ...base, observacionVisual: obs, comparacionAnterior: comp || base.comparacionAnterior };
      }
    } catch {
      // cae a base
    }
  }
  return base;
}

export async function reportClient(body) {
  if (hasClientLLM()) {
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
      const json = extractJson(await complete(safeSystemPrompt, user));
      return {
        resumenSemanal: json.resumenSemanal || "",
        patronesObservados: Array.isArray(json.patronesObservados) ? json.patronesObservados : [],
        preguntasDermatologo: Array.isArray(json.preguntasDermatologo) ? json.preguntasDermatologo : [],
        observacionesVisuales: Array.isArray(json.observacionesVisuales) ? json.observacionesVisuales : [],
        calmaFamiliar: typeof json.calmaFamiliar === "number" ? json.calmaFamiliar : body.calmaFamiliar || 0,
        disclaimer: json.disclaimer || DISCLAIMER,
      };
    } catch {
      // cae al generador
    }
  }
  return genReport(body);
}

// Regex laxo para el asistente: "dermatitis"/"alergia" son legítimos aquí.
const ASSISTANT_UNSAFE =
  /\b(diagn[oó]stic\w*|severo|severa|severidad|moderad\w*|melanoma|c[aá]ncer|cancer\w*|maligno|tumor)\b/i;

function cleanSuggestions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s) => s && typeof s.label === "string" && ASSISTANT_ROUTES.includes(s.route))
    .slice(0, 3)
    .map((s) => ({ label: s.label.slice(0, 40), route: s.route }));
}

const X_TRIGGERS = ["Calor", "Sudor", "Polvo", "Detergente nuevo", "Comida nueva", "Estrés", "Mascota"];
const X_AREAS = ["Cuello", "Brazos", "Piernas", "Rostro", "Pliegues"];
const X_SLEEP = ["bueno", "regular", "malo"];
const X_UNSAFE = /\b(diagn[oó]stic\w*|severo|severa|severidad|infecci\w*|melanoma|c[aá]ncer|cancer\w*|maligno|tumor|psoriasis)\b/i;

export async function extractLogClient(body) {
  if (hasClientLLM() && body.text) {
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
      const json = extractJson(await complete(safeSystemPrompt, user));
      const itch = Math.max(0, Math.min(10, Math.round(Number(json.itchLevel))));
      const validacion =
        typeof json.mensajeValidacion === "string" && !X_UNSAFE.test(json.mensajeValidacion)
          ? json.mensajeValidacion
          : genExtractLog(body).mensajeValidacion;
      return {
        itchLevel: Number.isFinite(itch) ? itch : 5,
        sleepQuality: X_SLEEP.includes(json.sleepQuality) ? json.sleepQuality : "regular",
        triggers: Array.isArray(json.triggers) ? json.triggers.filter((t) => X_TRIGGERS.includes(t)) : [],
        areas: Array.isArray(json.areas) ? json.areas.filter((a) => X_AREAS.includes(a)) : [],
        notes: typeof json.notes === "string" && json.notes.trim() ? json.notes.trim() : String(body.text || "").trim(),
        disparador: typeof json.disparador === "string" ? json.disparador : "Sin factor claro",
        sintoma: typeof json.sintoma === "string" && !X_UNSAFE.test(json.sintoma) ? json.sintoma : "Molestia observada",
        mensajeValidacion: validacion,
        disclaimer: DISCLAIMER,
      };
    } catch {
      // cae al generador
    }
  }
  return genExtractLog(body);
}

export async function assistantClient(body) {
  if (hasClientLLM()) {
    try {
      const json = extractJson(await complete(safeSystemPrompt, buildAssistantUserPrompt(body)));
      const reply = json.reply;
      if (reply && !ASSISTANT_UNSAFE.test(reply)) {
        return {
          reply,
          suggestions: cleanSuggestions(json.suggestions),
          disclaimer: DISCLAIMER,
        };
      }
    } catch {
      // cae al generador
    }
  }
  return genAssistant(body);
}

export async function forecastClient(body) {
  const base = genForecast(body);
  if (hasClientLLM() && body.risk && !body.risk.insufficient) {
    try {
      const user = `A partir de esta señal LOCAL de coincidencias de los propios registros (NO es clínica), redacta una anticipación cálida y segura para los próximos días.
Señal: ${JSON.stringify(body.risk)}.
Contexto agregado (no inventes cifras): ${JSON.stringify(body.context || {})}.
Reglas: NO predigas un brote, NO uses severidad (leve/moderado/severo), NO diagnostiques, NO cambies tratamiento. Habla de "tus registros" y "podría ser útil observar".
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "frase": una sola frase empática y prudente sobre los próximos días.
- "observaciones": array de 2-3 strings de "qué observar".
- "disclaimer": string breve.`;
      const json = extractJson(await complete(safeSystemPrompt, user));
      if (json.frase && !isUnsafe(json.frase)) {
        return {
          frase: json.frase,
          observaciones: Array.isArray(json.observaciones) ? json.observaciones : base.observaciones,
          disclaimer: DISCLAIMER,
        };
      }
    } catch {
      // cae al generador
    }
  }
  return base;
}

export async function intakeClient(body) {
  const base = genIntake(body);
  if (hasClientLLM()) {
    try {
      const user = `Eres el onboarding de PielCalma. La cuidadora respondió unos toques rápidos y 2-3 preguntas abiertas.
Toques: ${JSON.stringify(body.taps || {})}.
Respuestas abiertas: ${JSON.stringify(body.answers || [])}.
Tu tarea: normalizar el perfil y extraer "memoria" durable y NO clínica (preferencias, rutina, contexto, qué le preocupa, posibles factores observados por la familia), sin diagnosticar.
Devuelve un objeto JSON con EXACTAMENTE estas claves:
- "profile": objeto { "caregiverName", "childName", "childAge" (número o null), "conditionLabel" }.
- "memorySeed": array de 4-8 frases cortas, durables y seguras (lo que conviene recordar de esta familia).
- "welcomeMessage": string cálido de bienvenida, 1-2 frases, sin diagnóstico.`;
      const json = extractJson(await complete(safeSystemPrompt, user));
      const p = json.profile || {};
      const seed = Array.isArray(json.memorySeed)
        ? json.memorySeed.filter((f) => typeof f === "string" && !isUnsafe(f)).slice(0, 8)
        : base.memorySeed;
      const welcome =
        typeof json.welcomeMessage === "string" && !isUnsafe(json.welcomeMessage)
          ? json.welcomeMessage
          : base.welcomeMessage;
      const ageNum = Number(p.childAge);
      return {
        profile: {
          caregiverName: (p.caregiverName || base.profile.caregiverName || "").toString().slice(0, 40),
          childName: (p.childName || base.profile.childName || "").toString().slice(0, 40),
          childAge: Number.isFinite(ageNum) ? ageNum : base.profile.childAge,
          conditionLabel: (p.conditionLabel || base.profile.conditionLabel || "Dermatitis atópica")
            .toString()
            .slice(0, 60),
        },
        memorySeed: seed.length ? seed : base.memorySeed,
        welcomeMessage: welcome,
      };
    } catch {
      // cae al generador
    }
  }
  return base;
}

export async function learnClient(body) {
  if (hasClientLLM() && body.text) {
    try {
      const user = `Extrae 0-3 datos DURABLES y NO clínicos para recordar de esta familia, a partir de su mensaje. Nada de diagnóstico, severidad ni tratamiento.
Lo que ya sé: ${String(body.memory || "—").slice(0, 800)}.
Mensaje nuevo: "${String(body.text).slice(0, 800)}".
Devuelve SOLO datos NUEVOS y útiles (preferencias, rutina, contexto, factores que la familia observa). Si no hay nada nuevo, devuelve lista vacía.
Devuelve un objeto JSON: { "facts": ["...", ...] }.`;
      const json = extractJson(await complete(safeSystemPrompt, user));
      const facts = Array.isArray(json.facts)
        ? json.facts.filter((f) => typeof f === "string" && f.trim() && !isUnsafe(f)).map((f) => f.trim().slice(0, 140)).slice(0, 3)
        : [];
      return { facts };
    } catch {
      // cae al generador
    }
  }
  return genLearn(body);
}
