import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { buildBoard, type Scope } from "@/lib/leaderboard";
import { todayKey, useProfile } from "@/lib/profile";
import { Panel, SectionTitle } from "@/components/arcade/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking mundial, semanal y diario — Arcade Mundial" },
      {
        name: "description",
        content:
          "Consulta el ranking mundial de minijuegos, la clasificación semanal y la tabla diaria, y compara tus puntos con los mejores jugadores.",
      },
      { property: "og:title", content: "Ranking mundial — Arcade Mundial" },
      {
        property: "og:description",
        content: "Clasificaciones global, semanal y diaria de la competición mundial de minijuegos.",
      },
    ],
  }),
  component: Ranking,
});

const TABS: { id: Scope; label: string }[] = [
  { id: "global", label: "🌍 Mundial" },
  { id: "weekly", label: "📅 Semanal" },
  { id: "daily", label: "⚡ Diario" },
];

export function pointsInWindow(
  history: { points: number; date: string }[],
  days: number,
) {
  const from = Date.now() - days * 86400000;
  return history
    .filter((h) => new Date(h.date).getTime() >= from)
    .reduce((a, h) => a + h.points, 0);
}

function Ranking() {
  const { profile } = useProfile();
  const [scope, setScope] = useState<Scope>("global");

  const yourPoints =
    scope === "global"
      ? profile.points
      : scope === "weekly"
        ? pointsInWindow(profile.history, 7)
        : pointsInWindow(profile.history, 1);

  const board = buildBoard(
    scope,
    { ...profile, points: yourPoints },
    scope === "daily" ? todayKey() : scope === "weekly" ? todayKey().slice(0, 7) : "",
  );
  const you = board.find((r) => r.isYou)!;

  return (
    <div className="space-y-8">
      <div className="hero-glow rounded-3xl border border-border p-8 text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Ranking</h1>
        <p className="mt-2 text-muted-foreground">
          Tu posición actual: <span className="font-bold text-primary">#{you.rank}</span> con{" "}
          {yourPoints.toLocaleString("es-ES")} puntos
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setScope(t.id)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
              scope === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {board.slice(0, 3).map((r, i) => (
          <Panel key={r.id} className={cn("text-center", r.isYou && "border-primary")}>
            <div className="text-3xl">{["🥇", "🥈", "🥉"][i]}</div>
            <div className="mt-2 text-3xl">{r.avatar}</div>
            <div className="mt-1 font-display text-lg font-extrabold">
              {r.name} {r.country}
            </div>
            <div className="font-display text-2xl font-extrabold text-primary">
              {r.points.toLocaleString("es-ES")}
            </div>
          </Panel>
        ))}
      </div>

      <div>
        <SectionTitle title="Clasificación" kicker="Top 30 + tu posición" />
        <Panel className="divide-y divide-border p-0">
          {board.slice(0, 31).map((r) => (
            <div
              key={r.id}
              className={cn("flex items-center gap-4 px-5 py-3.5", r.isYou && "bg-primary/10")}
            >
              <span className="w-8 font-display text-lg font-extrabold text-muted-foreground">
                {r.rank}
              </span>
              <span className="text-xl">{r.avatar}</span>
              <span className="flex-1 truncate font-bold">
                {r.name} <span className="ml-1">{r.country}</span>
                {r.isYou && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary-foreground">
                    tú
                  </span>
                )}
              </span>
              <span className="font-display font-extrabold text-primary">
                {r.points.toLocaleString("es-ES")}
              </span>
            </div>
          ))}
          {you.rank > 31 && (
            <div className="flex items-center gap-4 bg-primary/10 px-5 py-3.5">
              <span className="w-8 font-display text-lg font-extrabold text-muted-foreground">
                {you.rank}
              </span>
              <span className="text-xl">{you.avatar}</span>
              <span className="flex-1 truncate font-bold">{you.name} 🌍</span>
              <span className="font-display font-extrabold text-primary">
                {you.points.toLocaleString("es-ES")}
              </span>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
