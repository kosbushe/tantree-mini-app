"use client";

import { useEffect, useState } from "react";

import { useIsMounted } from "@/hooks/useIsMounted";

interface CooldownTimerProps {
  nextDrawAt: string;
  compact?: boolean;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export function CooldownTimer({
  nextDrawAt,
  compact = false,
}: CooldownTimerProps) {
  const isMounted = useIsMounted();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const updateRemaining = () => {
      setRemaining(new Date(nextDrawAt).getTime() - Date.now());
    };

    updateRemaining();

    const interval = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(interval);
  }, [isMounted, nextDrawAt]);

  const display = isMounted ? formatRemaining(remaining) : "--:--:--";

  if (compact) {
    return (
      <div className="home-cooldown cooldown-timer text-center">
        <p className="font-raleway text-[0.58rem] font-extralight uppercase tracking-[0.34em] text-gold-muted/75">
          Следующая карта через
        </p>
        <p className="font-montserrat mt-1 text-[1.75rem] font-extralight tracking-[0.18em] text-gold tabular-nums">
          {display}
        </p>
      </div>
    );
  }

  return (
    <div className="cooldown-timer rounded-2xl border border-gold/20 bg-gold/[0.04] px-6 py-5 text-center">
      <p className="font-montserrat text-[0.58rem] font-extralight uppercase tracking-[0.38em] text-gold-muted">
        Следующая карта через
      </p>
      <p className="font-montserrat mt-3 text-3xl font-extralight tracking-[0.2em] text-gold tabular-nums">
        {display}
      </p>
      <p className="font-raleway mt-3 text-xs font-extralight leading-relaxed tracking-[0.06em] text-zinc-500">
        Одна карта в сутки — тантрический ритм присутствия
      </p>
    </div>
  );
}
