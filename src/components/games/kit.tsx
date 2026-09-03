import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type GameProps = {
  seed: string;
  onFinish: (score: number, points: number) => void;
};

/** Countdown timer in seconds. Calls onEnd once when it reaches 0. */
export function useTimer(seconds: number, onEnd: () => void, active = true) {
  const [left, setLeft] = useState(seconds);
  const ended = useRef(false);
  const cb = useRef(onEnd);
  cb.current = onEnd;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 0.1) {
          if (!ended.current) {
            ended.current = true;
            cb.current();
          }
          clearInterval(id);
          return 0;
        }
        return +(l - 0.1).toFixed(1);
      });
    }, 100);
    return () => clearInterval(id);
  }, [active]);

  return left;
}

export function GameHud({
  time,
  total,
  score,
  hint,
}: {
  time?: number;
  total?: number;
  score: number;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div className="panel px-4 py-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Puntos
        </div>
        <div className="font-display text-xl font-extrabold text-primary">{score}</div>
      </div>
      {typeof time === "number" && (
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>{hint ?? "Tiempo"}</span>
            <span className={cn(time < 6 && "text-destructive")}>{time.toFixed(1)}s</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-cyan transition-[width] duration-100"
              style={{ width: `${(time / ((total ?? time) || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}
      {typeof time !== "number" && hint && (
        <div className="flex-1 text-sm font-semibold text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

export function Board({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel flex min-h-[340px] flex-col items-center justify-center gap-6 p-6 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Tile({
  children,
  onClick,
  state = "idle",
  className,
  disabled,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  state?: "idle" | "on" | "good" | "bad";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid aspect-square place-items-center rounded-xl border text-2xl font-extrabold transition-all duration-150 active:scale-95",
        state === "idle" && "border-border bg-surface-2 hover:bg-secondary",
        state === "on" && "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-neon)]",
        state === "good" && "border-transparent bg-success text-success-foreground",
        state === "bad" && "border-transparent bg-destructive text-destructive-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
