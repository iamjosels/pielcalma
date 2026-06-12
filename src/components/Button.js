import Link from "next/link";
import clsx from "clsx";

const styles = {
  primary:
    "bg-gradient-to-r from-accent-lavender to-accent-blue text-white shadow-md hover:shadow-lg hover:brightness-105",
  secondary:
    "border border-lavender bg-white/90 text-slate-700 hover:bg-lavender/30",
  soft: "bg-soft-green/80 text-slate-700 hover:bg-soft-green",
};

export default function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  href,
  ...props
}) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition",
    styles[variant] || styles.primary,
    props.disabled && "cursor-not-allowed opacity-50 hover:brightness-100",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
