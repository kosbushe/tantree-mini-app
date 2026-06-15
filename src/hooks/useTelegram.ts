"use client";

import { useCallback, useEffect, useState } from "react";

import {
  resolveTelegramInitData,
  resolveTelegramUserId,
} from "@/lib/telegram/resolve-user";
import { getTelegramWebApp } from "@/lib/telegram/webapp";

export function useTelegram() {
  const [initData, setInitData] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function syncFromWebApp() {
      const webApp = getTelegramWebApp();

      if (webApp) {
        webApp.ready();
        webApp.expand();
      }

      setInitData(resolveTelegramInitData(webApp));
      setUserId(resolveTelegramUserId(webApp));
      setIsReady(true);
    }

    syncFromWebApp();

    const retryTimer = window.setTimeout(syncFromWebApp, 150);

    return () => {
      window.clearTimeout(retryTimer);
    };
  }, []);

  const hapticImpact = useCallback((style: "light" | "medium" | "heavy" = "medium") => {
    getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
  }, []);

  return { initData, userId, isReady, hapticImpact };
}
