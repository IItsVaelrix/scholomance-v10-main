import type { EntityTag, EntityType, HiddenState, NodeType } from "../data/world.schema";
import type { School } from "../engines/colorEngine/index.ts";

export type ScrollInput = {
  id?: string;
  title?: string;
  text?: string;
  content?: string;
};

export type ScrollMetrics = {
  seed: number;
  tokenCount: number;
  uniqueCount: number;
  lineCount: number;
  volatility: number;
  complexity: number;
};

export type WorldEdge = {
  from: string;
  to: string;
  locked: boolean;
};

export type WorldNode = {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  entities: string[];
  chroma: WorldChroma;
};

export type WorldEntity = {
  id: string;
  type: EntityType;
  name?: string;
  title?: string;
  description?: string;
  tags?: EntityTag[];
  hiddenState: HiddenState;
  contents?: WorldEntity[];
  effects?: {
    unlockChance: number;
    heal: number;
  };
  consumedOnUse?: boolean;
  dialogue?: string;
  locked?: boolean;
  keyHint?: string;
  text?: string;
  rank?: "COMMON" | "ELITE" | "BOSS";
  stats?: {
    hp: number;
    atk: number;
  };
  loot?: string[];
  chroma?: WorldChroma;
};

export type WorldChroma = {
  school: School;
  cssVar: string;
  className: string;
  rgb: [number, number, number];
  weight?: number;
  blended?: boolean;
};

export type WorldPalette = {
  scores: Record<School, number>;
  dominant: WorldChroma;
  blended: WorldChroma;
};

export type World = {
  seed: number;
  metrics: ScrollMetrics;
  nodes: WorldNode[];
  edges: WorldEdge[];
  entitiesById: Record<string, WorldEntity>;
  startNodeId: string;
  palette: WorldPalette;
};

export type WorldState = {
  worldId: string;
  nodeId: string;
  inventory: string[];
  visited: Set<string>;
  log: string[];
  defeated: Set<string>;
  entityStateById: Record<string, { hiddenState: HiddenState }>;
};

export type WorldAction =
  | { type: "MOVE"; to: string }
  | { type: "INTERACT"; entityId: string }
  | { type: "PICKUP"; itemId: string }
  | { type: "FIGHT"; monsterId: string }
  | { type: "FLEE" }
  | { type: "USE_ITEM"; toolId: string; targetId: string }
  | { type: "READ_CLUE"; clueId: string };
