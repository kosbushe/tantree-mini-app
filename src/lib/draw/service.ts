import { getCardById, pickRandomCardId } from "@/lib/cards";
import { getNextDrawAtIso, getTodayDrawDate } from "@/lib/daily-draw";
import { isDevMockMode } from "@/lib/dev/mock-mode";
import {
  memoryClearUser,
  memoryGetLatestDraw,
  memoryRecordDraw,
  memoryUpsertUser,
} from "@/lib/draw/memory-store";
import { type DrawStatus } from "@/lib/draw/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TelegramUser } from "@/lib/telegram/validate";
import type { Card } from "@/types/card";

async function upsertUser(user: TelegramUser): Promise<void> {
  if (isDevMockMode()) {
    memoryUpsertUser(user);
    return;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      username: user.username ?? null,
      first_name: user.first_name ?? null,
      last_name: user.last_name ?? null,
      language_code: user.language_code ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }
}

async function getTodayDraw(userId: number): Promise<number | null> {
  if (isDevMockMode()) {
    const lastDraw = memoryGetLatestDraw(userId);
    if (!lastDraw) {
      return null;
    }

    const drawnDate = new Date(lastDraw.drawnAt).toLocaleDateString("en-CA");
    return drawnDate === getTodayDrawDate() ? lastDraw.cardId : null;
  }

  const supabase = getSupabaseAdmin();
  const today = getTodayDrawDate();

  const { data, error } = await supabase
    .from("daily_draws")
    .select("card_id")
    .eq("telegram_id", userId)
    .eq("draw_date", today)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch daily draw: ${error.message}`);
  }

  return data?.card_id ?? null;
}

async function recordTodayDraw(userId: number, cardId: number): Promise<void> {
  const today = getTodayDrawDate();
  const drawnAt = new Date().toISOString();

  if (isDevMockMode()) {
    memoryRecordDraw(userId, { cardId, drawnAt });
    return;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("daily_draws").insert({
    telegram_id: userId,
    draw_date: today,
    card_id: cardId,
  });

  if (error) {
    throw new Error(`Failed to record daily draw: ${error.message}`);
  }
}

function buildStatus(cardId: number | null): DrawStatus {
  if (!cardId) {
    return {
      canDraw: true,
      nextDrawAt: null,
      lastDraw: null,
      card: null,
    };
  }

  const card = getCardById(cardId) ?? null;

  return {
    canDraw: false,
    nextDrawAt: getNextDrawAtIso(),
    lastDraw: card
      ? { cardId: card.id, drawnAt: new Date().toISOString() }
      : null,
    card,
  };
}

export async function getDrawStatus(user: TelegramUser): Promise<DrawStatus> {
  await upsertUser(user);
  const cardId = await getTodayDraw(user.id);
  return buildStatus(cardId);
}

export async function drawCard(user: TelegramUser): Promise<{
  status: DrawStatus;
  card: Card;
}> {
  await upsertUser(user);

  const existingCardId = await getTodayDraw(user.id);
  if (existingCardId) {
    const status = buildStatus(existingCardId);
    throw new DrawCooldownError(status.nextDrawAt!, status);
  }

  const cardId = pickRandomCardId();
  const card = getCardById(cardId);

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  await recordTodayDraw(user.id, cardId);

  return {
    status: buildStatus(cardId),
    card,
  };
}

export async function resetDraw(user: TelegramUser): Promise<DrawStatus> {
  if (!isDevMockMode()) {
    throw new Error("Draw reset is only available in dev mock mode");
  }

  memoryClearUser(user.id);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("daily_draws")
    .delete()
    .eq("telegram_id", user.id)
    .eq("draw_date", getTodayDrawDate());

  if (error) {
    throw new Error(`Failed to reset daily draw: ${error.message}`);
  }

  return buildStatus(null);
}

export class DrawCooldownError extends Error {
  nextDrawAt: string;
  status: DrawStatus;

  constructor(nextDrawAt: string, status: DrawStatus) {
    super("Card already drawn today");
    this.name = "DrawCooldownError";
    this.nextDrawAt = nextDrawAt;
    this.status = status;
  }
}
