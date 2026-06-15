export function parseTelegramUserId(initData: string): number | null {
  if (!initData) {
    return null;
  }

  try {
    const userRaw = new URLSearchParams(initData).get("user");
    if (!userRaw) {
      return null;
    }

    const user = JSON.parse(userRaw) as { id?: number };
    return typeof user.id === "number" ? user.id : null;
  } catch {
    return null;
  }
}

export function getClientMockUserId(): number {
  return Number(process.env.NEXT_PUBLIC_MOCK_USER_ID ?? "123456789");
}
