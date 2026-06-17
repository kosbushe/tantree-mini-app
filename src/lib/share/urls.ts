function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const configured =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.TELEGRAM_WEBAPP_URL;

  return configured ? trimTrailingSlash(configured) : "";
}

/** Primary link for inviting friends into the mini app (bot link preferred). */
export function getAppShareUrl(source = "share_app"): string {
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL;
  const base = botUrl ? trimTrailingSlash(botUrl) : getAppOrigin();

  if (!base) {
    return "";
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}utm_source=${encodeURIComponent(source)}`;
}

/** Public page where a friend can read this card without drawing it. */
export function getCardShareUrl(cardId: number): string {
  const origin = getAppOrigin();
  return `${origin}/card/${cardId}?utm_source=share_card`;
}

export function getCardArtAbsoluteUrl(cardId: number, artPath: string): string {
  const origin = getAppOrigin();
  return `${origin}${artPath}`;
}
