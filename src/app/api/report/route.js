export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "/api/report",
    message: "Endpoint simulado de Reporte Médico funcionando.",
  });
}

export async function POST() {
  try {
    return Response.json({
      resumenSemanal:
        "Durante los últimos 7 días, Lucas presentó comezón alta en varios registros, especialmente en noches con sueño afectado. Ana logró registrar posibles factores como calor, sudor y detergente nuevo, lo que permite organizar mejor la información para la consulta.",
      patronesObservados: [
        "La comezón más alta coincidió con noches de sueño malo.",
        "Tres registros muestran coincidencia entre calor, sudor y mayor incomodidad.",
        "La rutina indicada fue parcial en algunos días con mayor comezón.",
        "No se confirma causalidad médica; son coincidencias útiles para conversar con el dermatólogo.",
      ],
      preguntasDermatologo: [
        "¿Qué señales deberían motivar una consulta antes de la fecha programada?",
        "¿Cómo deberíamos registrar los brotes cuando aparecen después de calor o sudoración?",
        "¿Qué información visual o de hábitos sería más útil llevar a la próxima consulta?",
      ],
      observacionesVisuales: [
        "Se observó enrojecimiento visible en la zona registrada.",
        "La extensión visual parece ligeramente mayor respecto al registro anterior.",
        "La comparación puede estar influenciada por iluminación y ángulo.",
      ],
      calmaFamiliar: 72,
      disclaimer:
        "PielCalma no diagnostica, no indica tratamientos y no reemplaza al dermatólogo. Este reporte organiza información registrada por la cuidadora para facilitar la conversación con el profesional de salud.",
    });
  } catch (error) {
    return Response.json(
      {
        error: "No se pudo generar el reporte.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}