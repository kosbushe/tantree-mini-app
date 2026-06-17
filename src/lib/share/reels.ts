import { getCardArtPath } from "@/lib/cards";
import { buildReelsCaption } from "@/lib/share/text";
import { getCardArtAbsoluteUrl } from "@/lib/share/urls";
import type { Card } from "@/types/card";

export async function downloadCardArt(cardId: number): Promise<boolean> {
  const artPath = getCardArtPath(cardId);
  const url = getCardArtAbsoluteUrl(artPath);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `tantree-card-${cardId}.png`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}

export async function copyReelsCaption(card: Card): Promise<boolean> {
  const caption = buildReelsCaption(card);

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(caption);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function prepareCardForReels(card: Card): Promise<{
  downloaded: boolean;
  captionCopied: boolean;
}> {
  const [downloaded, captionCopied] = await Promise.all([
    downloadCardArt(card.id),
    copyReelsCaption(card),
  ]);

  return { downloaded, captionCopied };
}
