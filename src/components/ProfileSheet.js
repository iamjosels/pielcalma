"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useStore, setActiveProfile, addProfile } from "@/lib/store";
import { Check, UserPlus, X } from "@/components/icons";

/**
 * Selector de perfil como bottom sheet móvil (reemplaza el dropdown desktop).
 * Reusa setActiveProfile/addProfile verbatim del store.
 */
export default function ProfileSheet({ open, onClose }) {
  const { state, profile } = useStore();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");

  useEffect(() => setMounted(true), []);

  const profiles = mounted ? state.profiles : [];

  function choose(id) {
    setActiveProfile(id);
    onClose();
  }

  function create(e) {
    e.preventDefault();
    if (!childName.trim()) return;
    addProfile({ childName: childName.trim(), childAge });
    setChildName("");
    setChildAge("");
    setAdding(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-label="Cambiar de perfil"
            className="safe-bottom relative z-10 rounded-t-[var(--radius-card)] border-t border-hairline bg-cream-card px-5 pb-6 pt-3 shadow-[var(--shadow-lift)]"
            initial={reduce ? false : { y: "100%" }}
            animate={reduce ? {} : { y: 0 }}
            exit={reduce ? {} : { y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-hairline-strong" />

            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Perfil activo
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-ink-muted transition hover:text-navy"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {profiles.map((p) => {
                const active = p.id === profile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => choose(p.id)}
                    className={`flex items-center justify-between gap-2 rounded-[1.1rem] px-4 py-3.5 text-left transition active:scale-[0.99] ${
                      active
                        ? "bg-accent-soft"
                        : "bg-cream ring-1 ring-inset ring-hairline"
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
                    {active && (
                      <Check size={18} weight="bold" className="shrink-0 text-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 border-t border-hairline pt-3">
              {adding ? (
                <form onSubmit={create} className="flex flex-col gap-2.5">
                  <input
                    autoFocus
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Nombre del niño/a"
                    className="w-full rounded-[1rem] border border-hairline-strong bg-cream px-4 py-3 text-base text-navy outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft/55"
                  />
                  <input
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    placeholder="Edad (opcional)"
                    className="w-full rounded-[1rem] border border-hairline-strong bg-cream px-4 py-3 text-base text-navy outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft/55"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-press active:scale-[0.98]"
                    >
                      Crear perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdding(false)}
                      className="rounded-full px-4 py-3 text-sm font-medium text-ink-muted transition hover:text-navy"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex w-full items-center gap-2 rounded-[1.1rem] px-4 py-3.5 text-left text-sm font-semibold text-accent transition hover:bg-cream"
                >
                  <UserPlus size={20} weight="bold" />
                  Añadir perfil
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
