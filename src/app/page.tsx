import { Game } from "@/components/Game";
import type { Card } from "@/types/card";

import cardsData from "../../cards.json";

const cards = cardsData as Card[];

export default function Home() {
  return <Game cards={cards} />;
}
