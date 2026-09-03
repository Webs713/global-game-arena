import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { getGame } from "@/lib/games";
import { recordRun, type RunResult } from "@/lib/profile";
import { NeonButton } from "./ui";
import { Reflex } from "../games/Reflex";
import { Memory } from "../games/Memory";
import { Pattern } from "../games/Pattern";
import { MathRush } from "../games/MathRush";
import { OddOne } from "../games/OddOne";
import { LogicSeries } from "../games/LogicSeries";
import { LootPath } from "../games/LootPath";
import { ColorClash } from "../games/ColorClash";
import type { GameProps } from "../games/kit";

const REGISTRY: Record<string, (p: GameProps) => React.ReactNode> = {
  reflex: Reflex,
  memory: Memory,
  pattern: Pattern,
  math: MathRush,
  oddone: OddOne,
  logic: LogicSeries,
  grab: LootPath,
  colorclash: ColorClash,
};

export function GameHost({
  gameId,
  isDaily = false,
  onExit,
}: {
  gameId: string;
  isDaily?: boolean;
  onExit?: () => void;
}) {
  const meta = getGame(gameId);
  const Game = REGISTRY[gameId];
  const [phase, setPhase] = useState<"intro" | "play" | "result">("intro");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);

  if (!meta || !Game) {
    return (
      <div className="panel p-8 text-center">
        <p className="font-display text-xl font-bold">Minijuego no encontrado.</p>
        <Link to="/play" className="mt-4 inline-block text-primary underline">
          Volver a la selección
        </Link>
      </div>
    );
  }

  function finish(score: number, points: number) {
    const run = recordRun(gameId, score, points, isDaily);
    setResult(run);
    setPhase("result");
    if (userId) void pushRun(userId, run);
  }

  if (phase === "intro") {
    return (
      <div className="panel animate-pop-in p-8 text-center">
        <div className="text-6xl">{meta.icon}</div>
        <h1 className="mt-4 font-display text-3xl font-extrabold">{meta.name}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">{meta.tagline}</p>
        <div className="mt-4 flex justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span className="rounded-full bg-surface-2 px-3 py-1">{meta.category}</span>
          <span className="rounded-full bg-surface-2 px-3 py-1">≈ {meta.duration}</span>
          {isDaily && (
            <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">
              Desafío diario
            </span>
          )}
        </div>
        <NeonButton size="xl" className="mt-8" onClick={() => setPhase("play")}>
          ▶ Empezar
        </NeonButton>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="panel animate-pop-in p-8 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
          Partida completada
        </div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">{meta.name}</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-2 p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Puntos ganados
            </div>
            <div className="font-display text-4xl font-extrabold text-primary">+{result.points}</div>
          </div>
          <div className="rounded-xl bg-surface-2 p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Marcador
            </div>
            <div className="font-display text-4xl font-extrabold text-cyan">{result.score}</div>
          </div>
        </div>

        {result.leveledTo && (
          <p className="mt-6 font-display text-xl font-extrabold text-gold">
            🎉 ¡Has subido al nivel {result.leveledTo}!
          </p>
        )}
        {result.newAchievements.length > 0 && (
          <div className="mt-6 space-y-2">
            {result.newAchievements.map((a) => (
              <div
                key={a.id}
                className="mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-left"
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-bold text-gold">Logro: {a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <NeonButton
            size="lg"
            onClick={() => {
              setRunKey((k) => k + 1);
              setResult(null);
              setPhase("play");
            }}
          >
            🔁 Otra vez
          </NeonButton>
          {onExit ? (
            <NeonButton size="lg" tone="surface" onClick={onExit}>
              Volver
            </NeonButton>
          ) : (
            <Link to="/play">
              <NeonButton size="lg" tone="surface">
                Otro minijuego
              </NeonButton>
            </Link>
          )}
          <Link to="/ranking">
            <NeonButton size="lg" tone="surface">
              🏆 Ranking
            </NeonButton>
          </Link>
        </div>
      </div>
    );
  }

  return <Game key={runKey} seed={String(runKey)} onFinish={finish} />;
}
