import { NextRequest, NextResponse } from "next/server";

import { isDevMockMode } from "@/lib/dev/mock-mode";
import { resetDraw } from "@/lib/draw/service";
import { resolveTelegramAuth } from "@/lib/telegram/validate";

export async function POST(request: NextRequest) {
  if (!isDevMockMode()) {
    return NextResponse.json(
      { error: "Draw reset is only available in dev mock mode" },
      { status: 403 },
    );
  }

  try {
    const initData = request.headers.get("x-telegram-init-data");
    const { user } = resolveTelegramAuth(initData);
    const status = await resetDraw(user);

    return NextResponse.json({
      ...status,
      mockMode: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reset draw state";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
