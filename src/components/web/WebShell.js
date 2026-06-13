"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import Mascot from "@/components/Mascot";
import ProfileSheet from "@/components/ProfileSheet";
import { PageTransition } from "@/components/motion";
import {
  House,
  Heart,
  ChartLineUp,
  ChatCircleDots,
  Stethoscope,
  Crown,
  GearSix,
  CaretDown,
} from "@/components/icons";

const PRIMARY = [
  { href: "/", label: "Inicio", Icon: House },
  { href: "/estado", label: "Estado de hoy", Icon: Heart },
  { href: "/historial", label: "Historial", Icon: ChartLineUp },
  { href: "/asistente", label: "Asistente", Icon: ChatCircleDots },
];

const SECONDARY = [
  { href: "/plan", label: "Plan del dermatólogo", Icon: Stethoscope },
  { href: "/plus", label: "PielCalma Plus", Icon: Crown },
  { href: "/ajustes", label: "Ajustes", Icon: GearSix },
];

function isActive(href, pathname) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/* Item de navegación vertical (sidebar de escritorio) */
function SideItem({ href, label, Icon, pathname, onClick }) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-[1rem] px-3.5 py-2.5 text-[0.92rem] font-medium transition ${
        active
          ? "bg-accent-soft text-accent"
          : "text-ink-muted hover:bg-cream-sunk hover:text-navy"
      }`}
    >
      <Icon
        size={21}
        weight={active ? "duotone" : "regular"}
        className={active ? "text-accent" : "text-ink-faint group-hover:text-navy"}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/* Pestaña horizontal compacta (barra superior móvil/tablet) */
function StripItem({ href, label, Icon, pathname }) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent-soft text-accent"
          : "bg-cream-card text-ink-muted ring-1 ring-inset ring-hairline"
      }`}
    >
      <Icon size={17} weight={active ? "duotone" : "regular"} />
      {label}
    </Link>
  );
}

function ProfileButton({ compact = false, onOpen }) {
  const { profile } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const childName = mounted ? profile.childName : "Lucas";
  const condition = mounted ? profile.conditionLabel : "Dermatitis atópica";
  const initial = (childName || "L").trim().charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={
        compact
          ? "flex items-center gap-1.5 rounded-full border border-hairline bg-cream-card py-1 pl-1 pr-2.5 transition active:scale-[0.97]"
          : "flex w-full items-center gap-3 rounded-[1.1rem] border border-hairline bg-cream-card p-2.5 text-left transition hover:border-hairline-strong"
      }
    >
      <span
        className={`flex items-center justify-center rounded-full bg-accent font-bold text-white ${
          compact ? "h-7 w-7 text-xs" : "h-10 w-10 text-sm"
        }`}
      >
        {initial}
      </span>
      {compact ? (
        <>
          <span className="max-w-[4.5rem] truncate text-sm font-medium text-navy">
            {childName}
          </span>
          <CaretDown size={13} weight="bold" className="text-ink-muted" />
        </>
      ) : (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-navy">{childName}</span>
          <span className="block truncate text-xs text-ink-faint">{condition}</span>
        </span>
      )}
      {!compact && <CaretDown size={14} weight="bold" className="shrink-0 text-ink-faint" />}
    </button>
  );
}

/**
 * Shell de la versión WEB: barra lateral de navegación en escritorio + barra
 * superior con tira de pestañas en móvil/tablet. El contenido vive en un área
 * ancha; cada página decide su propio ancho máximo.
 */
export default function WebShell({ children }) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState(false);

  return (
    <div className="lg:pl-[260px]">
      {/* -------- Sidebar (escritorio) -------- */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-hairline bg-cream-card/70 px-5 py-6 backdrop-blur-xl lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-1.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-accent-soft ring-1 ring-inset ring-white/60">
            <Mascot size={28} mood="happy" />
          </span>
          <span className="font-display text-[1.2rem] font-bold tracking-tight text-navy">
            PielCalma
          </span>
        </Link>
        <p className="mt-1 px-1.5 text-[0.72rem] text-ink-faint">Acompañamos cada paso</p>

        <nav className="mt-7 flex flex-col gap-1" aria-label="Navegación principal">
          {PRIMARY.map((it) => (
            <SideItem key={it.href} {...it} pathname={pathname} />
          ))}
        </nav>

        <p className="mb-1.5 mt-7 px-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Más
        </p>
        <nav className="flex flex-col gap-1" aria-label="Navegación secundaria">
          {SECONDARY.map((it) => (
            <SideItem key={it.href} {...it} pathname={pathname} />
          ))}
        </nav>

        <div className="flex-1" />

        <ProfileButton onOpen={() => setSheet(true)} />
        <p className="mt-3 px-1.5 text-[0.68rem] leading-relaxed text-ink-faint">
          No diagnostica · No cambia tratamientos · Sigue el plan de tu doctor.
        </p>
      </aside>

      {/* -------- Barra superior (móvil / tablet) -------- */}
      <header className="no-print safe-top sticky top-0 z-30 border-b border-hairline bg-cream/85 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] bg-accent-soft ring-1 ring-inset ring-white/60">
              <Mascot size={24} mood="happy" />
            </span>
            <span className="font-display text-[1.05rem] font-bold tracking-tight text-navy">
              PielCalma
            </span>
          </Link>
          <ProfileButton compact onOpen={() => setSheet(true)} />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {[...PRIMARY, ...SECONDARY].map((it) => (
            <StripItem key={it.href} {...it} pathname={pathname} />
          ))}
        </div>
      </header>

      {/* -------- Contenido -------- */}
      <main className="min-h-[100dvh] px-5 py-7 lg:px-10 lg:py-10">
        <PageTransition>{children}</PageTransition>
      </main>

      <ProfileSheet open={sheet} onClose={() => setSheet(false)} />
    </div>
  );
}
