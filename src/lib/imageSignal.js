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

function signalFromImageData(data) {
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
    return signalFromImageData(ctx.getImageData(0, 0, size, size).data);
  } finally {
    if (isFile) URL.revokeObjectURL(url);
  }
}

/** Dibuja la imagen escalada (lado mayor = max) en un canvas y devuelve {canvas, w, h}. */
function drawScaled(img, max) {
  const ratio = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, ctx, w, h };
}

/**
 * Prepara una imagen subida para el Observador, decodificándola una sola vez:
 * - redness/brightness: señal para el Índice Visual de Cambio (no clínico).
 * - send:  JPEG (~768px) para enviar al modelo de visión.
 * - thumb: JPEG (~256px) para guardar y mostrar antes/después.
 */
export async function prepareImage(fileOrUrl, { sendMax = 768, thumbMax = 256, quality = 0.82 } = {}) {
  const isFile = typeof fileOrUrl !== "string";
  const url = isFile ? URL.createObjectURL(fileOrUrl) : fileOrUrl;
  try {
    const img = await loadImage(url);

    // Señal sobre 64px (barato y estable).
    const small = drawScaled(img, 64);
    const signal = signalFromImageData(
      small.ctx.getImageData(0, 0, small.canvas.width, small.canvas.height).data
    );

    const send = drawScaled(img, sendMax).canvas.toDataURL("image/jpeg", quality);
    const thumb = drawScaled(img, thumbMax).canvas.toDataURL("image/jpeg", 0.78);

    return { ...signal, send, thumb };
  } finally {
    if (isFile) URL.revokeObjectURL(url);
  }
}
