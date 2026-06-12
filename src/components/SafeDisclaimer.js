export default function SafeDisclaimer({ compact = false }) {
  return (
    <div
      className={`rounded-[1.5rem] border border-[#F0DFCA] bg-[#FFFCF7] shadow-sm ${
        compact ? "p-4 text-xs" : "p-5 text-sm"
      } text-[#625A70]`}
    >
      <strong className="text-[#25324B]">Nota importante:</strong> PielCalma no
      diagnostica, no indica tratamientos y no reemplaza al dermatólogo. Las
      observaciones son descriptivas y sirven para organizar información entre
      consultas.
    </div>
  );
}