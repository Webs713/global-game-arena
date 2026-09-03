/**
 * Lovable Cloud sync: cuentas de jugador, perfiles y partidas compartidas.
 */
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { currentProfile, mergeRemote, type Profile } from "./profile";

export type CloudPlayer = {
  id: string;
  name: string;
  avatar: string;
  country: string;
  points: number;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, ready, user: session?.user ?? null };
}

export async function pushProfile(userId: string, p: Profile = currentProfile()) {
  await supabase.from("profiles").upsert(
    {
      id: userId,
      name: p.name,
      avatar: p.avatar,
      points: p.points,
      plays: p.plays,
      streak: p.streak,
      best_streak: p.bestStreak,
      last_played: p.lastPlayed,
      achievements: p.achievements,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function pullAndMerge(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (data) {
    mergeRemote({
      name: data.name,
      avatar: data.avatar,
      points: data.points,
      plays: data.plays,
      streak: data.streak,
      bestStreak: data.best_streak,
      lastPlayed: data.last_played,
      achievements: data.achievements ?? [],
    });
  }
  await pushProfile(userId);
}

export async function pushRun(
  userId: string,
  run: { gameId: string; score: number; points: number; isDaily?: boolean | undefined },
) {
  await supabase.from("runs").insert({
    user_id: userId,
    game_id: run.gameId,
    score: run.score,
    points: run.points,
    is_daily: run.isDaily ?? false,
  });
  await pushProfile(userId);
}

/** Jugadores reales para el ranking global. */
export async function fetchGlobalPlayers(): Promise<CloudPlayer[]> {
  const { data } = await supabase
    .from("profiles")
    .select("id,name,avatar,country,points")
    .order("points", { ascending: false })
    .limit(200);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    country: r.country,
    points: r.points,
  }));
}

/** Suma de puntos por jugador en los últimos `days` días. */
export async function fetchWindowPlayers(days: number): Promise<CloudPlayer[]> {
  const from = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from("runs")
    .select("user_id,points,profiles(name,avatar,country)")
    .gte("created_at", from)
    .limit(1000);

  const acc = new Map<string, CloudPlayer>();
  for (const row of (data ?? []) as unknown as {
    user_id: string;
    points: number;
    profiles: { name: string; avatar: string; country: string } | null;
  }[]) {
    const prev = acc.get(row.user_id);
    if (prev) {
      prev.points += row.points;
    } else {
      acc.set(row.user_id, {
        id: row.user_id,
        name: row.profiles?.name ?? "Jugador",
        avatar: row.profiles?.avatar ?? "🕹️",
        country: row.profiles?.country ?? "🌍",
        points: row.points,
      });
    }
  }
  return [...acc.values()].sort((a, b) => b.points - a.points);
}

/** Sincroniza el progreso local con la nube al iniciar sesión. */
export function useCloudSync() {
  const { session, ready } = useSession();
  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) void pullAndMerge(userId);
  }, [userId]);
  return { session, ready, userId };
}
