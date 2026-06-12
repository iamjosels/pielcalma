export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "/api/calm-summary",
    message: "Endpoint simulado de Modo Calma funcionando.",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      emotion = "preocupada",
      itchLevel = 8,
      sleepQuality = "malo",
      triggers = ["calor", "sudor"],
    } = body;

    let mensajeEmpatico = "";

    if (emotion === "agotada") {
      mensajeEmpatico =
        "Ana, entiendo que esta situación puede sentirse muy pesada. No tienes que resolverlo todo en este momento. Vamos a ordenar la información paso a paso.";
    } else if (emotion === "preocupada") {
      mensajeEmpatico =
        "Ana, respira. Es comprensible que te preocupes cuando Lucas no duerme bien o se rasca mucho. Vamos a ordenar lo que observaste.";
    } else if (emotion === "con dudas") {
      mensajeEmpatico =
        "Es normal tener dudas. PielCalma puede ayudarte a registrar lo importante para conversarlo mejor con el dermatólogo.";
    } else {
      mensajeEmpatico =
        "Qué bueno que estás tranquila. Mantener un registro constante puede ayudar a identificar posibles coincidencias con el tiempo.";
    }

    return Response.json({
      mensajeEmpatico,
      datosOrdenados: [
        `Comezón registrada: ${itchLevel}/10`,
        `Calidad de sueño: ${sleepQuality}`,
        `Posibles factores observados: ${triggers.join(", ")}`,
      ],
      posibleCoincidencia:
        "Se observa una posible coincidencia entre mayor comezón, sueño afectado y factores como calor o sudor. Esto no confirma una causa médica.",
      preguntaDermatologo:
        "Doctor/a, ¿estos brotes podrían estar relacionados con calor, sudoración o cambios en la rutina diaria?",
      disclaimer:
        "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo. Las observaciones son descriptivas y sirven para organizar información entre consultas.",
    });
  } catch (error) {
    return Response.json(
      {
        error: "No se pudo generar el resumen de calma.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}