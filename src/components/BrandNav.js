import Link from "next/link";
import { Leaf, ArrowRight } from "@/components/icons";
import { Magnetic, TactileButton } from "@/components/motion";
import ProfileSwitcher from "@/components/ProfileSwitcher";

export default function BrandNav({ active = "" }) {
  const links = [
    { href: "/calma", label: "Modo Calma", key: "calma" },
    { href: "/registro", label: "Registro", key: "registro" },
    { href: "/observador", label: "Observador", key: "observador" },
    { href: "/reporte", label: "Reporte", key: "reporte" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-hairline bg-cream/80 backdrop-blur-xl no-print">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-accent-soft ring-1 ring-inset ring-white/60 transition-transform group-hover:-rotate-6">
            <Leaf size={20} weight="duotone" className="text-accent" />
          </span>
          <span className="leading-tight">
            <span className="block text-[1.05rem] font-bold tracking-tight text-navy">
              PielCalma
            </span>
            <span className="-mt-0.5 block text-[0.7rem] font-medium text-ink-muted">
              Bitácora de cuidado
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm md:flex">
          {links.map((link) => {
            const isActive = active === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "font-semibold text-accent"
                    : "font-medium text-ink-muted transition-colors hover:text-navy"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:block">
            <ProfileSwitcher />
          </div>
          <Magnetic strength={0.25}>
            <TactileButton href="/calma" variant="navy" className="px-5 py-2.5 text-sm">
              Iniciar
              <ArrowRight size={16} weight="bold" />
            </TactileButton>
          </Magnetic>
        </div>
      </div>
    </nav>
  );
}
