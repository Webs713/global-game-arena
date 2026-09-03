import { useMemo, useState } from "react";
import { Board, GameHud, type GameProps } from "./kit";
import { cn } from "@/lib/utils";

const ROWS = 6;
const COLS = 5;

type Cell = { value: number; trap: boolean };

function makeGrid(): Cell[][] {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, () => ({
      value: 5 + Math.floor(Math.random() * (10 + r * 6)),
      trap: Math.random() < 0.16,
    })),
  );
}

/** Strategy: climb the tower picking one cell per row, adjacent columns only. */
export function LootPath({ onFinish }: GameProps) {
  const [grid, setGrid] = useState<Cell[][]>(makeGrid);
  const [row, setRow] = useState(ROWS - 1);
  const [col, setCol] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(2);
  const [msg, setMsg] = useState("Sube desde abajo. Solo puedes avanzar a columnas contiguas.");
  const [over, setOver] = useState(false);

  const allowed = useMemo(() => {
    if (col === null) return Array.from({ length: COLS }, (_, i) => i);
    return [col - 1, col, col + 1].filter((c) => c >= 0 && c < COLS);
  }, [col]);

  function step(r: number, c: number) {
    if (over || r !== row || !allowed.includes(c)) return;
    const cell = grid[r]![c]!;
    if (cell.trap) {
      const l = lives - 1;
      setLives(l);
      setScore((s) => Math.max(0, s - 60));
      setMsg("💥 ¡Trampa! Pierdes una vida.");
      if (l <= 0) {
        setOver(true);
        setTimeout(() => onFinish(ROWS - 1 - r, score), 800);
        return;
      }
    } else {
      setScore((s) => s + cell.value * 8);
      setMsg(`+${cell.value * 8} de botín`);
    }
    setCol(c);
    if (r === 0) {
      setOver(true);
      const bonus = 200 + lives * 150;
      setScore((s) => s + bonus);
      setMsg(`🏁 ¡Cima alcanzada! Bonus +${bonus}`);
      setTimeout(() => onFinish(ROWS, score + bonus), 900);
      return;
    }
    setRow(r - 1);
    setGrid((g) => g.map((rr) => rr.map((cc) => cc)));
  }

  return (
    <>
      <GameHud score={score} hint={`Fila ${ROWS - row} / ${ROWS} · ❤️ ${lives}`} />
      <Board>
        <p className="text-sm font-semibold text-muted-foreground">{msg}</p>
        <div className="grid w-full max-w-sm gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((r, ri) =>
            r.map((cell, ci) => {
              const active = ri === row && allowed.includes(ci) && !over;
              const passed = ri > row;
              return (
                <button
                  key={`${ri}-${ci}`}
                  onClick={() => step(ri, ci)}
                  disabled={!active}
                  className={cn(
                    "grid aspect-square place-items-center rounded-lg border text-sm font-extrabold transition-all",
                    active && "border-primary bg-primary/15 text-primary hover:bg-primary/25",
                    !active && !passed && "border-border bg-surface-2 text-muted-foreground/40",
                    passed && "border-transparent bg-secondary text-muted-foreground",
                  )}
                >
                  {passed || active ? (cell.trap && passed ? "💥" : cell.value) : "?"}
                </button>
              );
            }),
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Los valores altos rinden más, pero un 16% de casillas esconde trampas.
        </p>
      </Board>
    </>
  );
}
