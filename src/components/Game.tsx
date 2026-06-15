"use client";

import { useCallback, useEffect, useState } from "react";

import { AppLoader, AppLoaderScreen } from "@/components/AppLoader";
import { HomeAuthorCredit } from "@/components/BrandHeader";
import { CardExperience } from "@/components/CardExperience";
import { Deck } from "@/components/Deck";
import { DynamicWisdom } from "@/components/DynamicWisdom";
import { TantreeOfficialLogo } from "@/components/TantreeOfficialLogo";
import { useTelegram } from "@/hooks/useTelegram";
import { pickRandomCardId } from "@/lib/cards";
import { getNextDrawAtIso, getTodayDrawDate } from "@/lib/daily-draw";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Card } from "@/types/card";

type ScreenMode = "deck" | "card";

interface GameProps {
  cards: Card[];
}

function HomeLoader() {
  return <AppLoader />;
}

export function Game({ cards }: GameProps) {
  const { initData, userId, isMounted, isReady, hapticImpact } = useTelegram();
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>("deck");
  const [canDrawToday, setCanDrawToday] = useState(false);
  const [nextDrawAt, setNextDrawAt] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const cardsById = useCallback(
    (cardId: number) => cards.find((card) => card.id === cardId) ?? null,
    [cards],
  );

  const loadTodayDraw = useCallback(async () => {
    if (!userId) {
      throw new Error("Не удалось определить Telegram ID пользователя");
    }

    const supabase = getSupabaseBrowser();
    const today = getTodayDrawDate();

    const { data, error: fetchError } = await supabase
      .from("daily_draws")
      .select("card_id")
      .eq("telegram_id", userId)
      .eq("draw_date", today)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (data) {
      const existingCard = cardsById(data.card_id);
      if (!existingCard) {
        throw new Error(`Карта ${data.card_id} не найдена в колоде`);
      }

      setActiveCard(existingCard);
      setCanDrawToday(false);
      setNextDrawAt(getNextDrawAtIso());
      return;
    }

    setActiveCard(null);
    setCanDrawToday(true);
    setNextDrawAt(null);
    setScreenMode("deck");
  }, [userId, cardsById]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setIsMockMode(process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === "true");
    setIsLoading(true);
    setError(null);

    loadTodayDraw()
      .catch((loadError: Error) => {
        setError(loadError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isReady, loadTodayDraw]);

  const handleDraw = useCallback(async () => {
    if (isDrawing || !canDrawToday || !userId) {
      return;
    }

    setIsDrawing(true);
    setError(null);
    hapticImpact("medium");

    const cardId = pickRandomCardId();
    const card = cardsById(cardId);

    if (!card) {
      setError(`Карта ${cardId} не найдена`);
      setIsDrawing(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowser();
      const today = getTodayDrawDate();

      const { error: insertError } = await supabase.from("daily_draws").insert({
        telegram_id: userId,
        draw_date: today,
        card_id: cardId,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          await loadTodayDraw();
          return;
        }
        throw new Error(insertError.message);
      }

      setActiveCard(card);
      setCanDrawToday(false);
      setNextDrawAt(getNextDrawAtIso());
      setScreenMode("card");
    } catch (drawError) {
      setError(
        drawError instanceof Error ? drawError.message : "Ошибка вытягивания",
      );
    } finally {
      setIsDrawing(false);
    }
  }, [
    isDrawing,
    canDrawToday,
    userId,
    cardsById,
    hapticImpact,
    loadTodayDraw,
  ]);

  const handleOpenCard = useCallback(async () => {
    if (canDrawToday) {
      await handleDraw();
      return;
    }

    if (activeCard) {
      hapticImpact("light");
      setScreenMode("card");
    }
  }, [canDrawToday, activeCard, handleDraw, hapticImpact]);

  const handleCloseCard = useCallback(() => {
    setScreenMode("deck");
  }, []);

  const handleResetCooldown = useCallback(async () => {
    if (isResetting || !userId) {
      return;
    }

    setIsResetting(true);
    setError(null);
    hapticImpact("light");

    try {
      if (process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === "true") {
        const supabase = getSupabaseBrowser();
        const { error: deleteError } = await supabase
          .from("daily_draws")
          .delete()
          .eq("telegram_id", userId)
          .eq("draw_date", getTodayDrawDate());

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      } else {
        const response = await fetch("/api/draw/reset", {
          method: "POST",
          headers: {
            "x-telegram-init-data": initData,
          },
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Не удалось сбросить кулдаун");
        }
      }

      setActiveCard(null);
      setCanDrawToday(true);
      setNextDrawAt(null);
      setScreenMode("deck");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Ошибка сброса кулдауна",
      );
    } finally {
      setIsResetting(false);
    }
  }, [initData, isResetting, userId, hapticImpact]);

  if (!isMounted) {
    return <AppLoaderScreen />;
  }

  if (screenMode === "card" && activeCard) {
    return (
      <CardExperience
        key={activeCard.id}
        card={activeCard}
        nextDrawAt={nextDrawAt}
        onClose={handleCloseCard}
        onHaptic={hapticImpact}
        onResetCooldown={handleResetCooldown}
        isResetting={isResetting}
        showDevReset={isMockMode}
      />
    );
  }

  const canOpenCard = Boolean(canDrawToday || activeCard);
  const isOpening = isDrawing;

  return (
    <div className="flex h-dvh max-h-dvh w-full flex-col items-center overflow-hidden bg-[#000000] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.375rem,env(safe-area-inset-top))]">
      {isMockMode ? (
        <p className="absolute right-4 top-[max(0.5rem,env(safe-area-inset-top))] z-10 font-raleway text-[0.48rem] font-light uppercase tracking-[0.22em] text-zinc-700">
          mock
        </p>
      ) : null}

      <main className="flex min-h-0 w-full flex-1 flex-col items-center">
        {isLoading ? (
          <HomeLoader />
        ) : (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-1">
              <div className="flex shrink-0 flex-col items-center">
                {canDrawToday ? (
                  <Deck
                    variant="home"
                    onDraw={handleDraw}
                    isDrawing={isDrawing}
                    disabled={isDrawing}
                  />
                ) : (
                  <TantreeOfficialLogo className="w-full max-w-[96vw]" />
                )}

                <HomeAuthorCredit className="mt-4" />
              </div>
            </div>

            <div className="flex w-full max-w-md shrink-0 flex-col items-center pb-2">
              {error ? (
                <p className="mt-1.5 text-center text-xs text-red-400/90">
                  {error}
                </p>
              ) : null}

              {canOpenCard ? (
                <button
                  type="button"
                  onClick={handleOpenCard}
                  disabled={isOpening}
                  className="mt-3 w-full max-w-[300px] rounded-full border border-[#c5a059]/55 bg-[#c5a059]/12 px-6 py-3 font-raleway text-xs font-normal uppercase tracking-[0.2em] text-[#f5e6c8] shadow-[0_4px_24px_rgba(197,160,89,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-[#c5a059]/80 hover:bg-[#c5a059]/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isOpening ? "Карта открывается..." : "Открыть честную карту"}
                </button>
              ) : null}

              {canDrawToday ? (
                <p className="mt-1.5 font-raleway text-[0.55rem] font-light uppercase tracking-[0.22em] text-zinc-600">
                  или коснись колоды
                </p>
              ) : null}
            </div>
          </>
        )}
      </main>

      {!isLoading ? (
        <div className="w-full max-w-sm shrink-0 px-2 pb-0.5">
          <DynamicWisdom cards={cards} compact />
        </div>
      ) : null}
    </div>
  );
}
