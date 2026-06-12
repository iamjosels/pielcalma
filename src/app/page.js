import BrandNav from "@/components/BrandNav";
import { Reveal, Stagger, StaggerItem, Magnetic, TactileButton } from "@/components/motion";
import {
  Wind,
  NotePencil,
  Camera,
  Stethoscope,
  Path,
  Eye,
  ChatCircleDots,
  Check,
  ArrowRight,
  ArrowUpRight,
  Moon,
  HandHeart,
} from "@/components/icons";

const flows = [
  {
    n: "01",
    title: "Modo Calma",
    description:
      "Cuando Ana se preocupa, la app la guía paso a paso para ordenar lo que observa sin entrar en pánico.",
    href: "/calma",
    label: "Empezar con calma",
    Icon: Wind,
    featured: true,
  },
  {
    n: "02",
    title: "Registro de brote",
    description:
      "Comezón, sueño, zonas, posibles factores y emoción de la cuidadora en menos de un minuto.",
    href: "/registro",
    label: "Registrar",
    Icon: NotePencil,
    wash: "bg-wash-green",
  },
  {
    n: "03",
    title: "Observador Visual",
    description:
      "Compara cambios visibles de forma descriptiva, sin diagnosticar ni medir severidad.",
    href: "/observador",
    label: "Observar imagen",
    Icon: Camera,
    wash: "bg-wash-peach",
  },
  {
    n: "04",
    title: "Reporte Médico",
    description:
      "Convierte una semana de registros en un resumen claro con preguntas para el dermatólogo.",
    href: "/reporte",
    label: "Ver reporte",
    Icon: Stethoscope,
    wash: "bg-accent-soft",
  },
];

const diff = [
  {
    Icon: Path,
    title: "Ordena",
    text: "Convierte dudas sueltas en registros claros de sueño, comezón, rutina y posibles factores.",
  },
  {
    Icon: Eye,
    title: "Observa",
    text: "Describe cambios visibles sin lenguaje clínico ni juicios médicos.",
  },
  {
    Icon: ChatCircleDots,
    title: "Comunica",
    text: "Prepara un reporte semanal con preguntas útiles para la consulta.",
  },
];

const iaSteps = [
  { n: "01", title: "Acompaña", text: "Adapta el tono según cómo se siente Ana." },
  { n: "02", title: "Observa", text: "Describe cambios visibles sin diagnóstico." },
  { n: "03", title: "Resume", text: "Genera reportes claros para el dermatólogo." },
];

const principles = [
  "No diagnostica",
  "No indica tratamientos",
  "No reemplaza al dermatólogo",
  "Organiza la información entre consultas",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-cream text-ink">
      <BrandNav />

      {/* HERO ---------------------------------------------------------- */}
      <section className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent-soft/45 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-40 h-96 w-96 rounded-full bg-wash-green/55 blur-3xl"
        />

        <Stagger className="relative">
          <StaggerItem className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-4 py-2 text-sm font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Reto 1 · Dermatitis atópica infantil
            </span>
          </StaggerItem>

          <StaggerItem>
            <h1 className="font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Cuidar la piel de tu hijo,{" "}
              <span className="relative whitespace-nowrap text-accent">
                sin cargar sola
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-3 w-full rounded-full bg-coral/30"
                />
              </span>{" "}
              con la incertidumbre.
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-muted">
              PielCalma acompaña a madres como Ana entre consultas: ordena
              brotes, sueño, posibles factores y cambios visibles, y convierte
              momentos de ansiedad en información clara para el dermatólogo.
            </p>
          </StaggerItem>

          <StaggerItem className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Magnetic strength={0.3}>
              <TactileButton href="/calma" variant="primary" className="w-full px-7 py-4 text-sm sm:w-auto">
                Entrar al Modo Calma
                <ArrowRight size={18} weight="bold" />
              </TactileButton>
            </Magnetic>
            <TactileButton href="/reporte" variant="secondary" className="px-7 py-4 text-sm">
              Ver reporte demo
            </TactileButton>
          </StaggerItem>

          <StaggerItem className="mt-9 flex flex-wrap gap-2.5">
            {principles.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-cream-card px-3.5 py-2 text-[0.8rem] font-medium text-ink-muted ring-1 ring-inset ring-hairline"
              >
                <Check size={14} weight="bold" className="text-accent" />
                {item}
              </span>
            ))}
          </StaggerItem>
        </Stagger>

        {/* Mockup de producto */}
        <Reveal as="div" delay={0.15} y={28} className="relative">
          <div className="relative mx-auto max-w-md rounded-[2.4rem] border border-hairline bg-cream-card p-5 shadow-[var(--shadow-lift)]">
            <div className="rounded-[2rem] bg-cream p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-navy">Hola Ana</p>
                  <p className="text-xs text-ink-muted">
                    Seguimiento de Lucas · 4 años
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  Calma <span className="font-mono">72</span>
                </span>
              </div>

              <div className="rounded-[1.5rem] bg-navy p-5 text-white">
                <p className="text-xs uppercase tracking-wide text-white/55">
                  Esta noche
                </p>
                <p className="mt-2 font-display text-2xl font-semibold leading-tight">
                  &ldquo;Lucas se rascó y no durmió bien&rdquo;
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  Respira. Vamos a ordenar lo que observaste en menos de un
                  minuto.
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[1.25rem] bg-wash-green p-4">
                  <p className="text-xs font-medium text-navy/60">Sueño</p>
                  <p className="mt-1.5 text-xl font-semibold text-navy">Malo</p>
                </div>
                <div className="rounded-[1.25rem] bg-wash-peach p-4">
                  <p className="text-xs font-medium text-navy/60">Comezón</p>
                  <p className="mt-1.5 font-mono text-xl font-semibold text-navy">
                    8/10
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-[1.25rem] border border-hairline bg-cream-card p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                  Observación de la app
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Se observa coincidencia entre sueño afectado, calor y sudor.
                  No confirma causa médica; puede conversarse con el
                  dermatólogo.
                </p>
              </div>
            </div>

            <div className="pc-float absolute -right-6 -top-6 hidden rounded-2xl bg-accent-soft p-3 shadow-[var(--shadow-soft)] md:block">
              <Moon size={24} weight="duotone" className="text-accent" />
            </div>
            <div
              className="pc-float absolute -bottom-6 -left-6 hidden rounded-2xl bg-wash-green p-3 shadow-[var(--shadow-soft)] md:block"
              style={{ animationDelay: "1.4s" }}
            >
              <HandHeart size={24} weight="duotone" className="text-navy" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* DIFERENCIA — heading sticky + lista con divisores (no 3 cards) -- */}
      <section className="border-y border-hairline bg-cream-card">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              La diferencia
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy lg:text-[2.5rem]">
              No es una app para diagnosticar. Es una app para acompañar mejor.
            </h2>
          </Reveal>

          <Stagger className="flex flex-col">
            {diff.map((d, i) => (
              <StaggerItem
                key={d.title}
                className={`flex gap-5 py-6 ${i > 0 ? "border-t border-hairline" : "lg:pt-0"}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-cream ring-1 ring-inset ring-hairline">
                  <d.Icon size={24} weight="duotone" className="text-accent" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-navy">{d.title}</h3>
                  <p className="mt-1.5 max-w-md leading-relaxed text-ink-muted">
                    {d.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FLUJOS — bento asimétrico ------------------------------------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <Reveal className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Flujos del MVP
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy lg:text-[2.5rem]">
            Cuatro momentos diseñados alrededor de Ana, no del sistema.
          </h2>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {flows.map((flow) => (
            <StaggerItem
              key={flow.title}
              className={
                flow.featured
                  ? "lg:col-span-7 lg:row-span-2"
                  : flow.n === "02" || flow.n === "04"
                    ? "lg:col-span-5"
                    : "lg:col-span-5"
              }
            >
              <Magnetic strength={0.12} className="h-full">
                <a
                  href={flow.href}
                  className={`group flex h-full flex-col justify-between rounded-[var(--radius-card)] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 ${
                    flow.featured
                      ? "min-h-[19rem] bg-navy text-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]"
                      : "border border-hairline bg-cream-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-[1.1rem] ${
                        flow.featured ? "bg-white/10" : flow.wash
                      }`}
                    >
                      <flow.Icon
                        size={28}
                        weight="duotone"
                        className={flow.featured ? "text-accent-soft" : "text-navy"}
                      />
                    </span>
                    <span
                      className={`font-mono text-sm ${flow.featured ? "text-white/40" : "text-ink-faint"}`}
                    >
                      {flow.n}
                    </span>
                  </div>

                  <div className={flow.featured ? "mt-10" : "mt-8"}>
                    <h3
                      className={`font-display font-semibold ${
                        flow.featured ? "text-3xl" : "text-xl"
                      } ${flow.featured ? "text-white" : "text-navy"}`}
                    >
                      {flow.title}
                    </h3>
                    <p
                      className={`mt-3 max-w-md leading-relaxed ${
                        flow.featured ? "text-white/70" : "text-ink-muted"
                      }`}
                    >
                      {flow.description}
                    </p>

                    <span
                      className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${
                        flow.featured ? "text-accent-soft" : "text-accent"
                      }`}
                    >
                      {flow.label}
                      <ArrowUpRight
                        size={16}
                        weight="bold"
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </a>
              </Magnetic>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* IA — sección navy con divisores ------------------------------ */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <Reveal className="overflow-hidden rounded-[var(--radius-card)] bg-navy p-8 text-white lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
                Calm Intelligence
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight lg:text-[2.4rem]">
                IA pensada para reducir ansiedad, no para reemplazar al médico.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
              {iaSteps.map((step) => (
                <div key={step.n} className="bg-navy p-6">
                  <span className="font-mono text-sm text-white/40">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* CIERRE -------------------------------------------------------- */}
      <section className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-6">
        <Reveal className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold leading-snug text-navy lg:text-3xl">
                &ldquo;Hoy no tienes que recordarlo todo. Solo registrar lo
                importante.&rdquo;
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">
                PielCalma no diagnostica, no indica tratamientos y no reemplaza
                al dermatólogo. Las observaciones son descriptivas y sirven para
                organizar información entre consultas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Magnetic strength={0.3}>
                <TactileButton href="/calma" variant="primary" className="w-full px-7 py-4 text-sm sm:w-auto">
                  Probar flujo completo
                  <ArrowRight size={18} weight="bold" />
                </TactileButton>
              </Magnetic>
              <TactileButton href="/reporte" variant="secondary" className="px-7 py-4 text-sm">
                Ver reporte
              </TactileButton>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER -------------------------------------------------------- */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:px-6">
          <p className="font-medium text-navy">
            PielCalma · Bitácora inteligente de cuidado familiar
          </p>
          <p>Reto 1 · Desafío IA Bagó Perú</p>
        </div>
      </footer>
    </main>
  );
}
