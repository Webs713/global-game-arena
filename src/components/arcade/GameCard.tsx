import { Link } from "@tanstack/react-router";
import type { GameMeta } from "@/lib/games";

export function GameCard({ game, best }: { game: GameMeta; best?: number | undefined }) {
  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: game.id }}
      className="panel group relative overflow-hidden p-5 transition-transform hover:-translate-y-1"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div className="flex items-start justify-between">
        <span className="text-4xl">{game.icon}</span>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {game.category}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-extrabold">{game.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{game.tagline}</p>
      <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <span>⏱ {game.duration}</span>
        <span className="text-primary">{best ? `Récord ${best}` : "Sin jugar"}</span>
      </div>
    </Link>
  );
}
