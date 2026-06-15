import type { Card } from "@/types/card";

export interface WisdomQuote {
  quote: string;
  author: string;
}

function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyWisdomIndex(cards: Card[], date = new Date()): number {
  if (cards.length === 0) {
    return 0;
  }
  return hashDateKey(getDateKey(date)) % cards.length;
}

export function getDailyWisdom(cards: Card[], date = new Date()): WisdomQuote {
  const card = cards[getDailyWisdomIndex(cards, date)] ?? cards[0];
  return { quote: card.quote, author: card.author };
}
