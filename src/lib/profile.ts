/**
 * Local player progression store (points, level, streak, stats, achievements).
 * Persisted in localStorage for this first version.
 */
import { useCallback, useEffect, useState } from "react";
import { GAMES } from "./games";

export type GameStat = {
  plays: number;
  best: number;
  totalPoints: number;
};

export type Profile = {
  name: string;
  avatar: string;
  points: number;
  plays: number;
  streak: number;
  bestStreak: number;
  lastPlayed: string | null;
  stats: Record<string, GameStat>;
  achievements: string[];
  daily: Record<string, Record<string, number>>; // date -> gameId -> score
  history: { gameId: string; score: number; points: number; date: string }[];
};

const KEY = "arcade-wc-profile-v1";

const AVATARS = ["🕹️", "👾", "🚀", "🦊", "🐙", "🐲", "🤖", "⚡"];

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function emptyProfile(): Profile {
  return {
    name: "Jugador Anónimo",
    avatar: "🕹️",
    points: 0,
    plays: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayed: null,
    stats: {},
    achievements: [],
    daily: {},
    history: [],
  };
}

export function levelFromPoints(points: number) {
  const level = Math.floor(Math.sqrt(points / 120)) + 1;
  const curr = (level - 1) ** 2 * 120;
  const next = level ** 2 * 120;
  return {
    level,
    into: points - curr,
    span: next - curr,
    next,
    progress: Math.min(100, Math.round(((points - curr) / (next - curr)) * 100)),
  };
}

export const LEVEL_TITLES = [
  "Novato",
  "Aprendiz",
  "Competidor",
  "Veterano",
  "Experto",
  "Maestro",
  "Élite",
  "Leyenda",
];

export function levelTitle(level: number) {
  return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 3))]!;
}

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  check: (p: Profile) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", name: "Primer contacto", desc: "Juega tu primera partida", icon: "🎮", check: (p) => p.plays >= 1 },
  { id: "plays10", name: "Calentando", desc: "Juega 10 partidas", icon: "🔥", check: (p) => p.plays >= 10 },
  { id: "plays50", name: "Adicto", desc: "Juega 50 partidas", icon: "💥", check: (p) => p.plays >= 50 },
  { id: "pts1000", name: "Cuatro cifras", desc: "Consigue 1.000 puntos", icon: "💎", check: (p) => p.points >= 1000 },
  { id: "pts5000", name: "Cazapuntos", desc: "Consigue 5.000 puntos", icon: "🏆", check: (p) => p.points >= 5000 },
  { id: "streak3", name: "Racha viva", desc: "3 días seguidos jugando", icon: "🔥", check: (p) => p.bestStreak >= 3 },
  { id: "streak7", name: "Semana perfecta", desc: "7 días seguidos jugando", icon: "📅", check: (p) => p.bestStreak >= 7 },
  { id: "lvl5", name: "Nivel 5", desc: "Alcanza el nivel 5", icon: "🎯", check: (p) => levelFromPoints(p.points).level >= 5 },
  {
    id: "explorer",
    name: "Explorador",
    desc: "Prueba todos los minijuegos",
    icon: "🌍",
    check: (p) => GAMES.every((g) => (p.stats[g.id]?.plays ?? 0) > 0),
  },
  {
    id: "daily",
    name: "Reto cumplido",
    desc: "Completa un desafío diario entero",
    icon: "⭐",
    check: (p) => Object.values(p.daily).some((d) => Object.keys(d).length >= 3),
  },
];

function load(): Profile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProfile();
    return { ...emptyProfile(), ...(JSON.parse(raw) as Profile) };
  } catch {
    return emptyProfile();
  }
}

function save(p: Profile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

const listeners = new Set<(p: Profile) => void>();
let cache: Profile | null = null;

function current(): Profile {
  if (!cache) cache = load();
  return cache;
}

function commit(p: Profile) {
  cache = p;
  save(p);
  listeners.forEach((l) => l(p));
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(current());
    setReady(true);
    const l = (p: Profile) => setProfile({ ...p });
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((fn: (p: Profile) => Profile) => {
    commit(fn({ ...current() }));
  }, []);

  return { profile, ready, update };
}

export type RunResult = {
  gameId: string;
  score: number;
  points: number;
  isDaily?: boolean | undefined;
  newAchievements: Achievement[];
  leveledTo?: number | undefined;
};

export function recordRun(gameId: string, score: number, points: number, isDaily = false): RunResult {
  const p = { ...current() };
  const before = levelFromPoints(p.points).level;
  const day = todayKey();

  if (p.lastPlayed !== day) {
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    p.streak = p.lastPlayed === yesterday ? p.streak + 1 : 1;
    p.bestStreak = Math.max(p.bestStreak, p.streak);
    p.lastPlayed = day;
  }

  p.points += points;
  p.plays += 1;
  const prev = p.stats[gameId] ?? { plays: 0, best: 0, totalPoints: 0 };
  p.stats = {
    ...p.stats,
    [gameId]: {
      plays: prev.plays + 1,
      best: Math.max(prev.best, score),
      totalPoints: prev.totalPoints + points,
    },
  };
  p.history = [{ gameId, score, points, date: new Date().toISOString() }, ...p.history].slice(0, 50);

  if (isDaily) {
    const d = { ...(p.daily[day] ?? {}) };
    d[gameId] = Math.max(d[gameId] ?? 0, points);
    p.daily = { ...p.daily, [day]: d };
  }

  const newAchievements = ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.check(p));
  p.achievements = [...p.achievements, ...newAchievements.map((a) => a.id)];

  commit(p);
  const after = levelFromPoints(p.points).level;
  return {
    gameId,
    score,
    points,
    isDaily,
    newAchievements,
    leveledTo: after > before ? after : undefined,
  };
}

export function updateIdentity(name: string, avatar: string) {
  commit({ ...current(), name: name.trim() || "Jugador Anónimo", avatar });
}

export function resetProfile() {
  commit(emptyProfile());
}

export const AVATAR_OPTIONS = AVATARS;
