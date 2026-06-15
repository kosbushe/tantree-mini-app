import { NextRequest, NextResponse } from "next/server";

import { DrawCooldownError, drawCard } from "@/lib/draw/service";
import { isDevMockMode } from "@/lib/dev/mock-mode";
import { resolveTelegramAuth } from "@/lib/telegram/validate";

export async function POST(request: NextRequest) {
  try {
    const initData = request.headers.get("x-telegram-init-data");
    const { user } = resolveTelegramAuth(initData);
    const result = await drawCard(user);

    return NextResponse.json({
      card: result.card,
      status: result.status,
      mockMode: isDevMockMode(),
    });
  } catch (error) {
    if (error instanceof DrawCooldownError) {
      return NextResponse.json(
        {
          error: error.message,
          nextDrawAt: error.nextDrawAt,
          status: error.status,
          mockMode: isDevMockMode(),
        },
        { status: 429 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to draw card";

    const status = message.includes("initData") || message.includes("Telegram")
      ? 401
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
