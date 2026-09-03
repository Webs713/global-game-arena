import { useState } from "react";
import { Board, GameHud, useTimer, type GameProps } from "./kit";
import { NeonButton } from "../arcade/ui";

const COLORS = [
  { name: "VERDE", css: "var(--primary)" },
  { name: "ROSA", css: "var(--accent)" },
  { name: "AZUL", css: "var(--cyan)" },
  { name: "ORO", css: "var(--gold)" },
  { name: "ROJO", css: "var(--destructive)" },
];

function makeRound() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)]!;
  const match = Math.random() < 0.5;
  const ink = match ? word : COLORS[Math.floor(Math.random() * COLORS.length)]!;
  return { word, ink, match: word.name === ink.name };
}

export function ColorClash({ onFinish }: GameProps) {
  const [round, setRound] = useState(makeRound);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const time = useTimer(45, () => {
    setDone(true);
    onFinish(hits, score);
  }, !done);

  function answer(yes: boolean) {
    if (done) return;
    if (yes === round.match) {
      setScore((s) => s + 45 + streak * 10);
      setHits((h) => h + 1);
      setStreak((s) => s + 1);
    } else {
      setScore((s) => Math.max(0, s - 30));
      setStreak(0);
    }
    setRound(makeRound());
  }

  return (
    <>
      <GameHud score={score} time={time} total={45} />
      <Board>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          ¿El texto coincide con su color? · combo x{streak}
        </p>
        <p className="font-display text-6xl font-extrabold" style={{ color: round.ink.css }}>
          {round.word.name}
        </p>
        <div className="flex w-full max-w-sm gap-3">
          <NeonButton className="flex-1" size="lg" onClick={() => answer(true)}>
            Sí
          </NeonButton>
          <NeonButton className="flex-1" size="lg" tone="accent" onClick={() => answer(false)}>
            No
          </NeonButton>
        </div>
      </Board>
    </>
  );
}
