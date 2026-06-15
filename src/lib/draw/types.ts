import type { Card } from "@/types/card";

export interface DrawRecord {
  cardId: number;
  drawnAt: string;
}

export interface DrawStatus {
  canDraw: boolean;
  nextDrawAt: string | null;
  lastDraw: DrawRecord | null;
  card: Card | null;
}

export const DRAW_COOLDOWN_MS = 24 * 60 * 60 * 1000;
