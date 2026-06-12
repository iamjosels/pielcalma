import { ShieldCheck } from "lucide-react";

export default function Disclaimer({ className = "" }) {
  return (
    <aside
      className={`mt-auto border-t border-lavender/60 bg-lavender/30 px-4 py-4 text-sm leading-relaxed text-slate-600 ${className}`}
    >
      <div className="mx-auto flex max-w-5xl gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-lavender" />
        <p>
          <strong className="font-semibold text-slate-700">Aviso importante:</strong>{" "}
          PielCalma no diagnostica, no indica tratamientos y no reemplaza al
          dermatólogo. Las observaciones son descriptivas y sirven para
          organizar información entre consultas.
        </p>
      </div>
    </aside>
  );
}
