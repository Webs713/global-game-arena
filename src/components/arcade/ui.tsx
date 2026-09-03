import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NeonButton({
  children,
  className,
  size = "md",
  tone = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "primary" | "accent" | "ghost" | "surface";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-display font-extrabold uppercase tracking-wide transition-transform active:scale-95 disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        size === "xl" && "px-10 py-5 text-xl sm:text-2xl",
        tone === "primary" &&
          "bg-primary text-primary-foreground shadow-[var(--shadow-neon)] hover:brightness-110",
        tone === "accent" && "bg-accent text-accent-foreground hover:brightness-110",
        tone === "surface" && "bg-surface-2 text-foreground border border-border hover:bg-secondary",
        tone === "ghost" && "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel p-5", className)}>{children}</div>;
}

export function StatChip({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: ReactNode;
  tone?: "default" | "primary" | "accent" | "gold" | "cyan";
}) {
  return (
    <div className="panel flex items-center gap-3 px-4 py-3">
      <span className="text-2xl">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "font-display text-xl font-extrabold leading-tight",
            tone === "primary" && "text-primary",
            tone === "accent" && "text-accent",
            tone === "gold" && "text-gold",
            tone === "cyan" && "text-cyan",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && (
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{kicker}</div>
        )}
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="shrink-0 text-sm font-bold uppercase tracking-wide text-primary hover:underline"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: "var(--gradient-primary)" }}
      />
    </div>
  );
}
