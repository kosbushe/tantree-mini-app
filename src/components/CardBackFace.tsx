"use client";

import Image from "next/image";
import { useState } from "react";

export const CARD_BACK_IMAGE = "/images/card_back.png";

interface CardBackFaceProps {
  compact?: boolean;
  priority?: boolean;
}

export function CardBackFace({
  compact = false,
  priority = false,
}: CardBackFaceProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`card-back-face ${compact ? "card-back-face--compact" : ""}`}
    >
      {!hasError ? (
        <Image
          src={CARD_BACK_IMAGE}
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
