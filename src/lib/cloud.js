/**
 * Capa de sincronización con Supabase (espejo de la nube).
 * Todo está guardado tras isSupabaseConfigured() + try/catch: si no hay claves
 * o falla la red, las funciones no hacen nada y la app sigue con localStorage.
 * Auth anónima: cada dispositivo obtiene un usuario; RLS protege sus filas.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const MAPPERS = {
  profiles: {
    table: "profiles",
    toRow: (p) => ({
      id: p.id,
      caregiver_name: p.caregiverName,
      child_name: p.childName,
      child_age: p.childAge ?? null,
      condition_label: p.conditionLabel,
      created_at: p.createdAt ?? null,
    }),
    fromRow: (r) => ({
      id: r.id,
      caregiverName: r.caregiver_name,
      childName: r.child_name,
      childAge: r.child_age,
      conditionLabel: r.condition_label,
      createdAt: Number(r.created_at) || 0,
    }),
  },
  logs: {
    table: "flare_logs",
    toRow: (l) => ({
      id: l.id,
      profile_id: l.profileId,
      date: l.date,
      itch_level: l.itchLevel,
      sleep_quality: l.sleepQuality,
      routine_status: l.routineStatus,
      caregiver_emotion: l.caregiverEmotion,
      nutrition: l.nutrition ?? null,
      physical_activity: l.physicalActivity ?? null,
      stress: l.stress ?? null,
      areas: l.areas || [],
      triggers: l.triggers || [],
      notes: l.notes || "",
      created_at: l.createdAt ?? null,
    }),
    fromRow: (r) => ({
      id: r.id,
      profileId: r.profile_id,
      date: r.date,
      itchLevel: r.itch_level,
      sleepQuality: r.sleep_quality,
      routineStatus: r.routine_status,
      caregiverEmotion: r.caregiver_emotion,
      nutrition: r.nutrition ?? "equilibrada",
      physicalActivity: r.physical_activity ?? "tranquila",
      stress: r.stress ?? "calmado",
      areas: r.areas || [],
      triggers: r.triggers || [],
      notes: r.notes || "",
      createdAt: Number(r.created_at) || 0,
    }),
  },
  observations: {
    table: "observations",
    toRow: (o) => ({
      id: o.id,
      profile_id: o.profileId,
      date: o.date,
      image_name: o.imageName,
      redness: o.redness,
      brightness: o.brightness,
      thumb: o.thumb || null,
      observacion_visual: o.observacionVisual,
      comparacion_anterior: o.comparacionAnterior,
      indice_visual_cambio: o.indiceVisualCambio,
      limitaciones: o.limitaciones,
      created_at: o.createdAt ?? null,
    }),
    fromRow: (r) => ({
      id: r.id,
      profileId: r.profile_id,
      date: r.date,
      imageName: r.image_name,
      redness: r.redness,
      brightness: r.brightness,
      thumb: r.thumb || null,
      observacionVisual: r.observacion_visual,
      comparacionAnterior: r.comparacion_anterior,
      indiceVisualCambio: r.indice_visual_cambio,
      limitaciones: r.limitaciones,
      createdAt: Number(r.created_at) || 0,
    }),
  },
  calmaEvents: {
    table: "calma_events",
    toRow: (c) => ({
      id: c.id,
      profile_id: c.profileId,
      emotion: c.emotion,
      date: c.date,
      created_at: c.createdAt ?? null,
    }),
    fromRow: (r) => ({
      id: r.id,
      profileId: r.profile_id,
      emotion: r.emotion,
      date: r.date,
      createdAt: Number(r.created_at) || 0,
    }),
  },
};

export async function ensureAuth() {
  if (!isSupabaseConfigured()) return null;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) return session.user.id;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return data.user?.id || null;
  } catch {
    return null;
  }
}

export async function saveMany(kind, entities) {
  if (!isSupabaseConfigured() || !entities?.length) return;
  try {
    const uid = await ensureAuth();
    if (!uid) return;
    const m = MAPPERS[kind];
    const rows = entities.map((e) => ({ ...m.toRow(e), user_id: uid }));
    await supabase.from(m.table).upsert(rows, { onConflict: "user_id,id" });
  } catch {
    // silencioso: el dato ya está en localStorage.
  }
}

export function save(kind, entity) {
  return saveMany(kind, [entity]);
}

export async function removeProfileData(profileId) {
  if (!isSupabaseConfigured()) return;
  try {
    const uid = await ensureAuth();
    if (!uid) return;
    for (const t of ["flare_logs", "observations", "calma_events"]) {
      await supabase.from(t).delete().eq("user_id", uid).eq("profile_id", profileId);
    }
  } catch {
    // silencioso
  }
}

export async function fetchAll() {
  if (!isSupabaseConfigured()) return null;
  try {
    const uid = await ensureAuth();
    if (!uid) return null;
    const [pr, fl, ob, ce] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("flare_logs").select("*"),
      supabase.from("observations").select("*"),
      supabase.from("calma_events").select("*"),
    ]);
    return {
      profiles: (pr.data || []).map(MAPPERS.profiles.fromRow),
      logs: (fl.data || []).map(MAPPERS.logs.fromRow),
      observations: (ob.data || []).map(MAPPERS.observations.fromRow),
      calmaEvents: (ce.data || []).map(MAPPERS.calmaEvents.fromRow),
    };
  } catch {
    return null;
  }
}
