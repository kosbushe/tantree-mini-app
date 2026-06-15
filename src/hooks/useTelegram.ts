"use client";

import { useCallback, useEffect, useState } from "react";

import { parseTelegramUserId, getClientMockUserId } from "@/lib/telegram/parse-user";

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData: string;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

function resolveUserId(initData: string): number | null {
  const parsedId = parseTelegramUserId(initData);
  if (parsedId) {
    return parsedId;
  }

  if (process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === "true") {
    return getClientMockUserId();
  }

  return null;
}

export function useTelegram() {
  const [initData, setInitData] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    const nextInitData = webApp?.initData ?? "";

    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

    setInitData(nextInitData);
    setUserId(resolveUserId(nextInitData));
    setIsReady(true);
  }, []);

  const hapticImpact = useCallback((style: "light" | "medium" | "heavy" = "medium") => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  }, []);

  return { initData, userId, isReady, hapticImpact };
}
