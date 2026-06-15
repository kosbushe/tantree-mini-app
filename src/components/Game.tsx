"use client";

import { useCallback, useEffect, useState } from "react";

import { HomeAuthorCredit } from "@/components/BrandHeader";
import { CardExperience } from "@/components/CardExperience";
import { Deck } from "@/components/Deck";
import { DynamicWisdom } from "@/components/DynamicWisdom";
import { TantreeOfficialLogo } from "@/components/TantreeOfficialLogo";
import {
  clearAllMockDrawCache,
  mergeMockDrawStatus,
  MOCK_USER_ID,
  saveMockDrawStatus,
  type DrawStatusResponse,
} from "@/lib/draw/mock-cache";
import { useTelegram } from "@/hooks/useTelegram";
import type { Card } from "@/types/card";

type ScreenMode = "deck" | "card";

interface GameProps {
  cards: Card[];
}

export function Game({ cards }: GameProps) {
  const { initData, isReady, hapticImpact } = useTelegram();
  const [status, setStatus] = useState<DrawStatusResponse | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>("deck");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const cardsById = useCallback(
    (cardId: number) => cards.find((card) => card.id === cardId) ?? null,
    [cards],
  );

  const applyStatus = useCallback(
    (payload: DrawStatusResponse) => {
      const merged = mergeMockDrawStatus(MOCK_USER_ID, payload);
      setStatus(merged);
      setIsMockMode(Boolean(merged.mockMode));

      if (merged.canDraw) {
        setActiveCard(null);
        setScreenMode("deck");
      } else if (!merged.canDraw && merged.lastDraw) {
        const existingCard =
          merged.card ?? cardsById(merged.lastDraw.cardId) ?? null;
        if (existingCard) {
          setActiveCard(existingCard);
        }
      }
    },
    [cardsById],
  );

  const fetchStatus = useCallback(async () => {
    setError(null);

    const response = await fetch("/api/draw/status", {
      headers: {
        "x-telegram-init-data": initData,
      },
    });

    const payload = (await response.json()) as DrawStatusResponse & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Не удалось загрузить статус");
    }

    applyStatus(payload);
  }, [initData, applyStatus]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setIsLoading(true);
    fetchStatus()
      .catch((fetchError: Error) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isReady, fetchStatus]);

  const handleDraw = useCallback(async () => {
    if (isDrawing || !status?.canDraw) {
      return;
    }

    setIsDrawing(true);
    setError(null);
    hapticImpact("medium");

    try {
      const response = await fetch("/api/draw", {
        method: "POST",
        headers: {
          "x-telegram-init-data": initData,
        },
      });

      const payload = (await response.json()) as {
        card?: Card;
        status?: DrawStatusResponse;
        error?: string;
        mockMode?: boolean;
      };

      if (!response.ok) {
        if (response.status === 429 && payload.status) {
          applyStatus(payload.status);
        }
        throw new Error(payload.error ?? "Не удалось вытянуть карту");
      }

      if (payload.card && payload.status) {
        setActiveCard(payload.card);
        applyStatus(payload.status);
        setScreenMode("card");
      }
    } catch (drawError) {
      setError(
        drawError instanceof Error ? drawError.message : "Ошибка вытягивания",
      );
    } finally {
      setIsDrawing(false);
    }
  }, [initData, isDrawing, status?.canDraw, hapticImpact, applyStatus]);

  const handleOpenCard = useCallback(async () => {
    if (status?.canDraw) {
      await handleDraw();
      return;
    }

    if (activeCard) {
      hapticImpact("light");
      setScreenMode("card");
    }
  }, [status?.canDraw, activeCard, handleDraw, hapticImpact]);

  const handleCloseCard = useCallback(() => {
    setScreenMode("deck");
  }, []);

  const handleResetCooldown = useCallback(async () => {
    if (isResetting) {
      return;
    }

    setIsResetting(true);
    setError(null);
    hapticImpact("light");

    try {
      clearAllMockDrawCache();

      const response = await fetch("/api/draw/reset", {
        method: "POST",
        headers: {
          "x-telegram-init-data": initData,
        },
      });

      const payload = (await response.json()) as DrawStatusResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось сбросить кулдаун");
      }

      setActiveCard(null);
      setScreenMode("deck");
      const freshStatus = { ...payload, mockMode: true };
      setStatus(freshStatus);
      saveMockDrawStatus(MOCK_USER_ID, freshStatus);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Ошибка сброса кулдауна",
      );
    } finally {
      setIsResetting(false);
    }
  }, [initData, isResetting, hapticImpact]);

  if (screenMode === "card" && activeCard) {
    return (
      <CardExperience
        key={activeCard.id}
        card={activeCard}
        nextDrawAt={status?.nextDrawAt}
        onClose={handleCloseCard}
        onHaptic={hapticImpact}
        onResetCooldown={handleResetCooldown}
        isResetting={isResetting}
        showDevReset={isMockMode}
      />
    );
  }

  const canOpenCard = Boolean(status?.canDraw || activeCard);
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
          <p className="m-auto font-raleway text-xs font-light uppercase tracking-[0.2em] text-zinc-600">
            Загрузка...
          </p>
        ) : (
          <>
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-1">
              <div className="flex shrink-0 flex-col items-center">
                {status?.canDraw ? (
                  <Deck
                    variant="home"
                    onDraw={handleDraw}
                    isDrawing={isDrawing}
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

              {status?.canDraw ? (
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
