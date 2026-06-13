"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Revela el texto progresivamente (efecto "escribiendo") al montarse, con un
 * cursor parpadeante. La duración es ~constante (paso dinámico) para que las
 * respuestas largas no se eternicen. Respeta prefers-reduced-motion.
 */
export default function TypewriterText({ text = "", className = "", onTick }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (reduce) {
      setN(text.length);
      return;
    }
    const total = text.length;
    setN(0);
    if (!total) return;
    const step = Math.max(1, Math.ceil(total / 90)); // ~90 ticks → ~1.4s
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(total, i + step);
      setN(i);
      onTickRef.current?.();
      if (i >= total) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [text, reduce]);

  const done = n >= text.length;
  return (
    <span className={className}>
      {text.slice(0, n)}
      {!done && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[1px] animate-pulse rounded-full bg-accent align-middle" />
      )}
    </span>
  );
}
