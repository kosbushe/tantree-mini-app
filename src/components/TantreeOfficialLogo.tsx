import Image from "next/image";

export const TANTREE_HEADER_IMAGE = "/images/tantree-deck-hero.png?v=2";

interface TantreeOfficialLogoProps {
  className?: string;
}

export function TantreeOfficialLogo({ className }: TantreeOfficialLogoProps) {
  return (
    <div
      className={`tantree-official-logo flex w-full items-center justify-center ${className ?? ""}`}
      aria-label="TANTREE"
    >
      <Image
        src={TANTREE_HEADER_IMAGE}
        alt="TANTREE — колода карт"
        width={1024}
        height={661}
        priority
        unoptimized
        className="tantree-deck-hero home-hero-deck object-contain"
        sizes="92vw"
      />
    </div>
  );
}
