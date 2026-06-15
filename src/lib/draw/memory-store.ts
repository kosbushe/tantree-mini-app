import type { TelegramUser } from "@/lib/telegram/validate";

import type { DrawRecord } from "./types";

interface MemoryUser extends TelegramUser {
  updatedAt: string;
}

interface MemoryStoreState {
  users: Map<number, MemoryUser>;
  draws: Map<number, DrawRecord>;
}

declare global {
  // eslint-disable-next-line no-var
  var __tantreeMemoryStore: MemoryStoreState | undefined;
}

function getStore(): MemoryStoreState {
  if (!global.__tantreeMemoryStore) {
    global.__tantreeMemoryStore = {
      users: new Map(),
      draws: new Map(),
    };
  }

  return global.__tantreeMemoryStore;
}

export function memoryUpsertUser(user: TelegramUser): void {
  const store = getStore();

  store.users.set(user.id, {
    ...user,
    updatedAt: new Date().toISOString(),
  });
}

export function memoryGetLatestDraw(userId: number): DrawRecord | null {
  return getStore().draws.get(userId) ?? null;
}

export function memoryRecordDraw(userId: number, record: DrawRecord): void {
  getStore().draws.set(userId, record);
}

export function memoryClearUser(userId: number): void {
  const store = getStore();
  store.users.delete(userId);
  store.draws.delete(userId);
}
