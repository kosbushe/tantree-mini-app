import {
  getClientMockUserId,
  parseTelegramUserId,
} from "@/lib/telegram/parse-user";
import {
  getTelegramWebApp,
  isInsideTelegram,
  type TelegramWebApp,
} from "@/lib/telegram/webapp";

export function resolveTelegramUserId(webApp: TelegramWebApp | null): number | null {
  const unsafeId = webApp?.initDataUnsafe?.user?.id;
  if (typeof unsafeId === "number") {
    return unsafeId;
  }

  const initData = webApp?.initData ?? "";
  const parsedId = parseTelegramUserId(initData);
  if (parsedId) {
    return parsedId;
  }

  if (!isInsideTelegram(webApp) && process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === "true") {
    return getClientMockUserId();
  }

  return null;
}

export function resolveTelegramInitData(webApp: TelegramWebApp | null): string {
  return webApp?.initData ?? "";
}
