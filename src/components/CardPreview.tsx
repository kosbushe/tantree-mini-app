import Image from "next/image";
import Link from "next/link";

import { getCardArtPath, hasCardArt } from "@/lib/cards";
import { getAppShareUrl } from "@/lib/share/urls";
import type { Card } from "@/types/card";

interface CardPreviewProps {
  card: Card;
}

export function CardPreview({ card }: CardPreviewProps) {
  const appUrl = getAppShareUrl("card_preview");

  return (
    <div className="flex min-h-dvh flex-col items-center bg-black px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <p className="font-raleway text-[0.58rem] font-extralight uppercase tracking-[0.38em] text-gold-muted/75">
          TANTREE · карта {card.id}
        </p>
        <h1 className="font-montserrat mt-2 text-center text-2xl font-extralight tracking-[0.1em] text-gold">
          {card.title}
        </h1>

        <div className="relative mt-5 aspect-[2/3] w-[min(80vw,calc(46dvh*2/3))] max-h-[46dvh] overflow-hidden rounded-[1.35rem] border border-gold/30">
          {hasCardArt(card.id) ? (
            <Image
              src={getCardArtPath(card.id)}
              alt={card.title}
              fill
              priority
              unoptimized
              className="object-cover object-center"
              sizes="80vw"
            />
          ) : null}
        </div>

        <blockquote className="mt-5 max-w-[20rem] text-center">
          <p className="font-raleway text-[0.82rem] italic leading-relaxed text-gold/70">
            «{card.quote}»
          </p>
          <cite className="mt-2 block font-raleway text-[0.62rem] font-light not-italic tracking-[0.06em] text-gold-muted/80">
            — {card.author}
          </cite>
        </blockquote>

        <p className="mt-4 max-w-[22rem] text-center text-sm leading-relaxed text-zinc-300/90">
          {card.message.split("\n")[0]}
        </p>
      </div>

      <div className="flex w-full max-w-sm shrink-0 flex-col items-center gap-3">
        {appUrl ? (
          <Link
            href={appUrl}
            className="flex w-full items-center justify-center rounded-full border border-[#c5a059]/55 bg-[#c5a059]/12 px-6 py-3.5 text-center font-raleway text-[0.62rem] font-normal uppercase tracking-[0.2em] text-[#f5e6c8] transition-all hover:border-[#c5a059]/80 hover:bg-[#c5a059]/20"
          >
            Вытянуть свою карту
          </Link>
        ) : null}
        <p className="text-center font-raleway text-[0.55rem] font-extralight uppercase tracking-[0.22em] text-zinc-600">
          by Ksenia Bushe
        </p>
      </div>
    </div>
  );
}
