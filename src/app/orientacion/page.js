import BrandNav from "@/components/BrandNav";
import SafeDisclaimer from "@/components/SafeDisclaimer";
import { Reveal, Stagger, StaggerItem, TactileButton } from "@/components/motion";
import {
  ShieldCheck,
  Eye,
  ThermometerSimple,
  HandHeart,
  ChatCircleDots,
  Sparkle,
  ArrowRight,
  ArrowUpRight,
} from "@/components/icons";

const observar = [
  "La comezón: qué tan intensa fue y cuándo apareció.",
  "El sueño: si la noche se vio interrumpida.",
  "Las zonas donde se concentra lo que observas.",
  "Posibles factores del día (calor, sudor, algo nuevo).",
  "Cómo se siente la familia: la carga también cuenta.",
];

const cards = [
  {
    Icon: Sparkle,
    wash: "bg-accent-soft",
    title: "¿Qué es un brote?",
    text: "La dermatitis atópica suele presentarse en brotes: periodos en que la piel se ve más reactiva, con comezón y resequedad aparente. Cada niño la vive de forma distinta y puede cambiar con el tiempo.",
  },
  {
    Icon: ThermometerSimple,
    wash: "bg-wash-peach",
    title: "Factores que suelen mencionarse",
    text: "Los desencadenantes varían de un niño a otro. Entre los que suelen mencionarse: calor, sudor, polvo, detergentes nuevos, alimentos nuevos y el estrés. Observarlos no confirma una causa; es información para conversar con el dermatólogo.",
  },
  {
    Icon: HandHeart,
    wash: "bg-wash-green",
    title: "Hábitos que acompañan el cuidado",
    text: "El sueño, la alimentación, la actividad física y el estrés forman parte del día a día. Registrarlos ayuda a notar patrones; PielCalma te acompaña en ese hábito.",
  },
  {
    Icon: ChatCircleDots,
    wash: "bg-accent-soft",
    title: "Conversar con el dermatólogo",
    text: "Ante dudas, cambios que te preocupen o cuando quieras revisar la evolución, puedes conversarlo con tu dermatólogo. Llevar un reporte ordenado hace esa conversación más clara.",
  },
];

export default function OrientacionPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-cream text-ink">
      <BrandNav active="orientacion" />

      <section className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-accent-soft/45 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-wash-green/55 blur-3xl"
        />

        {/* Encabezado */}
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-4 py-2 text-sm font-medium text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Orientación · Información general
            </span>
            <h1 className="font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl">
              Entender la dermatitis atópica, sin entrar en pánico.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Información general y descriptiva para acompañar el cuidado entre
              consultas. No es diagnóstico, no indica tratamientos y no reemplaza
              al dermatólogo.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                <Eye size={20} weight="duotone" className="text-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Qué conviene observar
                </p>
              </div>
              <ul className="mt-4 flex flex-col gap-2.5">
                {observar.map((o) => (
                  <li key={o} className="flex gap-2 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Tarjetas */}
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2">
          {cards.map((c) => (
            <StaggerItem
              key={c.title}
              className="rounded-[var(--radius-card)] border border-hairline bg-cream-card p-6 shadow-[var(--shadow-card)] sm:p-7"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${c.wash}`}>
                <c.Icon size={24} weight="duotone" className="text-navy" />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold text-navy">
                {c.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{c.text}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Nota de evidencia */}
        <Reveal className="mt-8 rounded-[var(--radius-card)] bg-navy p-6 text-white shadow-[var(--shadow-soft)] sm:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} weight="duotone" className="text-accent-soft" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Cómo lo entendemos
            </p>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/80">
            PielCalma se inspira en el seguimiento reportado por cuidadores
            (sueño, comezón, frecuencia y evolución), no en una evaluación
            clínica. La interpretación médica siempre corresponde al profesional
            de salud.
          </p>
        </Reveal>

        <div className="mt-8">
          <SafeDisclaimer />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TactileButton href="/registro" variant="primary" className="px-6 py-3.5 text-sm">
            Empezar a registrar
            <ArrowRight size={18} weight="bold" />
          </TactileButton>
          <TactileButton href="/reporte" variant="secondary" className="px-6 py-3.5 text-sm">
            Ver reporte
            <ArrowUpRight size={18} weight="bold" />
          </TactileButton>
        </div>
      </section>
    </main>
  );
}
