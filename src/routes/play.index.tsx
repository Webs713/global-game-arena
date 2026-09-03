import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GAMES } from "@/lib/games";
import { useProfile } from "@/lib/profile";
import { GameCard } from "@/components/arcade/GameCard";
import { NeonButton, SectionTitle } from "@/components/arcade/ui";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Jugar minijuegos — Arcade Mundial" },
      {
        name: "description",
        content:
          "Elige entre minijuegos de reflejos, memoria, lógica, patrones y estrategia. Partidas cortas jugables al instante en el navegador.",
      },
      { property: "og:title", content: "Jugar minijuegos — Arcade Mundial" },
      {
        property: "og:description",
        content: "Catálogo de minijuegos rápidos para competir por puntos en el ranking mundial.",
      },
    ],
  }),
  component: PlayIndex,
});

function PlayIndex() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  function random() {
    const g = GAMES[Math.floor(Math.random() * GAMES.length)]!;
    navigate({ to: "/play/$gameId", params: { gameId: g.id } });
  }

  return (
    <div className="space-y-8">
      <div className="hero-glow rounded-3xl border border-border p-8 text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Elige tu minijuego</h1>
        <p className="mt-2 text-muted-foreground">
          {GAMES.length} pruebas rápidas. O deja que la máquina elija por ti.
        </p>
        <NeonButton size="lg" className="mt-6" onClick={random}>
          🎲 Partida aleatoria
        </NeonButton>
      </div>

      <div>
        <SectionTitle kicker="🎮 Catálogo completo" title="Todos los minijuegos" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <GameCard key={g.id} game={g} best={profile.stats[g.id]?.best} />
          ))}
        </div>
      </div>
    </div>
  );
}
