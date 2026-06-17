interface TelegramShareWebApp {
  shareToStory?: (
    mediaUrl: string,
    params?: { text?: string; widget_link?: { url: string; name: string } },
  ) => void;
  openTelegramLink?: (url: string) => void;
  isVersionAtLeast?: (version: string) => boolean;
}

function getWebApp(): TelegramShareWebApp | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.Telegram?.WebApp as TelegramShareWebApp | undefined;
}

function buildTelegramShareLink(text: string, url: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

async function openShareSheet(text: string, url: string): Promise<boolean> {
  const webApp = getWebApp();

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(buildTelegramShareLink(text, url));
    return true;
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "TANTREE",
        text,
        url,
      });
      return true;
    } catch {
      return false;
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${text}\n\n${url}`);
    return true;
  }

  return false;
}

export async function shareViaTelegramChat(
  text: string,
  url: string,
): Promise<boolean> {
  return openShareSheet(text, url);
}

export function shareCardToTelegramStory(
  mediaUrl: string,
  storyText: string,
  appUrl: string,
): boolean {
  const webApp = getWebApp();

  if (!webApp?.isVersionAtLeast?.("7.8") || !webApp.shareToStory) {
    return false;
  }

  webApp.shareToStory(mediaUrl, {
    text: storyText,
    widget_link: {
      url: appUrl,
      name: "TANTREE",
    },
  });

  return true;
}
