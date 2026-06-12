"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/calma", label: "Calma" },
  { href: "/registro", label: "Registro" },
  { href: "/observador", label: "Observador" },
  { href: "/reporte", label: "Reporte" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/60 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender to-calm-blue shadow-sm">
            <Heart className="h-4 w-4 text-accent-lavender" />
          </span>
          <span className="text-lg font-semibold text-slate-800">PielCalma</span>
        </Link>

        <button
          type="button"
          className="rounded-xl p-2 text-slate-600 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <ul
          className={clsx(
            "absolute left-4 right-4 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-2xl border border-lavender/60 bg-white/95 p-2 shadow-lg md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none",
            open ? "flex" : "hidden md:flex"
          )}
        >
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "block rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-gradient-to-r from-lavender to-calm-blue text-slate-800 shadow-sm"
                      : "text-slate-600 hover:bg-white/80"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
