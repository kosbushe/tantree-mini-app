"use client";

import Image from "next/image";
import { useState } from "react";

export const CARD_BACK_IMAGE = "/images/card_back.png";
export const CARD_HELD_IMAGE = "/images/new_tantree_card.png";
export const CARD_EXPERIENCE_BACK_IMAGE = "/images/card_back_hero.png";

interface CardBackFaceProps {
  compact?: boolean;
  priority?: boolean;
  imageSrc?: string;
  fit?: "cover" | "contain";
  contentClassName?: string;
  mediaClassName?: string;
}

export function CardBackFace({
  compact = false,
  priority = false,
  imageSrc = CARD_BACK_IMAGE,
  fit = "cover",
  contentClassName,
  mediaClassName,
}: CardBackFaceProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={
        contentClassName ??
        `card-back-face ${compact ? "card-back-face--compact" : ""}`
      }
    >
      {!hasError ? (
        <Image
          src={imageSrc}
          alt="Рубашка карты TANTREE"
          fill
          priority={priority}
          className={
            mediaClassName ??
            (fit === "contain"
              ? "card-back-face__image rounded-[1.35rem] object-contain object-center"
              : "card-back-face__image rounded-[1.35rem] object-cover object-center")
          }
          sizes="100vw"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="card-back-face__fallback" aria-hidden="true" />
      )}
    </div>
  );
}
