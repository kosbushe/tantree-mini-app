"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { AppLoaderScreen } from "@/components/AppLoader";
import { BrandFooter } from "@/components/BrandFooter";
import { CardBackFace, CARD_HELD_IMAGE } from "@/components/CardBackFace";
import { CardCompletionScreen } from "@/components/CardCompletionScreen";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getCardArtPath, hasCardArt } from "@/lib/cards";
import type { Card } from "@/types/card";

type CardPhase = "closed" | "art" | "text" | "practice" | "complete";

interface CardExperienceProps {
  card: Card;
  nextDrawAt?: string | null;
  onClose: () => void;
  onHaptic?: (style?: "light" | "medium" | "heavy") => void;
}

const PRIMARY_CTA_CLASS =
  "mx-auto flex w-full max-w-[280px] items-center justify-center rounded-full border border-[#c5a059]/55 bg-[#c5a059]/12 px-6 py-3 text-center font-raleway text-xs font-normal uppercase tracking-[0.18em] text-[#f5e6c8] shadow-[0_4px_24px_rgba(197,160,89,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-[#c5a059]/80 hover:bg-[#c5a059]/20 active:scale-[0.98]";

function PracticeList({ practice }: { practice: string }) {
  const lines = practice
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const intro: string[] = [];
  const bullets: string[] = [];

  for (const line of lines) {
    if (line.startsWith("•")) {
      bullets.push(line.replace(/^•\s*/, ""));
    } else {
      intro.push(line);
    }
  }

  return (
    <div className="break-words text-left text-base leading-loose text-zinc-100/95">
      {intro.map((paragraph, index) => (
        <p key={`intro-${index}`} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}

      {bullets.length > 0 ? (
        <ul className="mt-1 space-y-3">
          {bullets.map((item, index) => (
            <li key={`step-${index}`} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2.5 shrink-0 text-sm leading-none text-[#c5a059]/80"
              >
                •
              </span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
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
      <p className="font-montserrat text-xs font-extralight uppercase tracking-[0.35em] text-gold-muted/70">
        Карта {cardId}
      </p>
      <p className="font-montserrat mt-3 text-2xl font-extralight tracking-[0.1em] text-gold">
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
}: CardExperienceProps) {
  const isMounted = useIsMounted();
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

  if (!isMounted) {
    return <AppLoaderScreen />;
  }

  if (phase === "complete" && nextDrawAt) {
    return (
      <CardCompletionScreen
        card={card}
        nextDrawAt={nextDrawAt}
        onGoHome={onClose}
        onHaptic={onHaptic}
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
                <CardBackFace priority imageSrc={CARD_HELD_IMAGE} />
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

                <div className="card-text-overlay__content relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 text-left">
                  <p className="font-montserrat text-xs font-extralight uppercase tracking-[0.35em] text-gold-muted/80">
                    Карта {card.id}
                  </p>
                  <h2 className="font-montserrat mt-2 text-2xl font-light tracking-[0.08em] text-gold sm:text-3xl">
                    {card.title}
                  </h2>

                  <blockquote className="mt-5 border-l-2 border-gold/35 pl-4">
                    <p className="break-words text-base italic leading-relaxed text-zinc-100/95">
                      «{card.quote}»
                    </p>
                    <cite className="mt-3 block font-raleway text-sm font-light not-italic tracking-[0.06em] text-gold-muted/90">
                      — {card.author}
                    </cite>
                  </blockquote>

                  <p className="mt-5 break-words text-base leading-loose text-zinc-100/90">
                    {card.message}
                  </p>

                  {phase === "text" ? (
                    <div className="mt-8 flex w-full justify-center">
                      <button
                        type="button"
                        onClick={handleOpenPractice}
                        className={PRIMARY_CTA_CLASS}
                      >
                        Открыть практику
                      </button>
                    </div>
                  ) : null}

                  {phase === "practice" ? (
                    <div className="mt-6 space-y-6">
                      <section>
                        <h3 className="font-montserrat text-xs font-light uppercase tracking-[0.32em] text-gold/85">
                          🧘 Практика
                        </h3>
                        <div className="mt-4">
                          <PracticeList practice={card.practice} />
                        </div>
                      </section>

                      <section className="rounded-xl border border-gold/25 bg-gold/[0.06] px-5 py-4">
                        <h3 className="font-montserrat text-xs font-light uppercase tracking-[0.32em] text-gold/85">
                          🎯 Фокус дня
                        </h3>
                        <p className="mt-3 break-words text-base leading-loose text-[#f5e6c8]/90">
                          {card.focus}
                        </p>
                      </section>

                      {nextDrawAt ? (
                        <div className="flex w-full justify-center pt-2">
                          <button
                            type="button"
                            onClick={handleComplete}
                            className={PRIMARY_CTA_CLASS}
                          >
                            Завершить и поделиться
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <BrandFooter className="mt-auto pt-6" />
                </div>
              </div>
            ) : null}
          </div>

          {phase === "closed" || phase === "art" ? (
            <p className="card-hint-shimmer mt-4 text-center font-raleway text-xs font-extralight uppercase tracking-[0.26em] text-gold-muted">
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
