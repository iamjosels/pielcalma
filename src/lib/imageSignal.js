/**
 * Señal visual simple y honesta desde una imagen (cliente, vía <canvas>).
 * Calcula proporción de "rojez" R/(R+G+B) y brillo medio sobre una versión
 * reducida. Habilita un Índice Visual de Cambio COMPARATIVO Y DESCRIPTIVO,
 * nunca clínico (Opción C permitida por el handoff).
 */

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

export async function computeImageSignal(fileOrUrl) {
  const isFile = typeof fileOrUrl !== "string";
  const url = isFile ? URL.createObjectURL(fileOrUrl) : fileOrUrl;
  try {
    const img = await loadImage(url);
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n += 1;
    }
    r /= n;
    g /= n;
    b /= n;
    const sum = r + g + b || 1;
    return {
      redness: round3(r / sum),
      brightness: round3((0.299 * r + 0.587 * g + 0.114 * b) / 255),
    };
  } finally {
    if (isFile) URL.revokeObjectURL(url);
  }
}
