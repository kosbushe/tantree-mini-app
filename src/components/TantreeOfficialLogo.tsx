import Image from "next/image";

export const TANTREE_HEADER_IMAGE = "/images/tantree-deck-hero.png?v=2";

interface TantreeOfficialLogoProps {
  className?: string;
}

export function TantreeOfficialLogo({ className }: TantreeOfficialLogoProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className ?? ""}`}
      aria-label="TANTREE"
    >
      <Image
        src={TANTREE_HEADER_IMAGE}
        alt="TANTREE — колода карт"
        width={1024}
        height={661}
        priority
        unoptimized
        className="max-h-[calc(100dvh-12rem)] w-full object-contain"
        sizes="96vw"
      />
    </div>
  );
}
