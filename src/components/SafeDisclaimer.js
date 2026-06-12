import { ShieldCheck } from "@/components/icons";

export default function SafeDisclaimer({ compact = false }) {
  return (
    <div
      className={`flex gap-3 rounded-[1.5rem] border border-hairline bg-cream-card ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wash-green">
        <ShieldCheck size={18} weight="duotone" className="text-navy" />
      </span>
      <p
        className={`${compact ? "text-xs" : "text-sm"} leading-relaxed text-ink-muted`}
      >
        <strong className="font-semibold text-navy">Nota importante:</strong>{" "}
        PielCalma no diagnostica, no indica tratamientos y no reemplaza al
        dermatólogo. Las observaciones son descriptivas y sirven para organizar
        información entre consultas.
      </p>
    </div>
  );
}
