import Link from "next/link";

const flows = [
  {
    title: "Modo Calma",
    description:
      "Cuando Ana se preocupa, la app la guía paso a paso para ordenar lo que observa sin entrar en pánico.",
    href: "/calma",
    label: "Empezar con calma",
    accent: "bg-[#DCD7FF]",
    icon: "🌙",
  },
  {
    title: "Registro de brote",
    description:
      "Comezón, sueño, zonas observadas, posibles factores y emoción de la cuidadora en menos de un minuto.",
    href: "/registro",
    label: "Registrar ahora",
    accent: "bg-[#DFF5EA]",
    icon: "✍️",
  },
  {
    title: "Observador Visual",
    description:
      "Compara cambios visibles de forma descriptiva, sin diagnosticar ni medir severidad médica.",
    href: "/observador",
    label: "Observar imagen",
    accent: "bg-[#FFE6D9]",
    icon: "📷",
  },
  {
    title: "Reporte Médico",
    description:
      "Convierte una semana de registros en un resumen claro con preguntas útiles para el dermatólogo.",
    href: "/reporte",
    label: "Ver reporte",
    accent: "bg-[#E6F0FF]",
    icon: "🩺",
  },
];

const principles = [
  "No diagnostica",
  "No indica tratamientos",
  "No reemplaza al dermatólogo",
  "Organiza información entre consultas",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8EF] text-[#25324B]">
      <nav className="relative z-20 border-b border-[#F3E7D8] bg-[#FFF8EF]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCD7FF] shadow-sm">
              <span className="text-xl">🌿</span>
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-[#25324B]">
                PielCalma
              </p>
              <p className="-mt-1 text-xs text-[#7B7289]">
                Bitácora inteligente de cuidado
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-[#6F6680] md:flex">
            <Link href="/calma" className="hover:text-[#6B5BD6]">
              Modo Calma
            </Link>
            <Link href="/registro" className="hover:text-[#6B5BD6]">
              Registro
            </Link>
            <Link href="/observador" className="hover:text-[#6B5BD6]">
              Observador
            </Link>
            <Link href="/reporte" className="hover:text-[#6B5BD6]">
              Reporte
            </Link>
          </div>

          <Link
            href="/calma"
            className="rounded-full bg-[#25324B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1D273B]"
          >
            Iniciar demo
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#DCD7FF]/50 blur-3xl" />
        <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#DFF5EA]/70 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F0DFCA] bg-[#FFFCF7] px-4 py-2 text-sm font-semibold text-[#6F6680] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#F4A7A3]" />
            Reto 1 · Dermatitis atópica infantil
          </div>

          <h1 className="max-w-4xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-[#25324B] md:text-7xl">
            Cuidar la piel de tu hijo,
            <span className="relative ml-3 inline-block">
              sin cargar sola con la incertidumbre.
              <span className="absolute -bottom-2 left-0 h-3 w-full rounded-full bg-[#F4A7A3]/35" />
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#625A70]">
            PielCalma acompaña a madres como Ana entre consultas: ordena
            brotes, sueño, posibles factores y cambios visibles para convertir
            momentos de ansiedad en información clara para el dermatólogo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/calma"
              className="rounded-full bg-[#6B5BD6] px-7 py-4 text-center text-sm font-bold text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
            >
              Entrar al Modo Calma
            </Link>

            <Link
              href="/reporte"
              className="rounded-full border border-[#E8DCCB] bg-[#FFFCF7] px-7 py-4 text-center text-sm font-bold text-[#25324B] shadow-sm transition hover:-translate-y-1 hover:bg-white"
            >
              Ver reporte demo
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-[#FFFCF7] px-4 py-3 text-sm font-semibold text-[#625A70] shadow-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DFF5EA] text-xs">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="relative mx-auto max-w-md rounded-[2.4rem] border border-[#F0DFCA] bg-[#FFFCF7] p-5 shadow-2xl shadow-[#C8B7A6]/20">
            <div className="rounded-[2rem] bg-[#FFF8EF] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#25324B]">
                    Hola Ana
                  </p>
                  <p className="text-xs text-[#7B7289]">
                    Seguimiento de Lucas · 4 años
                  </p>
                </div>

                <div className="rounded-full bg-[#DCD7FF] px-3 py-1 text-xs font-bold text-[#6B5BD6]">
                  Calma 72
                </div>
              </div>

              <div className="rounded-3xl bg-[#25324B] p-5 text-white">
                <p className="text-sm text-white/70">Esta noche</p>
                <h3 className="mt-2 text-2xl font-bold leading-tight">
                  “Lucas se rascó y no durmió bien”
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Respira. Vamos a ordenar lo que observaste en menos de un
                  minuto.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-[#DFF5EA] p-4">
                  <p className="text-xs font-bold text-[#4B7A61]">Sueño</p>
                  <p className="mt-2 text-xl font-black text-[#25324B]">
                    Malo
                  </p>
                </div>

                <div className="rounded-3xl bg-[#FFE6D9] p-4">
                  <p className="text-xs font-bold text-[#A7685D]">Comezón</p>
                  <p className="mt-2 text-xl font-black text-[#25324B]">
                    8/10
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6B5BD6]">
                  Observación de la app
                </p>
                <p className="mt-2 text-sm leading-6 text-[#625A70]">
                  Se observa coincidencia entre sueño afectado, calor y sudor.
                  No confirma causa médica; puede conversarse con el
                  dermatólogo.
                </p>
              </div>

              <div className="mt-4 rounded-3xl border border-[#F0DFCA] bg-[#FFFCF7] p-4">
                <p className="text-xs font-bold text-[#7B7289]">
                  Pregunta sugerida
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#25324B]">
                  ¿Cómo deberíamos registrar brotes después de noches calurosas?
                </p>
              </div>
            </div>

            <div className="absolute -right-8 -top-8 hidden rounded-3xl bg-[#DCD7FF] p-4 shadow-lg md:block">
              <p className="text-2xl">🌙</p>
            </div>

            <div className="absolute -bottom-8 -left-8 hidden rounded-3xl bg-[#DFF5EA] p-4 shadow-lg md:block">
              <p className="text-2xl">🫶</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#F0DFCA] bg-[#FFFCF7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
              La diferencia
            </p>

            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#25324B]">
              No es una app para “diagnosticar”. Es una app para acompañar
              mejor.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#FFF8EF] p-6">
              <p className="text-3xl">🧭</p>
              <h3 className="mt-4 text-lg font-black text-[#25324B]">
                Ordena
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#625A70]">
                Convierte dudas sueltas en registros claros de sueño, comezón,
                rutina y posibles factores.
              </p>
            </div>

            <div className="rounded-3xl bg-[#FFF8EF] p-6">
              <p className="text-3xl">👁️</p>
              <h3 className="mt-4 text-lg font-black text-[#25324B]">
                Observa
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#625A70]">
                Describe cambios visibles sin usar lenguaje clínico ni emitir
                juicios médicos.
              </p>
            </div>

            <div className="rounded-3xl bg-[#FFF8EF] p-6">
              <p className="text-3xl">📝</p>
              <h3 className="mt-4 text-lg font-black text-[#25324B]">
                Comunica
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#625A70]">
                Prepara un reporte semanal y preguntas útiles para la consulta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6B5BD6]">
            Flujos del MVP
          </p>

          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-[#25324B]">
            Cuatro momentos diseñados alrededor de Ana, no alrededor del sistema.
          </h2>

          <p className="mt-4 text-lg leading-8 text-[#625A70]">
            Cada flujo responde a un momento real: preocupación nocturna,
            registro rápido, observación visual y preparación para consulta.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {flows.map((flow) => (
            <Link
              key={flow.title}
              href={flow.href}
              className="group rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-5 shadow-sm transition hover:-translate-y-2 hover:shadow-xl hover:shadow-[#C8B7A6]/20"
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl ${flow.accent}`}
              >
                <span className="text-3xl">{flow.icon}</span>
              </div>

              <h3 className="text-xl font-black text-[#25324B]">
                {flow.title}
              </h3>

              <p className="mt-3 min-h-24 text-sm leading-6 text-[#625A70]">
                {flow.description}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-[#6B5BD6]">
                  {flow.label}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF8EF] transition group-hover:bg-[#6B5BD6] group-hover:text-white">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 rounded-[2rem] bg-[#25324B] p-8 text-white shadow-xl shadow-[#25324B]/10 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#DCD7FF]">
              Calm Intelligence
            </p>

            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight">
              IA diseñada para reducir ansiedad, no para reemplazar al médico.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-2xl">1</p>
              <h3 className="mt-3 font-bold">Acompaña</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Adapta el tono según cómo se siente Ana.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-2xl">2</p>
              <h3 className="mt-3 font-bold">Compara</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Describe cambios visibles sin diagnóstico.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-2xl">3</p>
              <h3 className="mt-3 font-bold">Resume</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Genera reportes claros para el dermatólogo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] border border-[#F0DFCA] bg-[#FFFCF7] p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#25324B]">
                “Hoy no tienes que recordarlo todo. Solo registrar lo importante.”
              </h2>

              <p className="mt-4 leading-7 text-[#625A70]">
                PielCalma no diagnostica, no indica tratamientos y no reemplaza
                al dermatólogo. Las observaciones son descriptivas y sirven para
                organizar información entre consultas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/calma"
                className="rounded-full bg-[#6B5BD6] px-7 py-4 text-center text-sm font-bold text-white shadow-lg shadow-[#6B5BD6]/20 transition hover:-translate-y-1 hover:bg-[#5848C7]"
              >
                Probar flujo completo
              </Link>

              <Link
                href="/reporte"
                className="rounded-full border border-[#E8DCCB] bg-white px-7 py-4 text-center text-sm font-bold text-[#25324B] transition hover:-translate-y-1"
              >
                Ver reporte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}