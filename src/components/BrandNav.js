import Link from "next/link";

export default function BrandNav({ active = "" }) {
  const links = [
    { href: "/calma", label: "Modo Calma", key: "calma" },
    { href: "/registro", label: "Registro", key: "registro" },
    { href: "/observador", label: "Observador", key: "observador" },
    { href: "/reporte", label: "Reporte", key: "reporte" },
  ];

  return (
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
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={
                active === link.key
                  ? "font-black text-[#6B5BD6]"
                  : "transition hover:text-[#6B5BD6]"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/calma"
          className="rounded-full bg-[#25324B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1D273B]"
        >
          Modo Calma
        </Link>
      </div>
    </nav>
  );
}