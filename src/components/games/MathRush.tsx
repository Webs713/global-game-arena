import { useMemo, useState } from "react";
import { Board, GameHud, useTimer, type GameProps } from "./kit";
import { NeonButton } from "../arcade/ui";


type Q = { text: string; answer: number; options: number[] };

function makeQ(level: number): Q {
  const ops = level > 3 ? ["+", "-", "×"] : ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const cap = 8 + level * 5;
  let a = 2 + Math.floor(Math.random() * cap);
  let b = 2 + Math.floor(Math.random() * cap);
  if (op === "×") {
    a = 2 + Math.floor(Math.random() * (4 + level));
    b = 2 + Math.floor(Math.random() * (4 + level));
  }
  if (op === "-" && b > a) [a, b] = [b, a];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = Math.max(1, Math.round(answer * 0.2));
    set.add(answer + (Math.floor(Math.random() * (delta * 4)) - delta * 2 || 1));
  }
  return {
    text: `${a} ${op} ${b}`,
    answer,
    options: [...set].sort(() => Math.random() - 0.5),
  };
}

export function MathRush({ onFinish }: GameProps) {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState<Q>(() => makeQ(1));
  const [feedback, setFeedback] = useState<"none" | "good" | "bad">("none");
  const [done, setDone] = useState(false);
  const time = useTimer(60, () => {
    setDone(true);
    onFinish(correct, score);
  }, !done);
  const level = useMemo(() => 1 + Math.floor(correct / 4), [correct]);

  function answer(v: number) {
    if (done) return;
    if (v === q.answer) {
      const gain = 60 + streak * 15;
      setScore((s) => s + gain);
      setStreak((s) => s + 1);
      setCorrect((c) => c + 1);
      setFeedback("good");
    } else {
      setStreak(0);
      setScore((s) => Math.max(0, s - 25));
      setFeedback("bad");
    }
    setTimeout(() => setFeedback("none"), 150);
    setQ(makeQ(level));
  }

  return (
    <>
      <GameHud score={score} time={time} total={60} />
      <Board className={feedback === "bad" ? "border-destructive" : ""}>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Combo x{streak} · {correct} aciertos
        </div>
        <p className="font-display text-5xl font-extrabold sm:text-6xl">{q.text}</p>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {q.options.map((o) => (
            <NeonButton key={o} tone="surface" size="lg" onClick={() => answer(o)}>
              {o}
            </NeonButton>
          ))}
        </div>
      </Board>
    </>
  );
}
