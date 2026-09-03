import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GAMES, getGame } from "@/lib/games";
import {
  AVATAR_OPTIONS,
  levelFromPoints,
  levelTitle,
  resetProfile,
  updateIdentity,
  useProfile,
} from "@/lib/profile";
import { buildBoard } from "@/lib/leaderboard";
import { NeonButton, Panel, ProgressBar, SectionTitle, StatChip } from "@/components/arcade/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Tu perfil de jugador — Arcade Mundial" },
      {
        name: "description",
        content:
          "Revisa tus puntos totales, nivel, racha de días, posición mundial y estadísticas de cada minijuego.",
      },
      { property: "og:title", content: "Tu perfil de jugador — Arcade Mundial" },
      {
        property: "og:description",
        content: "Puntos, nivel, racha, ranking y estadísticas detalladas por minijuego.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, ready } = useProfile();
  const lvl = levelFromPoints(profile.points);
  const board = buildBoard("global", profile, "");
  const you = board.find((r) => r.isYou)!;
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) {
      setName(profile.name);
      setAvatar(profile.avatar);
    }
  }, [ready, profile.name, profile.avatar]);

  return (
    <div className="space-y-10">
      <Panel className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-surface-2 text-5xl">
          {profile.avatar}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold">{profile.name}</h1>
          <p className="text-muted-foreground">
            Nivel {lvl.level} · {levelTitle(lvl.level)} · Puesto mundial #{you.rank}
          </p>
          <ProgressBar value={lvl.progress} className="mt-4" />
          <div className="mt-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {lvl.into} / {lvl.span} XP hacia el nivel {lvl.level + 1}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon="🏆" label="Puntos totales" value={profile.points.toLocaleString("es-ES")} tone="primary" />
        <StatChip icon="🔥" label="Racha actual" value={`${profile.streak} días`} tone="accent" />
        <StatChip icon="📈" label="Mejor racha" value={`${profile.bestStreak} días`} tone="gold" />
        <StatChip icon="🎮" label="Partidas" value={profile.plays} tone="cyan" />
      </div>

      <div>
        <SectionTitle kicker="📊 Estadísticas" title="Rendimiento por minijuego" />
        <Panel className="divide-y divide-border p-0">
          {GAMES.map((g) => {
            const s = profile.stats[g.id];
            return (
              <div key={g.id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <div className="font-bold">{g.name}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {g.category}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-display font-extrabold text-primary">
                    {s ? `${s.totalPoints.toLocaleString("es-ES")} pts` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s ? `${s.plays} partidas · récord ${s.best}` : "sin jugar"}
                  </div>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      {profile.history.length > 0 && (
        <div>
          <SectionTitle kicker="🕘 Historial" title="Últimas partidas" />
          <Panel className="divide-y divide-border p-0">
            {profile.history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xl">{getGame(h.gameId)?.icon ?? "🎮"}</span>
                <span className="flex-1 font-semibold">{getGame(h.gameId)?.name ?? h.gameId}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(h.date).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-display font-extrabold text-primary">+{h.points}</span>
              </div>
            ))}
          </Panel>
        </div>
      )}

      <div>
        <SectionTitle kicker="⚙️ Ajustes" title="Tu identidad de jugador" />
        <Panel className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Nombre
            </label>
            <input
              value={name}
              maxLength={18}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className="mt-2 w-full rounded-xl border border-input bg-surface-2 px-4 py-3 font-bold outline-none focus:border-primary"
            />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Avatar
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAvatar(a);
                    setSaved(false);
                  }}
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-xl text-2xl transition-colors",
                    avatar === a ? "bg-primary/25 ring-2 ring-primary" : "bg-surface-2",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NeonButton
              onClick={() => {
                updateIdentity(name, avatar);
                setSaved(true);
              }}
            >
              Guardar
            </NeonButton>
            <NeonButton
              tone="surface"
              onClick={() => {
                if (confirm("¿Borrar todo tu progreso?")) resetProfile();
              }}
            >
              Reiniciar progreso
            </NeonButton>
            {saved && <span className="text-sm font-bold text-success">✔ Guardado</span>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
