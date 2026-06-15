"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DECK_VIDEO_SRC = "/images/tantree-deck-animated.mp4";
const DECK_POSTER_SRC = "/images/tantree-deck-hero.png";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) {
      return;
    }

    void video.play().catch(() => {
      setVideoFailed(true);
    });
  }, [videoFailed]);

  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
  }, []);

  return (
    <button
      type="button"
      onClick={onDraw}
      disabled={isDrawing || disabled}
      aria-label="Вытянуть карту из колоды"
      className="group relative aspect-[2/3] h-auto max-h-[calc(100dvh-12rem)] w-[min(96vw,calc((100dvh-12rem)*2/3))] shrink-0 overflow-hidden rounded-[1.35rem] bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {videoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={DECK_POSTER_SRC}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={DECK_POSTER_SRC}
          aria-hidden
          onError={handleVideoError}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src={DECK_VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <span className="pointer-events-none absolute inset-0 z-10 rounded-[1.35rem] ring-1 ring-[#c5a059]/20 transition-all group-hover:ring-[#c5a059]/40 group-active:scale-[0.99]" />
    </button>
  );
}
