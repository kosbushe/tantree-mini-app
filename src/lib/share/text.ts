import type { Card } from "@/types/card";

import { getAppShareUrl, getCardShareUrl } from "@/lib/share/urls";

export function buildCardShareText(card: Card): string {
  const cardUrl = getCardShareUrl(card.id);

  return [
    `TANTREE · ${card.title}`,
    "",
    `«${card.quote}»`,
    `— ${card.author}`,
    "",
    `🎯 ${card.focus}`,
    "",
    "Посмотреть карту:",
    cardUrl,
    "",
    "by Ksenia Bushe",
  ].join("\n");
}

export function buildAppInviteText(): string {
  const appUrl = getAppShareUrl("share_app_invite");

  return [
    "🪐 TANTREE — тантрические метафорические карты",
    "",
    "Вытяни свою честную карту дня и пройди свой путь сонастройки с собой.",
    "",
    "Открыть приложение:",
    appUrl,
    "",
    "by Ksenia Bushe",
  ].join("\n");
}

export function buildReelsCaption(card: Card): string {
  const appUrl = getAppShareUrl("share_reels");

  return [
    `TANTREE · ${card.title}`,
    "",
    `«${card.quote}»`,
    "",
    "Вытяни свою карту дня и пройди свой путь 👇",
    appUrl,
    "",
    "#tantree #картынатен #осознанность",
  ].join("\n");
}
