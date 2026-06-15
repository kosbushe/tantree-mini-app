"use client";

import { useCallback, useEffect, useState } from "react";

import { useIsMounted } from "@/hooks/useIsMounted";
import {
  resolveTelegramInitData,
  resolveTelegramUserId,
} from "@/lib/telegram/resolve-user";
import { getTelegramWebApp } from "@/lib/telegram/webapp";

export function useTelegram() {
  const isMounted = useIsMounted();
  const [initData, setInitData] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

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
  }, [isMounted]);

  const hapticImpact = useCallback((style: "light" | "medium" | "heavy" = "medium") => {
    getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
  }, []);

  return { initData, userId, isMounted, isReady, hapticImpact };
}
