import { useState } from "react";
import { Board, GameHud, useTimer, type GameProps } from "./kit";
import { NeonButton } from "../arcade/ui";

type Puzzle = { seq: number[]; answer: number; options: number[]; rule: string };

function makePuzzle(level: number): Puzzle {
  const kind = Math.floor(Math.random() * 4);
  const start = 1 + Math.floor(Math.random() * (3 + level));
  const step = 2 + Math.floor(Math.random() * (2 + level));
  let seq: number[] = [];
  let rule = "";
  if (kind === 0) {
    seq = [0, 1, 2, 3, 4].map((i) => start + step * i);
    rule = "progresión aritmética";
  } else if (kind === 1) {
    const r = 2 + (level > 3 ? Math.floor(Math.random() * 2) : 0);
    seq = [0, 1, 2, 3, 4].map((i) => start * r ** i);
    rule = "progresión geométrica";
  } else if (kind === 2) {
    seq = [start, start + step];
    for (let i = 2; i < 5; i++) seq.push(seq[i - 1]! + seq[i - 2]!);
    rule = "tipo Fibonacci";
  } else {
    seq = [1, 2, 3, 4, 5].map((i) => i * i + start);
    rule = "cuadrados desplazados";
  }
  const answer = seq[4]!;
  const shown = seq.slice(0, 4);
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const off = 1 + Math.floor(Math.random() * Math.max(3, Math.round(answer * 0.25)));
    set.add(Math.random() > 0.5 ? answer + off : Math.max(0, answer - off));
  }
  return { seq: shown, answer, options: [...set].sort(() => Math.random() - 0.5), rule };
}

export function LogicSeries({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [level, setLevel] = useState(1);
  const [p, setP] = useState<Puzzle>(() => makePuzzle(1));
  const [msg, setMsg] = useState("¿Qué número continúa la serie?");
  const [done, setDone] = useState(false);
  const time = useTimer(75, () => {
    setDone(true);
    onFinish(solved, score);
  }, !done);

  function answer(v: number) {
    if (done) return;
    if (v === p.answer) {
      setScore((s) => s + 120 + level * 25);
      setSolved((s) => s + 1);
      setLevel((l) => l + 1);
      setMsg(`¡Correcto! Era una ${p.rule}.`);
      setP(makePuzzle(level + 1));
    } else {
      setScore((s) => Math.max(0, s - 40));
      setMsg("No es correcto, piénsalo otra vez.");
    }
  }

  return (
    <>
      <GameHud score={score} time={time} total={75} />
      <Board>
        <p className="text-sm font-semibold text-muted-foreground">{msg}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {p.seq.map((n, i) => (
            <span
              key={i}
              className="grid h-16 w-16 place-items-center rounded-xl bg-surface-2 font-display text-2xl font-extrabold"
            >
              {n}
            </span>
          ))}
          <span className="grid h-16 w-16 place-items-center rounded-xl border-2 border-dashed border-primary font-display text-2xl font-extrabold text-primary">
            ?
          </span>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {p.options.map((o) => (
            <NeonButton key={o} tone="surface" size="lg" onClick={() => answer(o)}>
              {o}
            </NeonButton>
          ))}
        </div>
      </Board>
    </>
  );
}
