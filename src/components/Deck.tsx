import { CardBackFace } from "@/components/CardBackFace";

interface DeckProps {
  onDraw: () => void;
  isDrawing?: boolean;
  disabled?: boolean;
  variant?: "default" | "home";
}

export function Deck({
  onDraw,
  isDrawing = false,
  disabled = false,
  variant = "default",
}: DeckProps) {
  const isHome = variant === "home";

  return (
    <button
      type="button"
      onClick={onDraw}
      disabled={isDrawing || disabled}
      aria-label="Вытянуть карту из колоды"
      className={
        isHome
          ? "group relative aspect-[2/3] h-auto max-h-[calc(100dvh-12rem)] w-[min(96vw,calc((100dvh-12rem)*2/3))] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/50 disabled:cursor-not-allowed disabled:opacity-60"
          : "card-tarot-shell group relative mt-8 mb-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {!isHome ? (
        <span className="deck-shadow absolute inset-0 rounded-[1.35rem] bg-gold/10 blur-2xl" />
      ) : null}

      <span className="deck-card deck-card--back card-back-surface absolute inset-0 w-full overflow-hidden rounded-[1.35rem]">
        <CardBackFace compact />
      </span>
      <span className="deck-card deck-card--mid card-back-surface absolute inset-0 w-full -translate-y-1 overflow-hidden rounded-[1.35rem]">
        <CardBackFace compact />
      </span>
      <span className="deck-card deck-card--front card-back-surface card-back-surface--glowing absolute inset-0 w-full overflow-hidden rounded-[1.35rem] transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]">
        <CardBackFace compact priority />
      </span>

      {!isHome ? (
        <span className="absolute -bottom-10 left-1/2 w-max -translate-x-1/2 font-raleway text-[0.65rem] font-extralight uppercase tracking-[0.28em] text-gold-muted/60 transition-colors group-hover:text-gold-muted">
          {isDrawing ? "Карта выходит..." : "Коснись колоды"}
        </span>
      ) : null}
    </button>
  );
}
