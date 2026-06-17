import { getCardArtPath } from "@/lib/cards";
import { prepareCardForReels } from "@/lib/share/reels";
import {
  buildAppInviteText,
  buildCardShareText,
  buildReelsCaption,
} from "@/lib/share/text";
import {
  shareCardToTelegramStory,
  shareViaTelegramChat,
} from "@/lib/share/telegram";
import {
  getAppShareUrl,
  getCardArtAbsoluteUrl,
  getCardShareUrl,
} from "@/lib/share/urls";
import type { Card } from "@/types/card";

export { buildCardShareText } from "@/lib/share/text";

export type ShareResult = {
  ok: boolean;
  message: string;
};

export async function shareCardWithFriend(card: Card): Promise<ShareResult> {
  const text = buildCardShareText(card);
  const url = getCardShareUrl(card.id);
  const shared = await shareViaTelegramChat(text, url);

  return {
    ok: shared,
    message: shared
      ? "Выберите чат — друг получит ссылку на эту карту"
      : "Скопировали текст и ссылку на карту — вставьте в чат",
  };
}

export async function shareAppWithFriend(): Promise<ShareResult> {
  const text = buildAppInviteText();
  const url = getAppShareUrl("share_app_invite");
  const shared = await shareViaTelegramChat(text, url);

  return {
    ok: shared,
    message: shared
      ? "Выберите чат — друг получит ссылку на приложение"
      : "Скопировали приглашение — отправьте другу",
  };
}

export async function shareCardForSocial(card: Card): Promise<ShareResult> {
  const appUrl = getAppShareUrl("share_story");
  const mediaUrl = getCardArtAbsoluteUrl(card.id, getCardArtPath(card.id));
  const storyText = `TANTREE · ${card.title}`;

  const sharedToStory = shareCardToTelegramStory(mediaUrl, storyText, appUrl);
  if (sharedToStory) {
    return {
      ok: true,
      message:
        "Откройте редактор Stories — ссылка ведёт в приложение, друг пройдёт свой путь",
    };
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
      message: `Текст скопирован (${buildReelsCaption(card).slice(0, 40)}…). Сохраните картинку карты вручную`,
    };
  }

  return {
    ok: false,
    message: "Не удалось подготовить материалы — попробуйте ещё раз",
  };
}

/** @deprecated Use shareCardForSocial instead */
export async function shareCardToTelegram(card: Card): Promise<boolean> {
  const result = await shareCardForSocial(card);
  return result.ok;
}
