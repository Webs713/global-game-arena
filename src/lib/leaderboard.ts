import { seededRandom } from "./games";

export type Rival = {
  id: string;
  name: string;
  avatar: string;
  country: string;
  points: number;
};

const NAMES = [
  "NovaBlitz", "KenjiX", "LunaFuego", "ZeroPing", "MambaSix", "PixelReina",
  "TurboLars", "AkiraFlow", "SaraVolt", "NitroKid", "MiraCombo", "GhostTap",
  "RavenDash", "SolarPunk", "DrKlick", "ValeSpeed", "OmegaJo", "TitoRush",
  "KiraByte", "NeoSprint", "ArcadeMom", "BitBenji", "HexHana", "ZuluOne",
  "FastFatima", "ChipoNine", "VeraSnap", "MaxParsec", "IvyGlitch", "RoboRui",
];
const FLAGS = ["🇪🇸", "🇯🇵", "🇧🇷", "🇺🇸", "🇰🇷", "🇩🇪", "🇫🇷", "🇲🇽", "🇳🇬", "🇮🇳", "🇦🇷", "🇸🇪", "🇨🇦", "🇦🇺", "🇮🇹"];
const AVATARS = ["👾", "🦊", "🐙", "🐲", "🤖", "🚀", "🦁", "🐼", "🦅", "🐝"];

export type Scope = "global" | "weekly" | "daily";

const CAPS: Record<Scope, number> = { global: 48000, weekly: 9000, daily: 2400 };

export function rivals(scope: Scope, seedExtra = ""): Rival[] {
  const rnd = seededRandom(`${scope}-${seedExtra}`);
  const cap = CAPS[scope];
  return NAMES.map((name, i) => ({
    id: `${scope}-${i}`,
    name,
    avatar: AVATARS[Math.floor(rnd() * AVATARS.length)]!,
    country: FLAGS[Math.floor(rnd() * FLAGS.length)]!,
    points: Math.round(cap * Math.pow(1 - i / (NAMES.length + 6), 2.4) + rnd() * 120),
  })).sort((a, b) => b.points - a.points);
}

export type Row = Rival & { rank: number; isYou?: boolean };

export function buildBoard(scope: Scope, you: { name: string; avatar: string; points: number }, seedExtra = ""): Row[] {
  const all = [
    ...rivals(scope, seedExtra),
    { id: "you", name: you.name, avatar: you.avatar, country: "🌍", points: you.points },
  ].sort((a, b) => b.points - a.points);
  return all.map((r, i) => ({ ...r, rank: i + 1, isYou: r.id === "you" }));
}
