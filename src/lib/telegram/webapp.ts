export interface TelegramWebAppUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData: string;
  initDataUnsafe?: {
    user?: TelegramWebAppUser;
  };
  platform?: string;
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

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp ?? null;
}

export function isInsideTelegram(webApp: TelegramWebApp | null): boolean {
  if (!webApp) {
    return false;
  }

  if (typeof webApp.initDataUnsafe?.user?.id === "number") {
    return true;
  }

  if (webApp.initData) {
    return true;
  }

  const platform = webApp.platform;
  return Boolean(platform && platform !== "unknown");
}
