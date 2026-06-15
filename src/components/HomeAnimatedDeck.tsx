"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

const DECK_VIDEO_SRC = "/images/tantree-deck-animated.mp4";
const DECK_GIF_SRC = "/images/tantree-deck-animated.gif";

interface HomeAnimatedDeckProps {
  onDraw: () => void;
  isDrawing?: boolean;
  disabled?: boolean;
}

export function HomeAnimatedDeck({
  onDraw,
  isDrawing = false,
  disabled = false,
}: HomeAnimatedDeckProps) {
  const [useGifFallback, setUseGifFallback] = useState(false);

  const handleVideoError = useCallback(() => {
    setUseGifFallback(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onDraw}
      disabled={isDrawing || disabled}
      aria-label="Вытянуть карту из колоды"
      className="group relative aspect-[2/3] h-auto max-h-[calc(100dvh-12rem)] w-[min(96vw,calc((100dvh-12rem)*2/3))] shrink-0 overflow-hidden rounded-[1.35rem] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {useGifFallback ? (
        <Image
          src={DECK_GIF_SRC}
          alt=""
          aria-hidden
          fill
          unoptimized
          className="object-cover"
          sizes="96vw"
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
          onError={handleVideoError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <source src={DECK_VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <span className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-1 ring-[#c5a059]/20 transition-all group-hover:ring-[#c5a059]/40 group-active:scale-[0.99]" />
    </button>
  );
}
