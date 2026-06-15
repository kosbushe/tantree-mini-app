"use client";

import { Share2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { CooldownTimer } from "@/components/CooldownTimer";
import { getCardArtPath, hasCardArt } from "@/lib/cards";
import { shareCardToTelegram } from "@/lib/telegram/share-card";
import type { Card } from "@/types/card";

interface CardCompletionScreenProps {
  card: Card;
  nextDrawAt: string;
  onGoHome: () => void;
  onHaptic?: (style?: "light" | "medium" | "heavy") => void;
  onResetCooldown?: () => void;
  isResetting?: boolean;
  showDevReset?: boolean;
}

export function CardCompletionScreen({
  card,
  nextDrawAt,
  onGoHome,
  onHaptic,
  onResetCooldown,
  isResetting = false,
  showDevReset = false,
}: CardCompletionScreenProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);

  const handleShare = useCallback(async () => {
    onHaptic?.("light");
    setShareNote(null);

    const shared = await shareCardToTelegram(card);
    setShareNote(
      shared
        ? "Готово — можно опубликовать в истории Telegram"
        : "Скопировали текст карты — вставьте в историю или чат",
    );
  }, [card, onHaptic]);

  return (
    <div className="card-completion flex min-h-dvh flex-col items-center bg-black px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <p className="font-raleway text-[0.58rem] font-extralight uppercase tracking-[0.38em] text-gold-muted/75">
          Карта дня
        </p>
        <h2 className="font-montserrat mt-2 text-center text-2xl font-extralight tracking-[0.1em] text-gold">
          {card.title}
        </h2>

        <div className="card-completion__art relative mt-5 aspect-[2/3] w-[min(72vw,calc(42dvh*2/3))] max-h-[42dvh] overflow-hidden rounded-[1.35rem] border border-gold/30">
          {hasCardArt(card.id) ? (
            <Image
              src={getCardArtPath(card.id)}
              alt={card.title}
              fill
              unoptimized
              className="object-cover object-center"
              sizes="72vw"
            />
          ) : null}
        </div>

        <p className="mt-5 max-w-[18rem] text-center font-raleway text-[0.78rem] italic leading-relaxed text-gold/65">
          «{card.quote}»
        </p>
      </div>

      <div className="flex w-full max-w-sm shrink-0 flex-col items-center gap-3 pb-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/35 bg-gold/[0.08] px-6 py-3.5 font-raleway text-[0.62rem] font-extralight uppercase tracking-[0.24em] text-gold transition-colors hover:bg-gold/[0.14]"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.25} />
          Поделиться в Telegram
        </button>

        {shareNote ? (
          <p className="text-center font-raleway text-[0.58rem] font-extralight leading-relaxed tracking-[0.04em] text-gold-muted/70">
            {shareNote}
          </p>
        ) : null}

        <CooldownTimer nextDrawAt={nextDrawAt} compact />

        <button
          type="button"
          onClick={() => {
            onHaptic?.("light");
            onGoHome();
          }}
          className="font-raleway text-[0.58rem] font-extralight uppercase tracking-[0.28em] text-gold-muted/55 transition-colors hover:text-gold-muted"
        >
          На главную
        </button>

        {showDevReset && onResetCooldown ? (
          <button
            type="button"
            onClick={onResetCooldown}
            disabled={isResetting}
            className="font-raleway text-[0.48rem] font-extralight uppercase tracking-[0.1em] text-gold-muted/35 transition-colors hover:text-gold-muted/65 disabled:opacity-40"
          >
            {isResetting
              ? "Сброс..."
              : "[Тест] Сбросить таймер и очистить память"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
