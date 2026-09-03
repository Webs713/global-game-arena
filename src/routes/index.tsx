import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES, dailyGames } from "@/lib/games";
import { levelFromPoints, levelTitle, todayKey, useProfile } from "@/lib/profile";
import { buildBoard } from "@/lib/leaderboard";
import { GameCard } from "@/components/arcade/GameCard";
import { NeonButton, Panel, ProgressBar, SectionTitle, StatChip } from "@/components/arcade/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arcade Mundial — Competición mundial de minijuegos" },
      {
        name: "description",
        content:
          "Juega minijuegos rápidos de reflejos, memoria y lógica en el navegador, gana puntos y escala en el ranking mundial cada día.",
      },
      { property: "og:title", content: "Arcade Mundial — Competición mundial de minijuegos" },
      {
        property: "og:description",
        content:
          "Minijuegos de 30 segundos a 3 minutos, ranking mundial, desafíos diarios, rachas y logros desbloqueables.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { profile } = useProfile();
  const lvl = levelFromPoints(profile.points);
  const today = todayKey();
  const daily = dailyGames(today);
  const board = buildBoard("global", profile, "");
  const you = board.find((r) => r.isYou)!;
  const featured = GAMES.slice(0, 6);

  return (
    <div className="space-y-16">
      <section className="hero-glow relative overflow-hidden rounded-3xl border border-border px-6 py-14 text-center sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">
            🌍 Temporada mundial abierta
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] sm:text-7xl">
            La copa mundial
            <br />
            de <span className="text-gradient">minijuegos</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-foreground/80">
            Partidas de 30 segundos a 3 minutos. Reflejos, memoria, lógica y estrategia. Gana puntos,
            mantén tu racha y sube en el ranking mundial.
          </p>
          <Link to="/play" className="mt-10 inline-block">
            <NeonButton size="xl" className="animate-pulse-neon">
              🎮 Jugar ahora
            </NeonButton>
          </Link>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {GAMES.length} minijuegos · sin descargas · sin registro
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon="🏆" label="Puntos totales" value={profile.points.toLocaleString("es-ES")} tone="primary" />
        <StatChip icon="🔥" label="Racha de días" value={`${profile.streak} días`} tone="accent" />
        <StatChip icon="🎯" label="Nivel" value={`${lvl.level} · ${levelTitle(lvl.level)}`} tone="gold" />
        <StatChip icon="🌍" label="Puesto mundial" value={`#${you.rank}`} tone="cyan" />
      </section>

      <section>
        <Panel>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Progreso de nivel
              </div>
              <div className="font-display text-xl font-extrabold">
                Nivel {lvl.level} → {lvl.level + 1}
              </div>
            </div>
            <div className="text-sm font-bold text-muted-foreground">
              {lvl.into} / {lvl.span} XP
            </div>
          </div>
          <ProgressBar value={lvl.progress} className="mt-4" />
        </Panel>
      </section>

      <section>
        <SectionTitle
          kicker="🔥 Desafío diario"
          title="Las 3 pruebas de hoy"
          action={{ to: "/desafio", label: "Ver desafío" }}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {daily.map((g) => (
            <Panel key={g.id} className="text-center">
              <div className="text-4xl">{g.icon}</div>
              <div className="mt-2 font-display text-lg font-extrabold">{g.name}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {profile.daily[today]?.[g.id] ? `✔ ${profile.daily[today][g.id]} pts` : "Pendiente"}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle kicker="🎮 Catálogo" title="Minijuegos destacados" action={{ to: "/play", label: "Ver todos" }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((g) => (
            <GameCard key={g.id} game={g} best={profile.stats[g.id]?.best} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle kicker="🏆 Ranking mundial" title="Top jugadores" action={{ to: "/ranking", label: "Ranking completo" }} />
        <Panel className="divide-y divide-border p-0">
          {board.slice(0, 6).map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-4 px-5 py-3.5 ${r.isYou ? "bg-primary/10" : ""}`}
            >
              <span className="w-8 font-display text-lg font-extrabold text-muted-foreground">
                {r.rank}
              </span>
              <span className="text-xl">{r.avatar}</span>
              <span className="flex-1 truncate font-bold">
                {r.name} <span className="ml-1">{r.country}</span>
                {r.isYou && <span className="ml-2 text-xs font-bold uppercase text-primary">tú</span>}
              </span>
              <span className="font-display font-extrabold text-primary">
                {r.points.toLocaleString("es-ES")}
              </span>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}
