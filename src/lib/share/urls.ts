function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = trimTrailingSlash(base);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/** App invite link inside share text: bot link preferred, then site URL. */
export function getAppShareUrl(): string {
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL;
  if (botUrl) {
    return trimTrailingSlash(botUrl);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl ? trimTrailingSlash(appUrl) : "";
}

/** Public site origin for card pages and assets. */
export function getSiteBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return appUrl ? trimTrailingSlash(appUrl) : "";
}

/** Direct link to a card preview page. */
export function getCardShareUrl(cardId: number): string {
  const base = getSiteBaseUrl();
  if (!base) {
    return "";
  }

  return joinUrl(base, `/card/${cardId}`);
}

export function getCardArtAbsoluteUrl(artPath: string): string {
  const base = getSiteBaseUrl();
  if (!base) {
    return artPath;
  }

  return joinUrl(base, artPath);
}
