import { useEffect, useRef, useState } from "react";
import { Board, GameHud, Tile, type GameProps } from "./kit";

const SIZE = 9;
const ROUNDS = 12;

export function Reflex({ onFinish }: GameProps) {
  const [target, setTarget] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<string>("Espera al destello...");
  const [bad, setBad] = useState<number | null>(null);
  const shownAt = useRef(0);
  const times = useRef<number[]>([]);

  useEffect(() => {
    if (round >= ROUNDS) {
      const avg = times.current.length
        ? Math.round(times.current.reduce((a, b) => a + b, 0) / times.current.length)
        : 999;
      onFinish(Math.max(0, 1000 - avg), score);
      return;
    }
    const delay = 500 + Math.random() * 1400;
    const id = setTimeout(() => {
      setTarget(Math.floor(Math.random() * SIZE));
      shownAt.current = performance.now();
    }, delay);
    return () => clearTimeout(id);
  }, [round]);

  function hit(i: number) {
    if (target === null) {
      setBad(i);
      setLast("¡Demasiado pronto! -20");
      setScore((s) => Math.max(0, s - 20));
      setTimeout(() => setBad(null), 200);
      return;
    }
    if (i !== target) {
      setLast("Casilla equivocada -10");
      setScore((s) => Math.max(0, s - 10));
      return;
    }
    const ms = Math.round(performance.now() - shownAt.current);
    times.current.push(ms);
    const gain = Math.max(10, 420 - Math.round(ms / 2));
    setScore((s) => s + gain);
    setLast(`${ms} ms · +${gain}`);
    setTarget(null);
    setRound((r) => r + 1);
  }

  return (
    <>
      <GameHud score={score} hint={`Ronda ${Math.min(round + 1, ROUNDS)} / ${ROUNDS}`} />
      <Board>
        <p className="font-display text-2xl font-extrabold">{last}</p>
        <div className="grid w-full max-w-sm grid-cols-3 gap-3">
          {Array.from({ length: SIZE }).map((_, i) => (
            <Tile
              key={i}
              onClick={() => hit(i)}
              state={bad === i ? "bad" : target === i ? "on" : "idle"}
            >
              {target === i ? "⚡" : ""}
            </Tile>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Pulsa la casilla verde en cuanto se ilumine.</p>
      </Board>
    </>
  );
}
