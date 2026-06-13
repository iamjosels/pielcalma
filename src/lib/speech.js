"use client";

/**
 * Voz con Azure Cognitive Services Speech (SDK, import dinámico, solo cliente).
 * - STT (recognizeOnce): el micrófono → texto, con detección de silencio.
 * - TTS (speakText): texto → voz hablada por el altavoz (modo conversación).
 * El recurso de AI Services es multiservicio, así que la MISMA key de OpenAI
 * sirve para Speech (región eastus). Claves NEXT_PUBLIC_* (embebidas en el APK).
 * Si no hay credenciales o falla, el llamador cae a dictado/sin voz.
 */
const KEY = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || "";
const REGION = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || "";

// Voz peruana cálida por defecto (es-PE). Cambiable por perfil más adelante.
export const DEFAULT_VOICE = "es-PE-CamilaNeural";

export function isSpeechConfigured() {
  return Boolean(KEY && REGION);
}

let _SDK = null;
async function loadSDK() {
  if (!_SDK) _SDK = await import("microsoft-cognitiveservices-speech-sdk");
  return _SDK;
}

// --- Reconocimiento (micrófono → texto) ---------------------------------
let _recognizer = null;

/**
 * Reconoce una frase del micrófono (es-PE). Se detiene solo al callar.
 * Devuelve el texto (o "" si no hubo match). Lanza si se cancela/falla.
 */
export async function recognizeOnce(lang = "es-PE") {
  if (!isSpeechConfigured()) throw new Error("speech-not-configured");
  const SDK = await loadSDK();
  const speechConfig = SDK.SpeechConfig.fromSubscription(KEY, REGION);
  speechConfig.speechRecognitionLanguage = lang;
  const audioConfig = SDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SDK.SpeechRecognizer(speechConfig, audioConfig);
  _recognizer = recognizer;
  try {
    const text = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === SDK.ResultReason.RecognizedSpeech) resolve(result.text || "");
          else if (result.reason === SDK.ResultReason.NoMatch) resolve("");
          else reject(new Error("speech-canceled"));
        },
        (err) => reject(err instanceof Error ? err : new Error(String(err)))
      );
    });
    return text;
  } finally {
    try { recognizer.close(); } catch {}
    if (_recognizer === recognizer) _recognizer = null;
  }
}

/** Aborta una escucha en curso (al cerrar el modo conversación). */
export function cancelListening() {
  if (_recognizer) {
    try { _recognizer.close(); } catch {}
    _recognizer = null;
  }
}

// --- Síntesis (texto → voz por el altavoz) ------------------------------
let _synth = null;

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Habla un texto en voz alta (es-PE). Resuelve cuando termina de hablar.
 * Usa SSML con un ritmo ligeramente más calmado (voz más clara y cálida) y la
 * salida de altavoz por defecto del SDK (Web Audio), que funciona en navegador
 * y en la WebView del APK sin problemas de CORS.
 */
export async function speakText(text, voice = DEFAULT_VOICE) {
  if (!isSpeechConfigured()) throw new Error("speech-not-configured");
  if (!text || !text.trim()) return;
  stopSpeaking(); // corta cualquier voz previa (barge-in)
  const SDK = await loadSDK();
  const speechConfig = SDK.SpeechConfig.fromSubscription(KEY, REGION);
  speechConfig.speechSynthesisVoiceName = voice;
  const synth = new SDK.SpeechSynthesizer(speechConfig);
  _synth = synth;
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-PE">` +
    `<voice name="${voice}"><prosody rate="-4%" pitch="+2%">${escapeXml(text)}</prosody></voice></speak>`;
  try {
    await new Promise((resolve, reject) => {
      synth.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.reason === SDK.ResultReason.SynthesizingAudioCompleted) resolve();
          else resolve(); // cancelada → resolver en silencio
        },
        (err) => reject(err instanceof Error ? err : new Error(String(err)))
      );
    });
  } finally {
    try { synth.close(); } catch {}
    if (_synth === synth) _synth = null;
  }
}

/** Detiene la voz en curso. */
export function stopSpeaking() {
  if (_synth) {
    try { _synth.close(); } catch {}
    _synth = null;
  }
}

/** Corta micrófono y voz (limpieza al cerrar). */
export function stopAllSpeech() {
  cancelListening();
  stopSpeaking();
}
