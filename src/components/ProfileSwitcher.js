"use client";

import { useEffect, useState } from "react";
import { useStore, setActiveProfile, addProfile } from "@/lib/store";
import { UsersThree, CaretDown, Check, UserPlus, X } from "@/components/icons";

export default function ProfileSwitcher() {
  const { state, profile } = useStore();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");

  useEffect(() => setMounted(true), []);

  const label = mounted ? profile.childName : "Lucas";
  const profiles = mounted ? state.profiles : [];

  function choose(id) {
    setActiveProfile(id);
    setOpen(false);
  }

  function create(e) {
    e.preventDefault();
    if (!childName.trim()) return;
    addProfile({ childName: childName.trim(), childAge });
    setChildName("");
    setChildAge("");
    setAdding(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-hairline bg-cream-card px-3.5 py-2 text-sm font-medium text-navy transition hover:border-accent/45 active:scale-[0.98]"
      >
        <UsersThree size={18} weight="duotone" className="text-accent" />
        <span className="max-w-[8rem] truncate">{label}</span>
        <CaretDown size={14} weight="bold" className="text-ink-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-64 rounded-[1.25rem] border border-hairline bg-cream-card p-2 shadow-[var(--shadow-lift)]"
          >
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-faint">
              Perfil activo
            </p>
            <div className="flex flex-col">
              {profiles.map((p) => {
                const active = p.id === profile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => choose(p.id)}
                    role="menuitem"
                    className={`flex items-center justify-between gap-2 rounded-[0.9rem] px-3 py-2.5 text-left text-sm transition ${
                      active ? "bg-accent-soft text-navy" : "text-ink-muted hover:bg-cream"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy">
                        {p.childName}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {p.childAge ? `${p.childAge} años · ` : ""}
                        {p.conditionLabel}
                      </span>
                    </span>
                    {active && <Check size={16} weight="bold" className="shrink-0 text-accent" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 border-t border-hairline pt-1">
              {adding ? (
                <form onSubmit={create} className="flex flex-col gap-2 p-2">
                  <input
                    autoFocus
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Nombre del niño/a"
                    className="w-full rounded-[0.8rem] border border-hairline-strong bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-accent"
                  />
                  <input
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    placeholder="Edad (opcional)"
                    className="w-full rounded-[0.8rem] border border-hairline-strong bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-accent"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-press active:scale-[0.98]"
                    >
                      Crear perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdding(false)}
                      className="rounded-full px-3 py-2 text-ink-muted transition hover:text-navy"
                      aria-label="Cancelar"
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex w-full items-center gap-2 rounded-[0.9rem] px-3 py-2.5 text-left text-sm font-medium text-accent transition hover:bg-cream"
                >
                  <UserPlus size={18} weight="bold" />
                  Añadir perfil
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
