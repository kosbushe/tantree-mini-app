"use client";

import { useMemo } from "react";

import { getDailyWisdom } from "@/lib/daily-wisdom";
import type { Card } from "@/types/card";

interface DynamicWisdomProps {
  cards: Card[];
  compact?: boolean;
}

export function DynamicWisdom({ cards, compact = false }: DynamicWisdomProps) {
  const wisdom = useMemo(() => getDailyWisdom(cards), [cards]);

  if (compact) {
    return (
      <div className="home-wisdom dynamic-wisdom w-full max-w-sm px-2 text-center">
        <p className="font-raleway text-[0.72rem] italic leading-relaxed text-gold/60">
          «{wisdom.quote}»
        </p>
        <cite className="mt-1.5 block font-raleway text-[0.52rem] font-extralight not-italic uppercase tracking-[0.32em] text-gold-muted/55">
          — {wisdom.author}
        </cite>
      </div>
    );
  }

  return (
    <div className="dynamic-wisdom relative mt-10 min-h-[5.75rem] w-full max-w-sm px-1 text-center">
      <p className="font-raleway text-[0.92rem] italic leading-relaxed text-gold/75">
        «{wisdom.quote}»
      </p>
      <cite className="mt-3 block font-montserrat text-[0.6rem] font-extralight not-italic uppercase tracking-[0.34em] text-gold-muted/75">
        — {wisdom.author}
      </cite>
    </div>
  );
}
