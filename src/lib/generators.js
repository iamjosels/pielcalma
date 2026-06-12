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

  return {
    mensajeEmpatico: EMPATHY[emotion] || EMPATHY.preocupada,
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
