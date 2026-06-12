"use client";

import { useEffect } from "react";
import { ensureDemoSeed } from "@/lib/store";

/**
 * Precarga el perfil de demo en la primera visita (una sola vez).
 * No renderiza nada.
 */
export default function DemoBootstrap() {
  useEffect(() => {
    ensureDemoSeed();
  }, []);
  return null;
}
