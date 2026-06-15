import type { Card } from "@/types/card";

const STORAGE_PREFIX = "tantree:mock-draw";

export interface DrawStatusResponse {
  canDraw: boolean;
  nextDrawAt: string | null;
  lastDraw: { cardId: number; drawnAt: string } | null;
  card: Card | null;
  mockMode?: boolean;
}

function storageKey(userId: number): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function saveMockDrawStatus(
  userId: number,
  status: DrawStatusResponse,
): void {
  if (typeof window === "undefined" || !status.mockMode) {
    return;
  }

  window.localStorage.setItem(
    storageKey(userId),
    JSON.stringify({
      status,
      savedAt: new Date().toISOString(),
    }),
  );
}

export function loadMockDrawStatus(userId: number): DrawStatusResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { status: DrawStatusResponse };
    return parsed.status ?? null;
  } catch {
    return null;
  }
}

export function clearMockDrawCache(userId: number): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey(userId));
}

export function clearAllMockDrawCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

function isCooldownActive(status: DrawStatusResponse): boolean {
  if (status.canDraw || !status.nextDrawAt) {
    return false;
  }

  return new Date(status.nextDrawAt).getTime() > Date.now();
}

export function mergeMockDrawStatus(
  userId: number,
  apiStatus: DrawStatusResponse,
): DrawStatusResponse {
  if (!apiStatus.mockMode) {
    return apiStatus;
  }

  // Server is the source of truth when a new draw is allowed.
  if (apiStatus.canDraw) {
    saveMockDrawStatus(userId, apiStatus);
    return apiStatus;
  }

  const cached = loadMockDrawStatus(userId);
  if (!cached) {
    saveMockDrawStatus(userId, apiStatus);
    return apiStatus;
  }

  const apiCooldown = isCooldownActive(apiStatus);
  const cachedCooldown = isCooldownActive(cached);

  if (apiCooldown && cachedCooldown) {
    const apiNext = new Date(apiStatus.nextDrawAt!).getTime();
    const cachedNext = new Date(cached.nextDrawAt!).getTime();
    const merged = apiNext >= cachedNext ? apiStatus : cached;
    saveMockDrawStatus(userId, merged);
    return merged;
  }

  const merged = apiCooldown ? apiStatus : cached;
  saveMockDrawStatus(userId, merged);
  return merged;
}

export const MOCK_USER_ID = 123456789;
