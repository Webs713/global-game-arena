import { createFileRoute } from "@tanstack/react-router";
import { GameHost } from "@/components/arcade/GameHost";
import { getGame } from "@/lib/games";

export const Route = createFileRoute("/play/$gameId")({
  head: ({ params }) => {
    const g = getGame(params.gameId);
    const title = g ? `${g.name} — Arcade Mundial` : "Minijuego — Arcade Mundial";
    const desc = g
      ? `${g.tagline} Partida de ${g.duration} para sumar puntos en el ranking mundial.`
      : "Juega un minijuego rápido y compite en el ranking mundial.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: PlayGame,
});

function PlayGame() {
  const { gameId } = Route.useParams();
  return (
    <div className="mx-auto max-w-2xl">
      <GameHost key={gameId} gameId={gameId} />
    </div>
  );
}
