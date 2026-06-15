import { NextRequest, NextResponse } from "next/server";

import { getDrawStatus } from "@/lib/draw/service";
import { isDevMockMode } from "@/lib/dev/mock-mode";
import { resolveTelegramAuth } from "@/lib/telegram/validate";

export async function GET(request: NextRequest) {
  try {
    const initData = request.headers.get("x-telegram-init-data");
    const { user } = resolveTelegramAuth(initData);
    const status = await getDrawStatus(user);

    return NextResponse.json({
      ...status,
      mockMode: isDevMockMode(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch draw status";

    return NextResponse.json({ error: message }, { status: 401 });
  }
}
