"use client";

/**
 * Contexto unificado para la IA = resumen agregado + memoria del cuidador.
 * Se pasa a requestAI("assistant"|"report"|"forecast"); los prompts hacen
 * JSON.stringify(context), así "memoria" fluye sin tocar las rutas.
 */
import { buildReportContext } from "@/lib/aggregate";
import { memoryToText } from "@/lib/memory";

export function buildAIContext(logs, observations = [], calmaEvents = []) {
  const ctx = buildReportContext(logs, observations, calmaEvents);
  const memoria = memoryToText();
  return memoria ? { ...ctx, memoria } : ctx;
}
