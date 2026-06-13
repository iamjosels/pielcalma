/**
 * Generadores de texto (fallback sin IA externa).
 * Calculan la narrativa desde los datos REALES recibidos.
 * Lenguaje siempre seguro: nada de diagnóstico, severidad ni tratamiento.
 */

export const DISCLAIMER =
  "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo. Las observaciones son descriptivas y sirven para organizar información entre consultas.";

const VISUAL_LIMITS =
  "La observación puede verse afectada por iluminación, distancia, ángulo de la foto y calidad de imagen.";

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const EMPATHY = {
  agotada:
    "Ana, entiendo que esta situación puede sentirse muy pesada. No tienes que resolverlo todo en este momento. Vamos a ordenar la información paso a paso.",
  preocupada:
    "Ana, respira. Es comprensible que te preocupes cuando Lucas no duerme bien o se rasca mucho. Vamos a ordenar lo que observaste.",
  "con dudas":
    "Es normal tener dudas. PielCalma puede ayudarte a registrar lo importante para conversarlo mejor con el dermatólogo.",
  tranquila:
    "Qué bueno que estás tranquila. Mantener un registro constante ayuda a identificar posibles coincidencias con el tiempo.",
};

export function genCalmSummary(data = {}) {
  const {
    emotion = "preocupada",
    itchLevel = 0,
    sleepQuality = "regular",
    triggers = [],
    areas = [],
    notes = "",
    plan = "",
  } = data;

  const datosOrdenados = [
    `Comezón registrada: ${itchLevel}/10`,
    `Calidad de sueño: ${cap(sleepQuality)}`,
    triggers.length
      ? `Posibles factores observados: ${triggers.join(", ")}`
      : "Sin factores marcados para hoy",
  ];
  if (areas.length) datosOrdenados.push(`Zonas observadas: ${areas.join(", ")}`);
  if (notes) datosOrdenados.push(`Nota de Ana: ${notes}`);

  const high = Number(itchLevel) >= 7;
  const badSleep = sleepQuality === "malo";
  const factorTxt = triggers.length ? triggers.join(" o ") : "factores cotidianos";

  let posibleCoincidencia;
  if (high && badSleep) {
    posibleCoincidencia = `Se observa una posible coincidencia entre mayor comezón, sueño afectado y ${factorTxt}. Esto no confirma una causa médica.`;
  } else if (high) {
    posibleCoincidencia = `Se observa mayor comezón hoy, con relación aparente a ${factorTxt}. No confirma una causa médica.`;
  } else if (triggers.length) {
    posibleCoincidencia = `Hoy la comezón fue más llevadera; se registraron ${factorTxt} como contexto. Es una observación, no una causa confirmada.`;
  } else {
    posibleCoincidencia =
      "No se observan coincidencias marcadas hoy. Mantener el registro ayuda a notar patrones con el tiempo.";
  }

  const preguntaDermatologo = triggers.length
    ? `Doctor/a, ¿estos brotes podrían estar relacionados con ${factorTxt} o con cambios en la rutina diaria?`
    : "Doctor/a, ¿qué señales conviene observar y registrar entre consultas para entender mejor los brotes?";

  const base = EMPATHY[emotion] || EMPATHY.preocupada;
  const mensajeEmpatico = plan
    ? `${base} Según el plan de tu doctor, mantén tu rutina de cuidado de hoy; lo estás manejando muy bien.`
    : base;

  return {
    mensajeEmpatico,
    datosOrdenados,
    posibleCoincidencia,
    preguntaDermatologo,
    disclaimer: DISCLAIMER,
  };
}

const QUESTION_BANK = [
  "¿Qué señales deberían motivar una consulta antes de la fecha programada?",
  "¿Cómo conviene registrar los brotes cuando aparecen después de calor o sudoración?",
  "¿Qué información visual o de hábitos sería más útil llevar a la próxima consulta?",
  "¿Qué zonas conviene observar con más atención según lo registrado esta semana?",
];

export function genReport(data = {}) {
  const {
    registeredDays = 0,
    highItchDays = 0,
    affectedSleepNights = 0,
    calmaFamiliar = 0,
    patrones = [],
    observaciones = [],
    weekly = [],
  } = data;

  const topFactors = [
    ...new Set(
      weekly
        .filter((d) => d.hasData && d.triggers && d.triggers !== "—")
        .flatMap((d) => d.triggers.split(",").map((t) => t.trim()))
    ),
  ].slice(0, 3);

  let resumenSemanal;
  if (registeredDays === 0) {
    resumenSemanal =
      "Aún no hay registros esta semana. Cuando Ana registre los días de Lucas, este resumen reflejará comezón, sueño y posibles coincidencias para la consulta.";
  } else {
    resumenSemanal =
      `En los últimos ${registeredDays} día${registeredDays > 1 ? "s" : ""} registrado${registeredDays > 1 ? "s" : ""}, ` +
      `se anotaron ${highItchDays} día${highItchDays === 1 ? "" : "s"} de comezón alta y ` +
      `${affectedSleepNights} noche${affectedSleepNights === 1 ? "" : "s"} de sueño reportado como malo. ` +
      (topFactors.length
        ? `Entre los factores observados aparecen ${topFactors.join(", ")}. `
        : "") +
      "La información queda organizada para conversarla con el dermatólogo.";
  }

  const preguntasDermatologo = QUESTION_BANK.slice(0, 3);
  if (topFactors.length) {
    preguntasDermatologo[1] = `¿Cómo conviene registrar los brotes cuando aparecen junto a ${topFactors[0]}?`;
  }

  return {
    resumenSemanal,
    patronesObservados: patrones.length
      ? patrones
      : ["Aún no hay suficientes registros para describir patrones."],
    preguntasDermatologo,
    observacionesVisuales: observaciones.length
      ? observaciones
      : ["Aún no hay observaciones visuales registradas esta semana."],
    calmaFamiliar,
    disclaimer: DISCLAIMER,
  };
}

/* ---------------- Extracción de registro desde relato (voz/texto) ---------------- */
const TRIGGER_KW = [
  ["Calor", ["calor", "caluroso", "calurosa"]],
  ["Sudor", ["sudor", "sudó", "sudo", "transpir"]],
  ["Polvo", ["polvo", "tierra"]],
  ["Detergente nuevo", ["detergente", "jabón", "jabon", "suavizante"]],
  ["Comida nueva", ["comida", "comió", "comio", "aliment", "fresa", "maní", "mani", "huevo"]],
  ["Estrés", ["estrés", "estres", "nervios", "ansios", "lloró", "lloro", "berrinche"]],
  ["Mascota", ["mascota", "perro", "gato", "pelo de"]],
];
const AREA_KW = [
  ["Cuello", ["cuello"]],
  ["Brazos", ["brazo", "brazos", "codo"]],
  ["Piernas", ["pierna", "piernas", "rodilla"]],
  ["Rostro", ["rostro", "cara", "mejilla", "frente"]],
  ["Pliegues", ["pliegue", "doblez", "axila", "ingle"]],
];

export function genExtractLog(data = {}) {
  const text = String(data.text || "").toLowerCase();
  const plan = data.plan || "";

  const triggers = TRIGGER_KW.filter(([, kws]) => kws.some((k) => text.includes(k))).map(([t]) => t);
  const areas = AREA_KW.filter(([, kws]) => kws.some((k) => text.includes(k))).map(([a]) => a);

  const strong = /(toda la noche|no durmi|mucho|intens|rasc[óo] mucho|no par[óo])/.test(text);
  const mild = /(roj|mancha|rasc|comez|pic)/.test(text);
  const itchLevel = strong ? 8 : mild ? 6 : 5;

  const sleepQuality = /(no durmi|mala noche|despert|interrump|no par[óo] de rascar)/.test(text)
    ? "malo"
    : /(durmi[óo] bien|descans)/.test(text)
      ? "bueno"
      : "regular";

  const sintoma = /(roj|mancha)/.test(text)
    ? "Enrojecimiento o mancha aparente"
    : /(rasc|comez|pic)/.test(text)
      ? "Comezón reportada"
      : "Molestia observada";

  const mensajeValidacion = plan
    ? "Según el plan de tu doctor, mantén tu rutina de cuidado de hoy. Lo estás manejando muy bien."
    : "Registro guardado. Mantén la observación y conversa los cambios con tu dermatólogo.";

  return {
    itchLevel,
    sleepQuality,
    triggers,
    areas,
    notes: String(data.text || "").trim(),
    disparador: triggers[0] || "Sin factor claro",
    sintoma,
    mensajeValidacion,
    disclaimer: DISCLAIMER,
  };
}

/* ---------------- Asistente (navegación + ayuda) ---------------- */
// Secciones de la app con sus palabras clave (para mapear intención → ruta).
const ASSISTANT_SECTIONS = [
  {
    route: "/estado",
    label: "Registrar estado",
    where:
      "En Estado registras el día de tu peque: una foto opcional, qué pudo influir (alimentación, entorno, ropa, estrés) y los deslizadores de comezón y sueño. La IA te devuelve una lectura segura.",
    kw: ["registr", "anot", "estado", "comez", "sueñ", "sueno", "foto", "imagen", "cámara", "camara", "piel", "diario", "hábito", "habito", "factor", "hoy"],
  },
  {
    route: "/historial",
    label: "Ver historial",
    where:
      "En Historial encuentras tus métricas técnicas, el gráfico de comezón, los patrones y el PDF para llevar al dermatólogo (descargar, imprimir o compartir).",
    kw: ["historial", "reporte", "pdf", "consulta", "derm", "médic", "medic", "semana", "resumen", "imprimir", "descargar", "compartir", "gráfic", "grafic", "métric", "metric"],
  },
  {
    route: "/plan",
    label: "Ver el plan",
    where:
      "En 'Plan del dermatólogo' guardas la guía del médico (emoliente, baño, qué hacer en brote, medicación indicada) y la app valida tu cuidado según ese plan.",
    kw: ["plan", "doctor", "dermat", "indic", "rutina del médico", "emoliente", "crema", "tratamiento del doctor", "rutina", "recordator"],
  },
  {
    route: "/plus",
    label: "Ver planes",
    where:
      "En 'PielCalma Plus' ves los planes (Basic gratis, Plus y alianzas) y qué incluye cada uno.",
    kw: ["plus", "premium", "precio", "plan de pago", "suscrip", "pagar", "cuánto cuesta", "cuanto cuesta", "gratis"],
  },
];

export const ASSISTANT_ROUTES = ASSISTANT_SECTIONS.map((s) => s.route).concat(["/", "/asistente"]);

export function genAssistant(data = {}) {
  const q = String(data.question || "").toLowerCase();
  const name = data.caregiverName || "";
  const ctx = data.context || {};
  const greet = name ? `${name}, ` : "";
  const child = ctx.childName || "tu peque";

  const reg = Number(ctx.registeredDays) || 0;
  const high = Number(ctx.highItchDays) || 0;
  const badSleep = Number(ctx.affectedSleepNights) || 0;
  const calma = Number(ctx.calmaFamiliar) || 0;
  // Quita las frases-disclaimer de los arrays para citar lo útil.
  const antic = (Array.isArray(ctx.anticipaciones) ? ctx.anticipaciones : []).filter(
    (a) => a && !/^esto no predice|^aún no hay|^por ahora no/i.test(a)
  );
  const patr = (Array.isArray(ctx.patrones) ? ctx.patrones : []).filter(
    (p) => p && !/^no confirma|^la semana se mantuvo/i.test(p)
  );

  const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  let reply;
  let suggestions = [];

  if (/(semana|cómo va|como va|resumen|esta semana|qué tal|que tal|últimos d|ultimos d)/.test(q)) {
    reply =
      `${greet}esta semana registraste ${reg} día${reg === 1 ? "" : "s"}. ` +
      `Hubo ${high} día${high === 1 ? "" : "s"} de comezón alta y ${badSleep} noche${badSleep === 1 ? "" : "s"} de sueño irregular. ` +
      (patr.length ? `Algo que se observa: ${lower(patr[0])} ` : "") +
      `Tu Calma Familiar va en ${calma}/100. Lo estás siguiendo muy bien.`;
    suggestions = [{ label: "Ver historial", route: "/historial" }];
  } else if (/(comez|brote|rasc|piel|roj|mancha)/.test(q)) {
    reply = high
      ? `${greet}en tus registros recientes hubo ${high} día${high === 1 ? "" : "s"} con más comezón. ${patr[0] ? `${patr[0]} ` : ""}No confirma una causa; seguir anotando ayuda a notar el patrón y conversarlo con tu dermatólogo.`
      : `${greet}por ahora la comezón se ve llevadera en lo que registras de ${child}. Mantener la rutina de cuidado ayuda a sostenerlo.`;
    suggestions = [{ label: "Registrar hoy", route: "/estado" }];
  } else if (/(sueñ|sueno|dorm|noche|descans)/.test(q)) {
    reply = badSleep
      ? `${greet}registraste ${badSleep} noche${badSleep === 1 ? "" : "s"} de sueño irregular esta semana. El descanso suele ir de la mano con días más calmados, así que cuidarlo puede ayudar a notar la diferencia.`
      : `${greet}el sueño de ${child} se ve estable en tus registros. ¡Buen trabajo cuidando el descanso!`;
  } else if (/(observ|próxim|proxim|anticip|qué viene|que viene|qué hago|que hago)/.test(q)) {
    reply = antic.length
      ? `${greet}mirando TUS propios registros, para los próximos días: ${lower(antic[0])}`
      : `${greet}aún no aparecen coincidencias marcadas en tus registros. Seguir anotando unos días hará que las señales se vean más claras.`;
  } else if (/(plan|doctor|dermat|crema|emoliente|tratamiento|medic)/.test(q)) {
    reply = `${greet}tengo guardado el plan de tu dermatólogo y lo uso para acompañarte sin cambiar nada de lo que él indicó. Si tienes una duda de tratamiento, lo mejor es conversarla con él; mientras, puedo ayudarte a ordenar lo que observas.`;
    suggestions = [{ label: "Ver el plan", route: "/plan" }];
  } else if (/(hola|buenas|gracias|cómo estás|como estas|ayuda|qué puedes|que puedes)/.test(q)) {
    reply = `${greet}aquí estoy contigo. Puedo contarte cómo viene la semana de ${child}, ayudarte a entender tus registros y anticipar qué observar. Cuéntame qué tienes en mente. 💚`;
  } else {
    reply =
      `${greet}estoy contigo. Por lo que veo, llevas ${reg} día${reg === 1 ? "" : "s"} registrados esta semana y tu Calma Familiar va en ${calma}/100. ` +
      (antic.length ? `Algo a tener en cuenta: ${lower(antic[0])} ` : "") +
      `Cuéntame qué te preocupa de la piel de ${child} y lo vemos juntas.`;
  }

  return { reply, suggestions, disclaimer: DISCLAIMER };
}

/* ---------------- Onboarding (intake → perfil + memoria) ---------------- */
export function genIntake(data = {}) {
  const taps = data.taps || {};
  const answers = Array.isArray(data.answers) ? data.answers : [];
  const joined = answers.join(" ").toLowerCase();

  const caregiverName = (taps.caregiverName || "").toString().trim() || "Ana";
  const childName = (taps.childName || "").toString().trim() || "tu peque";
  const ageNum = Number(taps.childAge);
  const childAge = Number.isFinite(ageNum) ? ageNum : null;
  const conditionLabel = (taps.condition || "Dermatitis atópica").toString().trim();

  const memorySeed = [];
  if (Array.isArray(taps.triggers) && taps.triggers.length) {
    memorySeed.push(`Factores que la familia ya identifica: ${taps.triggers.join(", ")}.`);
  }
  // Datos durables desde las respuestas abiertas (keywords seguras)
  const triggersFromText = TRIGGER_KW.filter(([, kws]) => kws.some((k) => joined.includes(k))).map(([t]) => t);
  if (triggersFromText.length) {
    memorySeed.push(`En su relato aparecen posibles factores: ${triggersFromText.join(", ")}.`);
  }
  if (/(noche|dorm|sueñ|sueno|despert)/.test(joined)) {
    memorySeed.push("Le preocupa el descanso y el sueño durante los brotes.");
  }
  if (/(rutina|crema|emoliente|baño|bano|recordar|olvid)/.test(joined)) {
    memorySeed.push("Quiere apoyo para mantener la rutina de cuidado en casa.");
  }
  if (/(consulta|doctor|dermat|médic|medic)/.test(joined)) {
    memorySeed.push("Le interesa llegar preparada a la consulta con el dermatólogo.");
  }
  memorySeed.push(`Cuida a ${childName}${childAge ? ` (${childAge} años)` : ""}; condición: ${conditionLabel}.`);

  const welcomeMessage = `¡Hola, ${caregiverName}! A partir de ahora acompaño el cuidado de ${childName} contigo, paso a paso. Vamos a ordenar lo importante sin presiones.`;

  return {
    profile: { caregiverName, childName, childAge, conditionLabel },
    memorySeed: memorySeed.slice(0, 8),
    welcomeMessage,
    disclaimer: DISCLAIMER,
  };
}

/* ---------------- Aprendizaje (extracción de datos durables) ---------------- */
const AREA_LABELS = ["Cuello", "Brazos", "Piernas", "Rostro", "Pliegues"];
export function genLearn(data = {}) {
  const text = String(data.text || "").toLowerCase();
  const known = String(data.memory || "").toLowerCase();
  const facts = [];

  const add = (f) => {
    if (f && !known.includes(f.toLowerCase()) && !facts.includes(f)) facts.push(f);
  };

  const triggers = TRIGGER_KW.filter(([, kws]) => kws.some((k) => text.includes(k))).map(([t]) => t);
  if (triggers.length) add(`Menciona como posible factor: ${triggers.join(", ")}.`);

  const areas = AREA_KW.filter(([, kws]) => kws.some((k) => text.includes(k))).map(([a]) => a);
  if (areas.length) add(`Suele observar la zona: ${areas.join(", ")}.`);

  if (/(no dorm|mala noche|despert|no par[óo] de rascar)/.test(text)) {
    add("Reporta noches con sueño interrumpido.");
  }
  if (/(rutina|emoliente|crema|baño|bano)/.test(text)) {
    add("Sigue una rutina de cuidado en casa (emoliente/baño).");
  }

  return { facts: facts.slice(0, 3) };
}

/* ---------------- Predictor (frase segura del riesgo) ---------------- */
export function genForecast(data = {}) {
  const risk = data.risk || {};
  const level = risk.level || "bajo";
  const factors = Array.isArray(risk.factors) ? risk.factors : [];

  if (risk.insufficient) {
    return {
      frase:
        "Aún no hay suficientes registros para anticipar. Registra unos días más y aquí verás coincidencias de tus propios datos.",
      observaciones: ["Registrar el día ayuda a que aparezcan patrones."],
      disclaimer: DISCLAIMER,
    };
  }

  let frase;
  if (level === "alto") {
    frase =
      "En tus propios registros aparecen varias coincidencias estos días; podría ser útil observar la piel con atención y mantener la rutina de cuidado de siempre.";
  } else if (level === "medio") {
    frase =
      "Hay algunas señales en tus registros para tener en cuenta los próximos días; mantener la rutina y el descanso puede ayudar.";
  } else {
    frase =
      "Tus registros se ven estables; es un buen momento para mantener la rutina de cuidado tal como va.";
  }

  const observaciones = factors
    .filter((f) => f && f.weight > 0)
    .slice(0, 3)
    .map((f) => `Observar: ${String(f.label).toLowerCase()}.`);
  if (observaciones.length === 0) {
    observaciones.push("Seguir registrando el día para notar coincidencias con el tiempo.");
  }

  return { frase, observaciones, disclaimer: DISCLAIMER };
}

export function genVisualObservation(data = {}) {
  const {
    imageName = "imagen.jpg",
    redness = null,
    hasPrevious = false,
    deltaPct = null,
  } = data;

  let observacionVisual;
  if (redness === null) {
    observacionVisual =
      "Se observa la zona registrada en la imagen. Sirve como referencia visual para comparar entre registros.";
  } else if (redness >= 0.4) {
    observacionVisual =
      "Se observa enrojecimiento visible y resequedad aparente en la zona registrada.";
  } else if (redness >= 0.36) {
    observacionVisual =
      "Se observa cierta coloración aparente en la zona registrada, con bordes poco definidos.";
  } else {
    observacionVisual =
      "Se observa una coloración aparente más uniforme en la zona registrada.";
  }

  let comparacionAnterior;
  let indiceVisualCambio;
  if (hasPrevious && deltaPct !== null) {
    const sign = deltaPct > 0 ? "+" : deltaPct < 0 ? "−" : "";
    indiceVisualCambio = `${sign}${Math.abs(deltaPct)}%`;
    if (deltaPct > 4) {
      comparacionAnterior =
        "Respecto al registro anterior, la coloración aparente se ve algo más marcada.";
    } else if (deltaPct < -4) {
      comparacionAnterior =
        "Respecto al registro anterior, la coloración aparente se ve algo más tenue.";
    } else {
      comparacionAnterior =
        "Respecto al registro anterior, la coloración aparente se mantiene similar.";
    }
  } else {
    comparacionAnterior = "Primera referencia visual: aún no hay un registro anterior para comparar.";
    indiceVisualCambio = "Primera referencia";
  }

  return {
    imageName,
    observacionVisual,
    comparacionAnterior,
    indiceVisualCambio,
    limitaciones: VISUAL_LIMITS,
    disclaimer:
      "Esta observación no constituye diagnóstico médico, no mide severidad clínica y no reemplaza la evaluación del dermatólogo.",
  };
}
