import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { dailyGames } from "@/lib/games";
import { todayKey, useProfile } from "@/lib/profile";
import { GameHost } from "@/components/arcade/GameHost";
import { NeonButton, Panel, ProgressBar } from "@/components/arcade/ui";

export const Route = createFileRoute("/desafio")({
  head: () => ({
    meta: [
      { title: "Desafío diario — Arcade Mundial" },
      {
        name: "description",
        content:
          "Tres pruebas especiales cada día para todos los jugadores. Completa el desafío diario y compite en el ranking del día.",
      },
      { property: "og:title", content: "Desafío diario — Arcade Mundial" },
      {
        property: "og:description",
        content: "Tres minijuegos rotativos al día con puntuación válida para el ranking diario.",
      },
    ],
  }),
  component: Daily,
});

function Daily() {
  const { profile } = useProfile();
  const today = todayKey();
  const games = dailyGames(today);
  const [active, setActive] = useState<string | null>(null);
  const done = profile.daily[today] ?? {};
  const completed = games.filter((g) => done[g.id]).length;
  const totalPoints = games.reduce((a, g) => a + (done[g.id] ?? 0), 0);

  if (active) {
    return (
      <div className="mx-auto max-w-2xl">
        <GameHost key={active} gameId={active} isDaily onExit={() => setActive(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="hero-glow rounded-3xl border border-border p-8 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
          🔥 Desafío del {new Date(today).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
        </div>
        <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
          3 pruebas, una sola oportunidad al día
        </h1>
        <p className="mt-2 text-muted-foreground">
          Todos los jugadores del mundo reciben hoy los mismos tres minijuegos.
        </p>
      </div>

      <Panel>
        <div className="flex items-end justify-between">
          <div className="font-display text-xl font-extrabold">
            Progreso: {completed} / {games.length}
          </div>
          <div className="font-display text-xl font-extrabold text-primary">
            {totalPoints.toLocaleString("es-ES")} pts
          </div>
        </div>
        <ProgressBar value={(completed / games.length) * 100} className="mt-4" />
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {games.map((g, i) => (
          <Panel key={g.id} className="flex flex-col text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Prueba {i + 1}
            </div>
            <div className="mt-3 text-5xl">{g.icon}</div>
            <h2 className="mt-3 font-display text-lg font-extrabold">{g.name}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.tagline}</p>
            <div className="mt-4">
              {done[g.id] ? (
                <div className="rounded-xl bg-success/15 px-4 py-2.5 font-bold text-success">
                  ✔ {done[g.id]} pts
                </div>
              ) : (
                <NeonButton className="w-full" onClick={() => setActive(g.id)}>
                  Jugar prueba
                </NeonButton>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {completed === games.length && (
        <Panel className="text-center">
          <div className="text-4xl">🏁</div>
          <p className="mt-2 font-display text-2xl font-extrabold text-gold">
            ¡Desafío diario completado!
          </p>
          <p className="mt-1 text-muted-foreground">
            Vuelve mañana: tres pruebas nuevas y tu racha sigue creciendo.
          </p>
        </Panel>
      )}
    </div>
  );
}
