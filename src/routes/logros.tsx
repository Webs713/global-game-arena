import { createFileRoute } from "@tanstack/react-router";
import { ACHIEVEMENTS, useProfile } from "@/lib/profile";
import { Panel, ProgressBar } from "@/components/arcade/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/logros")({
  head: () => ({
    meta: [
      { title: "Logros y medallas — Arcade Mundial" },
      {
        name: "description",
        content:
          "Desbloquea logros y medallas jugando minijuegos, manteniendo tu racha diaria y subiendo de nivel en la competición mundial.",
      },
      { property: "og:title", content: "Logros y medallas — Arcade Mundial" },
      {
        property: "og:description",
        content: "Colecciona medallas por partidas jugadas, puntos, rachas y niveles alcanzados.",
      },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const { profile } = useProfile();
  const unlocked = profile.achievements.length;

  return (
    <div className="space-y-8">
      <div className="hero-glow rounded-3xl border border-border p-8 text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Logros</h1>
        <p className="mt-2 text-muted-foreground">
          {unlocked} de {ACHIEVEMENTS.length} medallas desbloqueadas
        </p>
        <ProgressBar value={(unlocked / ACHIEVEMENTS.length) * 100} className="mx-auto mt-5 max-w-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const has = profile.achievements.includes(a.id);
          return (
            <Panel
              key={a.id}
              className={cn("flex items-center gap-4", has ? "border-gold/50" : "opacity-60")}
            >
              <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl text-2xl", has ? "bg-gold/20" : "bg-surface-2 grayscale")}>
                {has ? a.icon : "🔒"}
              </span>
              <div>
                <div className={cn("font-display text-lg font-extrabold", has && "text-gold")}>
                  {a.name}
                </div>
                <div className="text-sm text-muted-foreground">{a.desc}</div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
