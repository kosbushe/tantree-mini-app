"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { BrandFooter } from "@/components/BrandFooter";
import { CardBackFace } from "@/components/CardBackFace";
import { CardCompletionScreen } from "@/components/CardCompletionScreen";
import { getCardArtPath, hasCardArt } from "@/lib/cards";
import type { Card } from "@/types/card";

type CardPhase = "closed" | "art" | "text" | "practice" | "complete";

interface CardExperienceProps {
  card: Card;
  nextDrawAt?: string | null;
  onClose: () => void;
  onHaptic?: (style?: "light" | "medium" | "heavy") => void;
  onResetCooldown?: () => void;
  isResetting?: boolean;
  showDevReset?: boolean;
}

function PracticeList({ practice }: { practice: string }) {
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-zinc-200/90">
      {practice.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        return <p key={index}>{trimmed}</p>;
      })}
    </div>
  );
}

function CardArtPlaceholder({
  cardId,
  title,
}: {
  cardId: number;
  title: string;
}) {
  return (
    <div className="card-art-face card-art-face--placeholder flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <p className="font-montserrat text-[0.55rem] font-extralight uppercase tracking-[0.35em] text-gold-muted/70">
        Карта {cardId}
      </p>
      <p className="font-montserrat mt-3 text-xl font-extralight tracking-[0.1em] text-gold">
        {title}
      </p>
    </div>
  );
}

function CardArt({ cardId, title }: { cardId: number; title: string }) {
  const [hasError, setHasError] = useState(false);
  const artPath = getCardArtPath(cardId);

  if (!hasCardArt(cardId) || hasError) {
    return <CardArtPlaceholder cardId={cardId} title={title} />;
  }

  return (
    <div className="card-art-face">
      <Image
        src={artPath}
        alt={`Арт карты «${title}»`}
        fill
        priority
        unoptimized
        className="card-art-face__image rounded-[1.35rem] object-cover object-center"
        sizes="(max-width: 768px) 93vw, 380px"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function CardExperience({
  card,
  nextDrawAt,
  onClose,
  onHaptic,
  onResetCooldown,
  isResetting,
  showDevReset,
}: CardExperienceProps) {
  const [phase, setPhase] = useState<CardPhase>("closed");
  const [isFlipping, setIsFlipping] = useState(false);

  const isFlipped = phase !== "closed" || isFlipping;
  const showTextOverlay = phase === "text" || phase === "practice";

  const handleClose = useCallback(() => {
    onHaptic?.("light");
    onClose();
  }, [onClose, onHaptic]);

  const handleCardClick = useCallback(() => {
    if (phase === "closed" && !isFlipping) {
      onHaptic?.("medium");
      setIsFlipping(true);
      window.setTimeout(() => {
        setPhase("art");
        setIsFlipping(false);
      }, 700);
      return;
    }

    if (phase === "art") {
      onHaptic?.("light");
      setPhase("text");
    }
  }, [phase, isFlipping, onHaptic]);

  const handleOpenPractice = useCallback(() => {
    onHaptic?.("light");
    setPhase("practice");
  }, [onHaptic]);

  const handleComplete = useCallback(() => {
    onHaptic?.("medium");
    setPhase("complete");
  }, [onHaptic]);

  if (phase === "complete" && nextDrawAt) {
    return (
      <CardCompletionScreen
        card={card}
        nextDrawAt={nextDrawAt}
        onGoHome={onClose}
        onHaptic={onHaptic}
        onResetCooldown={onResetCooldown}
        isResetting={isResetting}
        showDevReset={showDevReset}
      />
    );
  }

  return (
    <div className="card-experience fixed inset-0 z-50 flex flex-col bg-black">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Закрыть карту"
        className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-40 flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-black/40 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-gold/[0.08]"
      >
        <X className="h-[1.125rem] w-[1.125rem] text-gold-muted/80" strokeWidth={1.25} />
      </button>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))]">
        <div className="flex flex-col items-center">
          <div
            className={`card-flip-scene card-tarot-shell transition-all duration-500 ease-out ${
              phase === "closed" || phase === "art" ? "cursor-pointer" : ""
            }`}
            onClick={
              phase === "text" || phase === "practice" ? undefined : handleCardClick
            }
            onKeyDown={(event) => {
              if (phase === "text" || phase === "practice") return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleCardClick();
              }
            }}
            role={phase === "closed" || phase === "art" ? "button" : undefined}
            tabIndex={phase === "closed" || phase === "art" ? 0 : undefined}
            aria-label={
              phase === "closed"
                ? "Перевернуть карту"
                : phase === "art"
                  ? "Открыть послание карты"
                  : undefined
            }
          >
            <div className={`card-flip-inner ${isFlipped ? "is-flipped" : ""}`}>
              <div className="card-face card-face--back card-back-surface card-back-surface--glowing">
                <CardBackFace priority />
              </div>

              <div className="card-face card-face--front card-front-surface relative overflow-hidden rounded-[1.35rem]">
                <CardArt cardId={card.id} title={card.title} />
              </div>
            </div>

            {showTextOverlay ? (
              <div
                className="card-text-overlay absolute inset-0 flex flex-col overflow-hidden rounded-[1.35rem] border border-gold/38"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="absolute inset-0 bg-black/88 backdrop-blur-md" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/82 to-black/55" />

                <div className="card-text-overlay__content relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
                  <p className="font-montserrat text-[0.55rem] font-extralight uppercase tracking-[0.35em] text-gold-muted/75">
                    Карта {card.id}
                  </p>
                  <h2 className="font-montserrat mt-2 text-xl font-extralight tracking-[0.1em] text-gold sm:text-2xl">
                    {card.title}
                  </h2>

                  <blockquote className="mt-4 border-l border-gold/30 pl-3">
                    <p className="text-[0.82rem] italic leading-relaxed text-zinc-100/95 sm:text-sm">
                      «{card.quote}»
                    </p>
                    <cite className="mt-2 block font-raleway text-[0.62rem] font-extralight not-italic tracking-[0.12em] text-gold-muted sm:text-[0.68rem]">
                      — {card.author}
                    </cite>
                  </blockquote>

                  <p className="mt-4 text-[0.82rem] leading-relaxed text-zinc-200/90 sm:text-sm">
                    {card.message}
                  </p>

                  {phase === "text" ? (
                    <button
                      type="button"
                      onClick={handleOpenPractice}
                      className="mt-5 self-start rounded-full border border-gold/35 bg-gold/[0.08] px-4 py-2 font-raleway text-[0.62rem] font-extralight uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold/[0.14] sm:px-5 sm:py-2.5 sm:text-[0.68rem]"
                    >
                      Открыть практику
                    </button>
                  ) : null}

                  {phase === "practice" ? (
                    <div className="mt-5 space-y-4">
                      <section>
                        <h3 className="font-montserrat text-[0.55rem] font-extralight uppercase tracking-[0.35em] text-gold/80">
                          🧘 Практика
                        </h3>
                        <div className="mt-2">
                          <PracticeList practice={card.practice} />
                        </div>
                      </section>

                      <section className="rounded-xl border border-gold/20 bg-gold/[0.05] px-3 py-3 sm:px-4 sm:py-4">
                        <h3 className="font-montserrat text-[0.55rem] font-extralight uppercase tracking-[0.35em] text-gold/80">
                          🎯 Фокус дня
                        </h3>
                        <p className="mt-2 text-[0.82rem] leading-relaxed text-gold/90 sm:text-sm">
                          {card.focus}
                        </p>
                      </section>

                      {nextDrawAt ? (
                        <button
                          type="button"
                          onClick={handleComplete}
                          className="mt-2 w-full rounded-full border border-gold/35 bg-gold/[0.1] px-5 py-3 font-raleway text-[0.62rem] font-extralight uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold/[0.16]"
                        >
                          Завершить и поделиться
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  <BrandFooter className="mt-auto pt-4" />
                </div>
              </div>
            ) : null}
          </div>

          {phase === "closed" || phase === "art" ? (
            <p className="card-hint-shimmer mt-4 font-raleway text-[0.62rem] font-extralight uppercase tracking-[0.26em] text-gold-muted">
              {phase === "closed"
                ? "коснись, чтобы перевернуть"
                : "коснись, чтобы прочитать"}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
