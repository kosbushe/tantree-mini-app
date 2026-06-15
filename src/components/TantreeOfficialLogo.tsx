import Image from "next/image";

import { CARD_HELD_IMAGE } from "@/components/CardBackFace";

export const TANTREE_HEADER_IMAGE = CARD_HELD_IMAGE;

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
        width={682}
        height={1024}
        priority
        unoptimized
        className="max-h-[calc(100dvh-12rem)] w-full object-contain"
        sizes="96vw"
      />
    </div>
  );
}
