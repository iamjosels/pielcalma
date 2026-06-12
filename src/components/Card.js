import clsx from "clsx";

export default function Card({
  title,
  subtitle,
  children,
  className,
  hover = false,
  accent = "white",
}) {
  const accents = {
    white: "border-white/80 bg-white/90",
    lavender: "border-lavender bg-lavender/40",
    "calm-blue": "border-calm-blue bg-calm-blue/40",
    "soft-green": "border-soft-green bg-soft-green/40",
  };

  return (
    <section
      className={clsx(
        "rounded-3xl border p-6 shadow-[0_8px_30px_rgba(139,123,184,0.08)] backdrop-blur-sm",
        accents[accent] || accents.white,
        hover &&
          "transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(91,143,185,0.12)]",
        className
      )}
    >
      {title ? (
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      ) : null}
      {subtitle ? (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      ) : null}
      <div className={title || subtitle ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}
