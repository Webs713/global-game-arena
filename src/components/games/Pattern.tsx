import { useCallback, useEffect, useRef, useState } from "react";
import { Board, GameHud, type GameProps } from "./kit";
import { cn } from "@/lib/utils";

const PADS = [
  { color: "bg-primary", icon: "▲" },
  { color: "bg-accent", icon: "●" },
  { color: "bg-cyan", icon: "■" },
  { color: "bg-gold", icon: "◆" },
];

export function Pattern({ onFinish }: GameProps) {
  const [seq, setSeq] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [phase, setPhase] = useState<"show" | "input" | "over">("show");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const timers = useRef<number[]>([]);

  const play = useCallback((s: number[]) => {
    setPhase("show");
    timers.current.forEach(clearTimeout);
    timers.current = [];
    s.forEach((p, i) => {
      timers.current.push(
        window.setTimeout(() => setFlash(p), 600 + i * 620),
        window.setTimeout(() => setFlash(null), 600 + i * 620 + 380),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setIdx(0);
        setPhase("input");
      }, 600 + s.length * 620),
    );
  }, []);

  useEffect(() => {
    const first = [Math.floor(Math.random() * 4)];
    setSeq(first);
    play(first);
    return () => timers.current.forEach(clearTimeout);
  }, [play]);

  function press(p: number) {
    if (phase !== "input") return;
    setFlash(p);
    setTimeout(() => setFlash(null), 160);
    if (seq[idx] !== p) {
      setPhase("over");
      setTimeout(() => onFinish(seq.length - 1, score), 700);
      return;
    }
    if (idx + 1 === seq.length) {
      const gain = 40 * seq.length;
      setScore((s) => s + gain);
      const next = [...seq, Math.floor(Math.random() * 4)];
      setSeq(next);
      setTimeout(() => play(next), 700);
    } else {
      setIdx(idx + 1);
    }
  }

  return (
    <>
      <GameHud score={score} hint={`Secuencia de ${seq.length}`} />
      <Board>
        <p className="font-display text-xl font-extrabold">
          {phase === "show" ? "Observa la secuencia" : phase === "input" ? "Repítela" : "¡Fallaste!"}
        </p>
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          {PADS.map((pad, i) => (
            <button
              key={i}
              onClick={() => press(i)}
              className={cn(
                "grid aspect-square place-items-center rounded-2xl text-4xl transition-all duration-150 active:scale-95",
                pad.color,
                flash === i ? "opacity-100 brightness-125 scale-[1.03]" : "opacity-35",
              )}
              style={{ color: "var(--background)" }}
            >
              {pad.icon}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">La secuencia crece con cada acierto.</p>
      </Board>
    </>
  );
}
