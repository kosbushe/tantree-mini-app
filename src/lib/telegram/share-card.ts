import { getCardArtPath } from "@/lib/cards";
import { prepareCardForReels } from "@/lib/share/reels";
import { buildReelsCaption } from "@/lib/share/text";
import { shareCardToTelegramStory } from "@/lib/share/telegram";
import { getAppShareUrl, getCardArtAbsoluteUrl } from "@/lib/share/urls";
import { shareCard, type ShareResult } from "@/lib/share/web-share";
import type { Card } from "@/types/card";

export { shareCard, type ShareResult };

export async function shareCardForSocial(card: Card): Promise<ShareResult> {
  const appUrl = getAppShareUrl();
  const mediaUrl = getCardArtAbsoluteUrl(getCardArtPath(card.id));
  const storyText = `TANTREE · ${card.title}`;

  if (appUrl) {
    const sharedToStory = shareCardToTelegramStory(mediaUrl, storyText, appUrl);
    if (sharedToStory) {
      return {
        ok: true,
        message:
          "Откройте редактор Stories — ссылка ведёт в приложение, друг пройдёт свой путь",
      };
    }
  }

  const { downloaded, captionCopied } = await prepareCardForReels(card);

  if (downloaded && captionCopied) {
    return {
      ok: true,
      message:
        "Картинка сохранена, текст с ссылкой на приложение скопирован. Загрузите в Reels или Stories",
    };
  }

  if (captionCopied) {
    return {
      ok: true,
      message:
        "Текст скопирован. Сохраните картинку карты вручную и загрузите в Reels или Stories",
    };
  }

  return {
    ok: false,
    message: "Не удалось подготовить материалы — попробуйте ещё раз",
    fallbackText: buildReelsCaption(card),
  };
}
