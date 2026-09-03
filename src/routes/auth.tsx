import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/cloud";
import { NeonButton, Panel } from "@/components/arcade/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar o crear cuenta — Arcade Mundial" },
      {
        name: "description",
        content:
          "Crea tu cuenta de Arcade Mundial para guardar tus puntos, tu racha y competir en el ranking mundial real.",
      },
      { property: "og:title", content: "Entrar o crear cuenta — Arcade Mundial" },
      {
        property: "og:description",
        content: "Guarda tu progreso en la nube y compite con jugadores reales.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) navigate({ to: "/perfil" });
  }, [ready, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    if (!data.session) {
      setMsg("Cuenta creada: confirma tu correo con el enlace que te hemos enviado y vuelve a entrar.");
      return;
    }
    navigate({ to: "/perfil" });
  }

  async function google() {
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setMsg("No se pudo iniciar sesión con Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/perfil" });
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold">
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Guarda tus puntos, tu racha y compite en el ranking mundial real.
        </p>
      </div>

      <Panel className="space-y-5">
        <div className="flex gap-2">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "login" ? "Entrar" : "Registrarse"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-input bg-surface-2 px-4 py-3 font-semibold outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl border border-input bg-surface-2 px-4 py-3 font-semibold outline-none focus:border-primary"
          />
          <NeonButton type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Cargando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </NeonButton>
        </form>

        <div className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          o
        </div>

        <NeonButton tone="surface" size="lg" className="w-full" onClick={google}>
          Continuar con Google
        </NeonButton>

        {msg && <p className="text-center text-sm font-semibold text-destructive">{msg}</p>}
      </Panel>
    </div>
  );
}
