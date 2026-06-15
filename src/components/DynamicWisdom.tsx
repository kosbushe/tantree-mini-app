"use client";

import { useEffect, useState } from "react";

import { useIsMounted } from "@/hooks/useIsMounted";
import { getDailyWisdom, type WisdomQuote } from "@/lib/daily-wisdom";
import type { Card } from "@/types/card";

interface DynamicWisdomProps {
  cards: Card[];
  compact?: boolean;
}

export function DynamicWisdom({ cards, compact = false }: DynamicWisdomProps) {
  const isMounted = useIsMounted();
  const [wisdom, setWisdom] = useState<WisdomQuote | null>(null);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    setWisdom(getDailyWisdom(cards));
  }, [cards, isMounted]);

  if (!wisdom) {
    return (
      <footer className="w-full text-center">
        <p className="font-raleway text-xs italic leading-relaxed text-zinc-600/0">
          &nbsp;
        </p>
      </footer>
    );
  }

  if (compact) {
    return (
      <footer className="w-full text-center">
        <p className="font-raleway text-xs italic leading-relaxed text-zinc-500">
          «{wisdom.quote}»
        </p>
        <cite className="mt-1.5 block font-raleway text-[0.65rem] font-light not-italic uppercase tracking-[0.28em] text-zinc-600">
          — {wisdom.author}
        </cite>
      </footer>
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
