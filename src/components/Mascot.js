/**
 * Mascota PielCalma — robot verde amable (SVG inline, sin deps).
 * Usa los tokens de color del tema, así re-skinea solo.
 * mood cambia solo ojos/boca; nunca es alarmante (línea ética: calma).
 *
 * <Mascot size={96} mood="happy" />   mood: "happy" | "neutral" | "concern"
 */
export default function Mascot({ size = 96, mood = "happy", className = "", title }) {
  const accent = "var(--accent)";
  const soft = "var(--accent-soft)";
  const dark = "var(--navy)";
  const ink = "var(--ink)";
  const leaf = "#7fcfae";
  const cheek = "var(--coral)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      {/* Antena de hoja (motivo de marca) */}
      <path
        d="M60 22 V12"
        stroke={dark}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M60 13 C66 5, 78 6, 80 2 C82 9, 75 17, 60 16 Z"
        fill={leaf}
      />

      {/* Orejas / sensores laterales */}
      <rect x="14" y="48" width="9" height="22" rx="4.5" fill={accent} />
      <rect x="97" y="48" width="9" height="22" rx="4.5" fill={accent} />

      {/* Cabeza / cuerpo */}
      <rect x="22" y="22" width="76" height="74" rx="30" fill={accent} />
      {/* Brillo especular suave */}
      <ellipse cx="44" cy="44" rx="13" ry="9" fill="#ffffff" opacity="0.22" />

      {/* Visor / cara */}
      <rect x="32" y="40" width="56" height="42" rx="21" fill={dark} />

      {/* Ojos */}
      <Eyes mood={mood} ink="#ffffff" />

      {/* Boca */}
      <Mouth mood={mood} color="#ffffff" />

      {/* Mejillas (solo happy) */}
      {mood === "happy" && (
        <>
          <circle cx="40" cy="72" r="3.4" fill={cheek} opacity="0.8" />
          <circle cx="80" cy="72" r="3.4" fill={cheek} opacity="0.8" />
        </>
      )}

      {/* Panza / base */}
      <rect x="36" y="92" width="48" height="16" rx="8" fill={soft} />
      <circle cx="60" cy="100" r="3.4" fill={accent} />
    </svg>
  );
}

function Eyes({ mood, ink }) {
  // concern: pupilas un poco más arriba + cejas suaves (preocupación tierna)
  const cy = mood === "concern" ? 56 : 58;
  return (
    <>
      {/* blancos de ojo */}
      <rect x="42" y="50" width="13" height="16" rx="6.5" fill={ink} />
      <rect x="65" y="50" width="13" height="16" rx="6.5" fill={ink} />
      {/* pupilas */}
      <circle cx="48.5" cy={cy} r="3.2" fill="var(--navy)" />
      <circle cx="71.5" cy={cy} r="3.2" fill="var(--navy)" />
      {mood === "concern" && (
        <>
          <path d="M43 47 L54 49.5" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M77 47 L66 49.5" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
    </>
  );
}

function Mouth({ mood, color }) {
  if (mood === "happy") {
    return (
      <path
        d="M50 73 Q60 81 70 73"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (mood === "concern") {
    return (
      <path
        d="M52 76 Q60 72 68 76"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  // neutral
  return (
    <path d="M52 75 H68" stroke={color} strokeWidth="3" strokeLinecap="round" />
  );
}
