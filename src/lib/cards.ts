import cardsData from "../../cards.json";
import type { Card } from "@/types/card";

const cards = cardsData as Card[];

export const TOTAL_CARDS = 72;

export function getAllCards(): Card[] {
  return cards;
}

export function getCardById(id: number): Card | undefined {
  return cards.find((card) => card.id === id);
}

export function pickRandomCardId(): number {
  return Math.floor(Math.random() * TOTAL_CARDS) + 1;
}

/** Bump revision when replacing art files — busts Next/Image optimizer cache. */
const CARD_ART_REVISIONS: Partial<Record<number, number>> = {
  1: 2,
};

export function getCardArtPath(cardId: number): string {
  const revision = CARD_ART_REVISIONS[cardId] ?? 1;
  return `/images/cards/card_${cardId}_art.png?v=${revision}`;
}

export function hasCardArt(cardId: number): boolean {
  return cardId >= 1 && cardId <= TOTAL_CARDS;
}
