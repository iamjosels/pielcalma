/** Resume el plan del dermatólogo en un texto compacto para el contexto de la IA. */
export function planToText(p) {
  if (!p) return "";
  const parts = [];
  if (p.emoliente) parts.push(`Emoliente: ${p.emoliente}`);
  if (p.bano) parts.push(`Baño: ${p.bano}`);
  if (p.brote) parts.push(`En brote: ${p.brote}`);
  if (p.medicacion) parts.push(`Medicación indicada: ${p.medicacion}`);
  if (p.notas) parts.push(`Notas: ${p.notas}`);
  return parts.join(" | ").slice(0, 700);
}
