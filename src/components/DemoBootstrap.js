"use client";

import { useEffect } from "react";
import { ensureDemoSeed, syncFromCloud } from "@/lib/store";
import { ensurePlanSeed } from "@/lib/plan";

/**
 * Arranque en cliente:
 * 1) sincroniza desde Supabase si está configurado (auth anónima + pull),
 * 2) si tras eso no hay datos, precarga el perfil demo (una sola vez).
 * Si Supabase no está configurado, el paso 1 es no-op y queda solo localStorage.
 */
export default function DemoBootstrap() {
  useEffect(() => {
    let active = true;
    (async () => {
      await syncFromCloud();
      if (active) {
        ensureDemoSeed();
        ensurePlanSeed();
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return null;
}
