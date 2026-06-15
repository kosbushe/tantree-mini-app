import { getCardArtPath } from "@/lib/cards";
import type { Card } from "@/types/card";

function getCardArtAbsoluteUrl(cardId: number): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${getCardArtPath(cardId)}`;
}

export function buildCardShareText(card: Card): string {
  return [
    `TANTREE · ${card.title}`,
    "",
    `«${card.quote}»`,
    `— ${card.author}`,
    "",
    `🎯 ${card.focus}`,
    "",
    "by Ksenia Bushe",
  ].join("\n");
}

export async function shareCardToTelegram(card: Card): Promise<boolean> {
  const webApp = window.Telegram?.WebApp as
    | {
        shareToStory?: (
          mediaUrl: string,
          params?: { text?: string; widget_link?: { url: string; name: string } },
        ) => void;
        openTelegramLink?: (url: string) => void;
      }
    | undefined;

  const text = buildCardShareText(card);
  const mediaUrl = getCardArtAbsoluteUrl(card.id);

  if (webApp?.shareToStory) {
    webApp.shareToStory(mediaUrl, {
      text: `TANTREE · ${card.title}`,
      widget_link: {
        url: window.location.href,
        name: "TANTREE",
      },
    });
    return true;
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: `TANTREE — ${card.title}`,
        text,
        url: window.location.href,
      });
      return true;
    } catch {
      return false;
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}
