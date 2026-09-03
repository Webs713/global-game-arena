export type GameCategory =
  | "Reflejos"
  | "Memoria"
  | "Lógica"
  | "Estrategia"
  | "Observación"
  | "Patrones"
  | "Mental";

export type GameMeta = {
  id: string;
  name: string;
  tagline: string;
  category: GameCategory;
  icon: string;
  duration: string;
};

export const GAMES: GameMeta[] = [
  {
    id: "reflex",
    name: "Reacción Relámpago",
    tagline: "Golpea el objetivo en cuanto se ilumine.",
    category: "Reflejos",
    icon: "⚡",
    duration: "45 s",
  },
  {
    id: "memory",
    name: "Memoria Flash",
    tagline: "Memoriza las casillas antes de que desaparezcan.",
    category: "Memoria",
    icon: "🧠",
    duration: "90 s",
  },
  {
    id: "pattern",
    name: "Eco de Patrones",
    tagline: "Repite la secuencia de luces y sonidos.",
    category: "Patrones",
    icon: "🎵",
    duration: "90 s",
  },
  {
    id: "math",
    name: "Cálculo Turbo",
    tagline: "Resuelve operaciones a toda velocidad.",
    category: "Mental",
    icon: "➗",
    duration: "60 s",
  },
  {
    id: "oddone",
    name: "Caza el Intruso",
    tagline: "Encuentra el símbolo distinto en la cuadrícula.",
    category: "Observación",
    icon: "🔍",
    duration: "60 s",
  },
  {
    id: "logic",
    name: "Serie Lógica",
    tagline: "Deduce el número que continúa la serie.",
    category: "Lógica",
    icon: "🧩",
    duration: "75 s",
  },
  {
    id: "grab",
    name: "Botín Estratégico",
    tagline: "Elige tu ruta para maximizar el botín.",
    category: "Estrategia",
    icon: "♟️",
    duration: "60 s",
  },
  {
    id: "colorclash",
    name: "Choque de Color",
    tagline: "¿Coincide la palabra con su color? Decide rápido.",
    category: "Reflejos",
    icon: "🎨",
    duration: "45 s",
  },
];

export function getGame(id: string) {
  return GAMES.find((g) => g.id === id);
}

/** Deterministic pseudo-random from a string seed. */
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The three daily challenge games, rotating per date. */
export function dailyGames(dateKey: string): GameMeta[] {
  const rnd = seededRandom("daily-" + dateKey);
  const pool = [...GAMES];
  const picked: GameMeta[] = [];
  while (picked.length < 3 && pool.length) {
    picked.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]!);
  }
  return picked;
}
