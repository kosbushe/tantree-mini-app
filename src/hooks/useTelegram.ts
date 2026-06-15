"use client";

import { useCallback, useEffect, useState } from "react";

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

export function useTelegram() {
  const [initData, setInitData] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (webApp) {
      webApp.ready();
      webApp.expand();
      setInitData(webApp.initData);
    }

    setIsReady(true);
  }, []);

  const hapticImpact = useCallback((style: "light" | "medium" | "heavy" = "medium") => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  }, []);

  return { initData, isReady, hapticImpact };
}
