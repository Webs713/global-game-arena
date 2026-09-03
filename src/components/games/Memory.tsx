import { useEffect, useState } from "react";
import { Board, GameHud, Tile, type GameProps } from "./kit";

const GRID = 16;

export function Memory({ onFinish }: GameProps) {
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [phase, setPhase] = useState<"show" | "guess" | "over">("show");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  useEffect(() => {
    const count = Math.min(9, 2 + level);
    const set = new Set<number>();
    while (set.size < count) set.add(Math.floor(Math.random() * GRID));
    setPattern([...set]);
    setPicked([]);
    setPhase("show");
    const id = setTimeout(() => setPhase("guess"), 900 + count * 320);
    return () => clearTimeout(id);
  }, [level]);

  function pick(i: number) {
    if (phase !== "guess" || picked.includes(i)) return;
    const next = [...picked, i];
    setPicked(next);
    if (!pattern.includes(i)) {
      const l = lives - 1;
      setLives(l);
      if (l <= 0) {
        setPhase("over");
        setTimeout(() => onFinish(level, score), 700);
      } else {
        setTimeout(() => setLevel((v) => v), 400);
        setTimeout(() => {
          setPicked([]);
          setPhase("show");
          setTimeout(() => setPhase("guess"), 900);
        }, 700);
      }
      return;
    }
    const found = next.filter((n) => pattern.includes(n)).length;
    setScore((s) => s + 25 * level);
    if (found === pattern.length) {
      setTimeout(() => setLevel((l) => l + 1), 500);
    }
  }

  return (
    <>
      <GameHud score={score} hint={`Nivel ${level} · ❤️ ${lives}`} />
      <Board>
        <p className="font-display text-xl font-extrabold">
          {phase === "show" ? "¡Memoriza!" : phase === "guess" ? "Tu turno" : "Fin"}
        </p>
        <div className="grid w-full max-w-sm grid-cols-4 gap-2.5">
          {Array.from({ length: GRID }).map((_, i) => {
            const reveal = phase === "show" && pattern.includes(i);
            const chosen = picked.includes(i);
            return (
              <Tile
                key={i}
                onClick={() => pick(i)}
                state={
                  reveal || (chosen && pattern.includes(i))
                    ? "on"
                    : chosen
                      ? "bad"
                      : "idle"
                }
              />
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">
          Recuerda las casillas iluminadas y vuelve a marcarlas. 3 fallos y fuera.
        </p>
      </Board>
    </>
  );
}
