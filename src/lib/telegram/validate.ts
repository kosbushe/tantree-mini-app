import crypto from "crypto";

import { isDevMockMode } from "@/lib/dev/mock-mode";

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export interface TelegramAuthResult {
  user: TelegramUser;
  authDate: number;
}

function parseUser(raw: string): TelegramUser {
  const parsed = JSON.parse(raw) as TelegramUser;
  if (!parsed.id) {
    throw new Error("Invalid Telegram user payload");
  }
  return parsed;
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
): TelegramAuthResult {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Missing Telegram hash");
  }

  const authDate = Number(params.get("auth_date"));
  if (!authDate) {
    throw new Error("Missing Telegram auth_date");
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new Error("Missing Telegram user");
  }

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) {
    throw new Error("Invalid Telegram initData signature");
  }

  const maxAgeSeconds = 60 * 60 * 24;
  if (Date.now() / 1000 - authDate > maxAgeSeconds) {
    throw new Error("Telegram initData expired");
  }

  return {
    user: parseUser(userRaw),
    authDate,
  };
}

function getMockUser(): TelegramUser {
  const mockUserId = Number(
    process.env.DEV_MOCK_USER_ID ??
      process.env.NEXT_PUBLIC_MOCK_USER_ID ??
      process.env.MOCK_USER_ID ??
      "123456789",
  );

  return {
    id: mockUserId,
    first_name: "Dev",
    username: "dev_user",
  };
}

export function resolveTelegramAuth(
  initData: string | null,
): TelegramAuthResult {
  if (isDevMockMode()) {
    return {
      user: getMockUser(),
      authDate: Math.floor(Date.now() / 1000),
    };
  }

  if (!initData) {
    throw new Error("Missing Telegram initData");
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }

  return validateTelegramInitData(initData, botToken);
}
