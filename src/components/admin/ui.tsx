import Link from "next/link";
import type { ReactNode } from "react";

export function AdminHeader({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="font-hand text-2xl text-roa-300">{kicker}</p>}
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] leading-none text-cream">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={`rounded-3xl border-2 border-cream/10 bg-roa-900 p-5 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-5 font-display text-2xl text-cream">{title}</h2>
      )}
      {children}
    </section>
  );
}

export const inputClass =
  "w-full rounded-xl border-2 border-cream/12 bg-roa-950 px-4 py-2.5 text-cream outline-none transition placeholder:text-cream/25 focus:border-roa-400";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold text-roa-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cream/35">{hint}</span>}
    </label>
  );
}

export function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-cream/12 bg-roa-950 px-4 py-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-[#6d9159]"
      />
      <span className="text-sm font-bold text-cream/80">{label}</span>
    </label>
  );
}

export function Button({
  children,
  variant = "primary",
  type = "submit",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  type?: "submit" | "button";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "border-ink bg-mango text-ink hover:brightness-95",
    ghost: "border-cream/25 text-cream hover:bg-cream/10",
    danger: "border-berry/50 text-berry hover:bg-berry hover:text-cream",
  };
  return (
    <button
      type={type}
      className={`rounded-full border-2 px-5 py-2.5 font-bold transition ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const variants = {
    primary: "border-ink bg-mango text-ink hover:brightness-95",
    ghost: "border-cream/25 text-cream hover:bg-cream/10",
  };
  return (
    <Link
      href={href}
      className={`inline-block rounded-full border-2 px-5 py-2.5 font-bold transition ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "green",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "green" | "mango" | "grape" | "cream";
}) {
  const tones = {
    green: "bg-roa-500 text-cream",
    mango: "bg-mango text-ink",
    grape: "bg-grape text-ink",
    cream: "bg-cream text-ink",
  };
  return (
    <div
      className={`rounded-3xl border-2 border-ink ${tones[tone]} p-5 shadow-[4px_4px_0_var(--color-ink)]`}
    >
      <p className="text-xs font-black uppercase tracking-widest opacity-60">{label}</p>
      <p className="mt-1 font-display text-4xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-sm opacity-65">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-cream/15 py-16 text-center">
      <p className="font-display text-2xl text-cream">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-sm text-sm text-cream/50">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const THEME_OPTIONS = [
  { value: "green", label: "Verde" },
  { value: "cream", label: "Crema" },
  { value: "black", label: "Negro" },
  { value: "purple", label: "Morado" },
];
