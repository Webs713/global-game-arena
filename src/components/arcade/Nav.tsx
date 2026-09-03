import { Link } from "@tanstack/react-router";
import { useProfile, levelFromPoints } from "@/lib/profile";
import { useCloudSync } from "@/lib/cloud";

const ITEMS = [
  { to: "/play", label: "Jugar", icon: "🎮" },
  { to: "/ranking", label: "Ranking", icon: "🏆" },
  { to: "/desafio", label: "Desafío", icon: "🔥" },
  { to: "/logros", label: "Logros", icon: "🏅" },
  { to: "/perfil", label: "Perfil", icon: "👤" },
] as const;

export function Nav() {
  const { profile, ready } = useProfile();
  const { session } = useCloudSync();
  const lvl = levelFromPoints(profile.points);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🕹️</span>
            <span className="hidden font-display text-lg font-extrabold uppercase tracking-tight sm:block">
              Arcade<span className="text-primary">Mundial</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {ITEMS.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                activeProps={{ className: "bg-surface-2 text-foreground" }}
                className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="mr-1.5">{i.icon}</span>
                {i.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            {!session && (
              <Link
                to="/auth"
                className="hidden rounded-lg bg-surface-2 px-3 py-2 text-sm font-bold text-foreground sm:block"
              >
                Entrar
              </Link>
            )}
            {ready && (
              <div className="hidden text-right sm:block">
                <div className="font-display text-sm font-extrabold text-primary">
                  {profile.points.toLocaleString("es-ES")} pts
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Nivel {lvl.level} · 🔥 {profile.streak}
                </div>
              </div>
            )}
            <Link
              to="/perfil"
              className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-xl"
            >
              {ready ? profile.avatar : "🕹️"}
            </Link>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5">
          {ITEMS.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeProps={{ className: "text-primary" }}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              <span className="text-lg">{i.icon}</span>
              {i.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
