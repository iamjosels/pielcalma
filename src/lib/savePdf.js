/**
 * Entrega del PDF según plataforma.
 * - Web (navegador): descarga normal (doc.save) / abre para imprimir.
 * - APK (Capacitor/Android WebView): doc.save() y window.open(blob) NO funcionan
 *   (la WebView no tiene gestor de descargas ni navigator.share). Se escribe el
 *   archivo con el plugin Filesystem y se abre/comparte con el plugin Share, a
 *   través del puente global `window.Capacitor.Plugins` (evita imports dinámicos
 *   que fallan en el export estático). La hoja nativa permite Imprimir, Guardar
 *   en Archivos, abrir en un visor, etc.
 */

function isNative() {
  return (
    typeof window !== "undefined" &&
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === "function" &&
    window.Capacitor.isNativePlatform()
  );
}

function pdfToBase64(doc) {
  // doc.output("datauristring") => "data:application/pdf;...;base64,XXXX"
  const uri = doc.output("datauristring");
  const i = uri.indexOf("base64,");
  return i >= 0 ? uri.slice(i + 7) : uri;
}

async function shareNative(doc, filename) {
  const { Filesystem, Share } = window.Capacitor.Plugins;
  const data = pdfToBase64(doc);
  // Directory "CACHE" no requiere permisos; sin `encoding` => escribe binario desde base64.
  await Filesystem.writeFile({ path: filename, data, directory: "CACHE" });
  const { uri } = await Filesystem.getUri({ path: filename, directory: "CACHE" });
  await Share.share({
    title: filename,
    text: "Reporte de PielCalma",
    url: uri,
    dialogTitle: "Compartir o imprimir el reporte",
  });
}

/** Descargar / guardar / compartir el PDF. */
export async function downloadPdf(doc, filename) {
  if (isNative()) {
    await shareNative(doc, filename);
    return;
  }
  doc.save(filename);
}

/** Imprimir el PDF. En nativo abre la hoja de compartir (incluye Imprimir). */
export async function printPdf(doc, filename) {
  if (isNative()) {
    await shareNative(doc, filename);
    return;
  }
  doc.autoPrint();
  const url = doc.output("bloburl");
  const win = window.open(url, "_blank");
  if (!win) doc.save(filename);
}
