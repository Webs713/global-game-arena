import { useState } from "react";
import { Board, GameHud, useTimer, type GameProps } from "./kit";
import { cn } from "@/lib/utils";

const SETS = [
  ["🍎", "🍏"],
  ["😀", "😃"],
  ["★", "☆"],
  ["🐶", "🐕"],
  ["◼", "◾"],
  ["🔵", "🔷"],
  ["🅑", "🅱"],
  ["ǀ", "l"],
];

function makeRound(level: number) {
  const size = Math.min(64, 9 + level * 3);
  const cols = Math.ceil(Math.sqrt(size));
  const [base, odd] = SETS[Math.floor(Math.random() * SETS.length)]!;
  return { size: cols * cols, cols, base, odd, index: Math.floor(Math.random() * (cols * cols)) };
}

export function OddOne({ onFinish }: GameProps) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => makeRound(1));
  const [score, setScore] = useState(0);
  const [found, setFound] = useState(0);
  const [done, setDone] = useState(false);
  const time = useTimer(60, () => {
    setDone(true);
    onFinish(found, score);
  }, !done);

  function pick(i: number) {
    if (done) return;
    if (i === round.index) {
      setScore((s) => s + 70 + level * 20);
      setFound((f) => f + 1);
      const next = level + 1;
      setLevel(next);
      setRound(makeRound(next));
    } else {
      setScore((s) => Math.max(0, s - 30));
    }
  }

  return (
    <>
      <GameHud score={score} time={time} total={60} />
      <Board>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Nivel {level} · encuentra el intruso
        </p>
        <div
          className="grid w-full max-w-md gap-1.5"
          style={{ gridTemplateColumns: `repeat(${round.cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: round.size }).map((_, i) => (
            <button
              key={i}
              onClick={() => pick(i)}
              className={cn(
                "grid aspect-square place-items-center rounded-md bg-surface-2 transition-colors hover:bg-secondary",
                round.cols > 6 ? "text-sm" : "text-2xl",
              )}
            >
              {i === round.index ? round.odd : round.base}
            </button>
          ))}
        </div>
      </Board>
    </>
  );
}
