import {
  buildShareTitle,
  buildUniversalShareText,
  buildWebShareText,
} from "@/lib/share/text";
import { getAppShareUrl, getCardShareUrl } from "@/lib/share/urls";
import type { Card } from "@/types/card";

export type ShareResult = {
  ok: boolean;
  message: string;
  fallbackText?: string;
};

export async function shareCard(card: Card): Promise<ShareResult> {
  const cardUrl = getCardShareUrl(card.id);
  const appUrl = getAppShareUrl();

  if (!cardUrl || !appUrl) {
    return {
      ok: false,
      message:
        "Шаринг недоступен: задайте NEXT_PUBLIC_APP_URL и NEXT_PUBLIC_TELEGRAM_BOT_URL",
    };
  }

  const title = buildShareTitle(card);
  const webShareText = buildWebShareText(card);
  const clipboardText = buildUniversalShareText(card);

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title,
        text: webShareText,
        url: cardUrl,
      });
      return { ok: true, message: "Выберите, куда отправить карту" };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, message: "" };
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(clipboardText);
      return { ok: true, message: "Текст для отправки скопирован" };
    } catch {
      // fall through
    }
  }

  return {
    ok: false,
    message:
      "Не удалось открыть меню поделиться. Скопируйте ссылку вручную.",
    fallbackText: clipboardText,
  };
}
