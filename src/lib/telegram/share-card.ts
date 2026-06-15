import { getCardArtPath } from "@/lib/cards";
import type { Card } from "@/types/card";

interface TelegramShareWebApp {
  shareToStory?: (
    mediaUrl: string,
    params?: { text?: string; widget_link?: { url: string; name: string } },
  ) => void;
  openTelegramLink?: (url: string) => void;
  isVersionAtLeast?: (version: string) => boolean;
}

function getCardArtAbsoluteUrl(cardId: number): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${getCardArtPath(cardId)}`;
}

function getBotShareUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? window.location.href;
}

function buildTelegramShareLink(text: string): string {
  const botUrl = getBotShareUrl();
  return `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;
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
  const webApp = window.Telegram?.WebApp as TelegramShareWebApp | undefined;

  const text = buildCardShareText(card);
  const mediaUrl = getCardArtAbsoluteUrl(card.id);

  if (webApp && webApp.isVersionAtLeast && webApp.isVersionAtLeast("7.8")) {
    webApp.shareToStory?.(mediaUrl, {
      text: `TANTREE · ${card.title}`,
      widget_link: {
        url: window.location.href,
        name: "TANTREE",
      },
    });
    return true;
  }

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(buildTelegramShareLink(text));
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
