import type { Card } from "@/types/card";

import { getAppShareUrl, getCardShareUrl } from "@/lib/share/urls";

export function buildShareTitle(card: Card): string {
  return `Карта Tantree: ${card.title}`;
}

/** Full share body: card meaning + card URL + app URL (for clipboard fallback). */
export function buildUniversalShareText(card: Card): string {
  const appUrl = getAppShareUrl();
  const cardUrl = getCardShareUrl(card.id);

  const lines = [
    `Мне выпала карта «${card.title}».`,
    "",
    `«${card.quote}»`,
    "",
    "Это карта из Tantree — метафорические карты и практики присутствия.",
  ];

  if (cardUrl) {
    lines.push("", "Посмотреть карту:", cardUrl);
  }

  if (appUrl) {
    lines.push("", "Открыть приложение:", appUrl);
  }

  return lines.join("\n");
}

/** Shorter text for Web Share API (card URL passed separately via `url`). */
export function buildWebShareText(card: Card): string {
  const appUrl = getAppShareUrl();

  const lines = [
    `Мне выпала карта «${card.title}».`,
    "",
    `«${card.quote}»`,
    "",
    "Это карта из Tantree — метафорические карты и практики присутствия.",
  ];

  if (appUrl) {
    lines.push("", "Открыть приложение:", appUrl);
  }

  return lines.join("\n");
}

export function buildReelsCaption(card: Card): string {
  const appUrl = getAppShareUrl();

  const lines = [
    `TANTREE · ${card.title}`,
    "",
    `«${card.quote}»`,
    "",
    "Вытяни свою карту дня и пройди свой путь 👇",
  ];

  if (appUrl) {
    lines.push(appUrl);
  }

  lines.push("", "#tantree #картынатен #осознанность");

  return lines.join("\n");
}
