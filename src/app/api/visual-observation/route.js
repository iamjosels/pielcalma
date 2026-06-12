export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "/api/visual-observation",
    message: "Endpoint simulado de Observador Visual funcionando.",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { imageName = "registro-lucas-dia-7.jpg" } = body;

    return Response.json({
      imageName,
      observacionVisual:
        "Se observa enrojecimiento visible y resequedad aparente en la zona registrada.",
      comparacionAnterior:
        "Respecto al último registro, la extensión visual parece ligeramente mayor.",
      indiceVisualCambio: "+18%",
      limitaciones:
        "La observación puede verse afectada por iluminación, distancia, ángulo de la foto y calidad de imagen.",
      disclaimer:
        "Esta observación no constituye diagnóstico médico, no mide severidad clínica y no reemplaza la evaluación del dermatólogo.",
    });
  } catch (error) {
    return Response.json(
      {
        error: "No se pudo generar la observación visual.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}