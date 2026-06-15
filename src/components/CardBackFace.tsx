"use client";

import Image from "next/image";
import { useState } from "react";

export const CARD_BACK_IMAGE = "/images/card_back.png";
export const CARD_HELD_IMAGE = "/images/new_tantree_card.png";

interface CardBackFaceProps {
  compact?: boolean;
  priority?: boolean;
  imageSrc?: string;
}

export function CardBackFace({
  compact = false,
  priority = false,
  imageSrc = CARD_BACK_IMAGE,
}: CardBackFaceProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`card-back-face ${compact ? "card-back-face--compact" : ""}`}
    >
      {!hasError ? (
        <Image
          src={imageSrc}
          alt="Рубашка карты TANTREE"
          fill
          priority={priority}
          className="card-back-face__image rounded-[1.35rem] object-cover object-center"
          sizes={
            compact
              ? "(max-width: 768px) 93vw, 380px"
              : "(max-width: 768px) 93vw, 380px"
          }
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="card-back-face__fallback" aria-hidden="true" />
      )}
    </div>
  );
}
