"use client";

import { Film, Share2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { CooldownTimer } from "@/components/CooldownTimer";
import { getCardArtPath, hasCardArt } from "@/lib/cards";
import {
  shareCard,
  shareCardForSocial,
  type ShareResult,
} from "@/lib/telegram/share-card";
import type { Card } from "@/types/card";

interface CardCompletionScreenProps {
  card: Card;
  nextDrawAt: string;
  onGoHome: () => void;
  onHaptic?: (style?: "light" | "medium" | "heavy") => void;
}

const SHARE_BUTTON_CLASS =
  "flex w-full items-center justify-center gap-2 rounded-full border border-gold/35 bg-gold/[0.08] px-6 py-3.5 font-raleway text-[0.62rem] font-extralight uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/[0.14] disabled:cursor-wait disabled:opacity-60";

type ShareAction = "share" | "social" | null;

export function CardCompletionScreen({
  card,
  nextDrawAt,
  onGoHome,
  onHaptic,
}: CardCompletionScreenProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ShareAction>(null);

  const runShare = useCallback(
    async (action: ShareAction, handler: () => Promise<ShareResult>) => {
      onHaptic?.("light");
      setShareNote(null);
      setFallbackText(null);
      setActiveAction(action);

      try {
        const result = await handler();
        if (result.message) {
          setShareNote(result.message);
        }
        if (result.fallbackText) {
          setFallbackText(result.fallbackText);
        }
      } finally {
        setActiveAction(null);
      }
    },
    [onHaptic],
  );

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

      <div className="flex w-full max-w-sm shrink-0 flex-col items-center gap-2.5 pb-2">
        <button
          type="button"
          disabled={activeAction !== null}
          onClick={() => {
            void runShare("share", () => shareCard(card));
          }}
          className={SHARE_BUTTON_CLASS}
        >
          <Share2 className="h-4 w-4 shrink-0" strokeWidth={1.25} />
          {activeAction === "share" ? "Открываем..." : "Поделиться"}
        </button>

        <button
          type="button"
          disabled={activeAction !== null}
          onClick={() => {
            void runShare("social", () => shareCardForSocial(card));
          }}
          className={SHARE_BUTTON_CLASS}
        >
          <Film className="h-4 w-4 shrink-0" strokeWidth={1.25} />
          {activeAction === "social"
            ? "Готовим..."
            : "Stories / Reels с картой"}
        </button>

        {shareNote ? (
          <p className="px-2 text-center font-raleway text-[0.58rem] font-extralight leading-relaxed tracking-[0.04em] text-gold-muted/70">
            {shareNote}
          </p>
        ) : null}

        {fallbackText ? (
          <p className="max-h-32 w-full overflow-y-auto rounded-xl border border-gold/20 bg-gold/[0.04] px-3 py-2 text-left font-raleway text-[0.55rem] leading-relaxed whitespace-pre-line text-gold-muted/80">
            {fallbackText}
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
      </div>
    </div>
  );
}
