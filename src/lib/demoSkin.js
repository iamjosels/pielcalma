/**
 * Muestras de piel SINTÉTICAS para la demo (cliente, vía <canvas>).
 * No son fotos reales: se dibujan tonos de piel + una zona rojiza con ruido,
 * para mostrar el flujo del Observador sin usar imágenes de pacientes.
 * Variantes con distinta "rojez" para poder narrar antes/después.
 */

const VARIANTS = {
  marcada: { base: ["#efcbb0", "#e0ae8e"], red: 0.55, label: "Brote" },
  leve: { base: ["#f0d2ba", "#e6bd9d"], red: 0.3, label: "Intermedio" },
  calma: { base: ["#f3dcc7", "#ecccb2"], red: 0.1, label: "Calmada" },
};

export const SKIN_VARIANTS = Object.keys(VARIANTS);

function rand(seed) {
  // PRNG simple determinista por variante (resultados estables en la demo).
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export async function makeSkinSample(variant = "leve") {
  const cfg = VARIANTS[variant] || VARIANTS.leve;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rnd = rand(variant.length * 97 + 13);

  // Base de piel con gradiente radial.
  const grad = ctx.createRadialGradient(size * 0.45, size * 0.4, size * 0.1, size / 2, size / 2, size * 0.75);
  grad.addColorStop(0, cfg.base[0]);
  grad.addColorStop(1, cfg.base[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Zona rojiza (varias manchas suaves superpuestas).
  const cx = size * (0.42 + rnd() * 0.16);
  const cy = size * (0.42 + rnd() * 0.16);
  for (let i = 0; i < 7; i++) {
    const r = size * (0.10 + rnd() * 0.16);
    const ox = cx + (rnd() - 0.5) * size * 0.22;
    const oy = cy + (rnd() - 0.5) * size * 0.22;
    const a = cfg.red * (0.18 + rnd() * 0.22);
    const rg = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
    rg.addColorStop(0, `rgba(196,70,58,${a})`);
    rg.addColorStop(1, "rgba(196,70,58,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ruido/textura sutil.
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 16;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  // Pequeñas motas de resequedad aparente.
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,250,245,${0.05 + rnd() * 0.08})`;
    ctx.beginPath();
    ctx.arc(rnd() * size, rnd() * size, 1 + rnd() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.9));
  const file = new File([blob], `demo-${variant}.jpg`, { type: "image/jpeg" });
  return { file, dataUrl, label: cfg.label, variant };
}
