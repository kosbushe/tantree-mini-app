import { getCardById, pickRandomCardId } from "@/lib/cards";
import { isDevMockMode } from "@/lib/dev/mock-mode";
import {
  memoryClearUser,
  memoryGetLatestDraw,
  memoryRecordDraw,
  memoryUpsertUser,
} from "@/lib/draw/memory-store";
import {
  DRAW_COOLDOWN_MS,
  type DrawRecord,
  type DrawStatus,
} from "@/lib/draw/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TelegramUser } from "@/lib/telegram/validate";
import type { Card } from "@/types/card";

function buildStatus(lastDraw: DrawRecord | null): DrawStatus {
  if (!lastDraw) {
    return {
      canDraw: true,
      nextDrawAt: null,
      lastDraw: null,
      card: null,
    };
  }

  const drawnAtMs = new Date(lastDraw.drawnAt).getTime();
  const nextDrawAtMs = drawnAtMs + DRAW_COOLDOWN_MS;
  const canDraw = Date.now() >= nextDrawAtMs;

  return {
    canDraw,
    nextDrawAt: canDraw ? null : new Date(nextDrawAtMs).toISOString(),
    lastDraw,
    card: getCardById(lastDraw.cardId) ?? null,
  };
}

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

async function getLatestDraw(userId: number): Promise<DrawRecord | null> {
  if (isDevMockMode()) {
    return memoryGetLatestDraw(userId);
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("card_draws")
    .select("card_id, drawn_at")
    .eq("user_id", userId)
    .order("drawn_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch draw history: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    cardId: data.card_id,
    drawnAt: data.drawn_at,
  };
}

async function recordDraw(userId: number, record: DrawRecord): Promise<void> {
  if (isDevMockMode()) {
    memoryRecordDraw(userId, record);
    return;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("card_draws").insert({
    user_id: userId,
    card_id: record.cardId,
    drawn_at: record.drawnAt,
  });

  if (error) {
    throw new Error(`Failed to record draw: ${error.message}`);
  }
}

export async function getDrawStatus(user: TelegramUser): Promise<DrawStatus> {
  await upsertUser(user);
  const lastDraw = await getLatestDraw(user.id);
  return buildStatus(lastDraw);
}

export async function drawCard(user: TelegramUser): Promise<{
  status: DrawStatus;
  card: Card;
}> {
  await upsertUser(user);

  const lastDraw = await getLatestDraw(user.id);
  const status = buildStatus(lastDraw);

  if (!status.canDraw) {
    throw new DrawCooldownError(status.nextDrawAt!, status);
  }

  const cardId = pickRandomCardId();
  const card = getCardById(cardId);

  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  const drawnAt = new Date().toISOString();
  await recordDraw(user.id, { cardId, drawnAt });

  const nextStatus: DrawStatus = {
    canDraw: false,
    nextDrawAt: new Date(Date.now() + DRAW_COOLDOWN_MS).toISOString(),
    lastDraw: { cardId, drawnAt },
    card,
  };

  return { status: nextStatus, card };
}

export async function resetDraw(user: TelegramUser): Promise<DrawStatus> {
  if (!isDevMockMode()) {
    throw new Error("Draw reset is only available in dev mock mode");
  }

  memoryClearUser(user.id);

  return {
    canDraw: true,
    nextDrawAt: null,
    lastDraw: null,
    card: null,
  };
}

export class DrawCooldownError extends Error {
  nextDrawAt: string;
  status: DrawStatus;

  constructor(nextDrawAt: string, status: DrawStatus) {
    super("Card already drawn within the last 24 hours");
    this.name = "DrawCooldownError";
    this.nextDrawAt = nextDrawAt;
    this.status = status;
  }
}
