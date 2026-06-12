"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

const SPRING = { type: "spring", stiffness: 100, damping: 20 };
const MotionLink = motion.create(Link);

/* ----------------------------------------------------------------
   Reveal — fade + rise al entrar al viewport (una sola vez).
---------------------------------------------------------------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  as = "div",
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------
   Stagger — cascada secuencial. Parent + Item en el mismo árbol cliente.
---------------------------------------------------------------- */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

export function Stagger({ children, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------
   Magnetic — atracción sutil hacia el cursor (motion values, sin useState).
---------------------------------------------------------------- */
export function Magnetic({ children, className = "", strength = 0.3 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  function handleMove(e) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------------------------------------------
   TactileButton — botón/Link con feedback físico en :active.
---------------------------------------------------------------- */
const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-55";
const BTN_VARIANTS = {
  primary:
    "bg-accent text-white hover:bg-accent-press shadow-[var(--shadow-soft)]",
  navy: "bg-navy text-white hover:bg-navy-press shadow-[var(--shadow-soft)]",
  secondary:
    "border border-hairline-strong bg-cream-card text-navy hover:border-accent/45 hover:text-accent",
  ghost: "text-navy hover:text-accent",
};
const TAP = {
  whileTap: { scale: 0.97 },
  whileHover: { y: -1 },
  transition: { type: "spring", stiffness: 400, damping: 26 },
};

export function TactileButton({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}) {
  const cls = `${BTN_BASE} ${BTN_VARIANTS[variant] || BTN_VARIANTS.primary} ${className}`;
  if (href) {
    return (
      <MotionLink href={href} className={cls} {...TAP} {...rest}>
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button className={cls} {...TAP} {...rest}>
      {children}
    </motion.button>
  );
}

/* ----------------------------------------------------------------
   Skeleton — placeholder con barrido de luz que respeta el layout.
---------------------------------------------------------------- */
export function Skeleton({ className = "" }) {
  return (
    <div className={`pc-skeleton rounded-2xl ${className}`} aria-hidden="true" />
  );
}
