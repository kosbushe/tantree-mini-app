const NBSP = "\u00A0";

const SHORT_WORDS =
  "в|во|на|с|со|у|о|об|обо|за|из|изо|к|ко|от|ото|по|до|без|для|при|про|над|под|и|а|но|или|ли|же|бы|не|ни";

const SHORT_WORD_PATTERN = new RegExp(
  `(^|[\\s(«"\\[—-])(${SHORT_WORDS}) ([\\p{L}])`,
  "gimu",
);

export function typographRussian(text: string): string {
  return text.replace(
    SHORT_WORD_PATTERN,
    (_, prefix: string, word: string, nextLetter: string) =>
      `${prefix}${word}${NBSP}${nextLetter}`,
  );
}
