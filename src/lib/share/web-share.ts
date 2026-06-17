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

const SHARE_DEBUG = process.env.NODE_ENV === "development";

function logShareDebug(message: string, data?: Record<string, unknown>): void {
  if (!SHARE_DEBUG) {
    return;
  }

  if (data) {
    console.log(`[share] ${message}`, data);
    return;
  }

  console.log(`[share] ${message}`);
}

function getShareEnvironment(): Record<string, unknown> {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    hasShare: typeof navigator.share === "function",
    hasCanShare: typeof navigator.canShare === "function",
    isSecureContext: window.isSecureContext,
    isAndroid: /Android/i.test(navigator.userAgent),
    isTelegramWebView: Boolean(window.Telegram?.WebApp?.initData),
  };
}

function canSharePayload(payload: ShareData): boolean {
  if (typeof navigator.canShare !== "function") {
    return Boolean(payload.url || payload.text || payload.title);
  }

  try {
    const canShare = navigator.canShare(payload);
    logShareDebug("canShare(payload)", { payload, canShare });
    return canShare;
  } catch (error) {
    const name = error instanceof Error ? error.name : "unknown";
    const message = error instanceof Error ? error.message : String(error);
    logShareDebug("canShare threw", { name, message, payload });
    return false;
  }
}

function buildSharePayloads(
  title: string,
  text: string,
  url: string,
): ShareData[] {
  const textWithUrl = `${text}\n\n${url}`;
  const isAndroid = /Android/i.test(navigator.userAgent);

  const payloads: ShareData[] = isAndroid
    ? [
        { title, url },
        { url },
        { title, text, url },
        { title, text: textWithUrl },
        { text: textWithUrl },
        { title, text },
        { text },
      ]
    : [
        { title, text, url },
        { title, url },
        { url },
        { title, text: textWithUrl },
        { text: textWithUrl },
        { title, text },
        { text },
      ];

  const seen = new Set<string>();

  return payloads.filter((payload) => {
    if (!payload.url && !payload.text && !payload.title) {
      return false;
    }

    const key = JSON.stringify(payload);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function tryWebShare(payloads: ShareData[]): Promise<"success" | "abort" | "failed"> {
  logShareDebug("environment", getShareEnvironment());

  if (typeof navigator.share !== "function") {
    logShareDebug("branch", { chosen: "clipboard-fallback", reason: "no navigator.share" });
    return "failed";
  }

  for (const payload of payloads) {
    if (!canSharePayload(payload)) {
      continue;
    }

    logShareDebug("attempt", { payload });

    try {
      await navigator.share(payload);
      logShareDebug("branch", { chosen: "web-share", payload });
      return "success";
    } catch (error) {
      const name = error instanceof Error ? error.name : "unknown";
      const message = error instanceof Error ? error.message : String(error);
      logShareDebug("share error", { name, message, payload });

      if (name === "AbortError") {
        logShareDebug("branch", { chosen: "abort", silent: true });
        return "abort";
      }
    }
  }

  logShareDebug("branch", {
    chosen: "clipboard-fallback",
    reason: "share unavailable or all payloads rejected",
  });
  return "failed";
}

function getClipboardFallbackMessage(): string {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isTelegramWebView = Boolean(window.Telegram?.WebApp?.initData);

  if (isAndroid || isTelegramWebView) {
    return "Текст и ссылка скопированы. Откройте Telegram или WhatsApp и вставьте сообщение.";
  }

  return "Текст для отправки скопирован";
}

export async function shareCard(card: Card): Promise<ShareResult> {
  const cardUrl = getCardShareUrl(card.id);
  const appUrl = getAppShareUrl();

  if (!cardUrl) {
    return {
      ok: false,
      message:
        "Шаринг недоступен: задайте NEXT_PUBLIC_APP_URL для публичных ссылок на карты",
    };
  }

  if (!appUrl) {
    logShareDebug("warning", {
      reason: "NEXT_PUBLIC_TELEGRAM_BOT_URL / NEXT_PUBLIC_APP_URL not set — share text without app link",
    });
  }

  const title = buildShareTitle(card);
  const webShareText = buildWebShareText(card);
  const clipboardText = buildUniversalShareText(card);
  const payloads = buildSharePayloads(title, webShareText, cardUrl);

  const outcome = await tryWebShare(payloads);

  if (outcome === "success") {
    return { ok: true, message: "Выберите, куда отправить карту" };
  }

  if (outcome === "abort") {
    return { ok: false, message: "" };
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(clipboardText);
      return { ok: true, message: getClipboardFallbackMessage() };
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
