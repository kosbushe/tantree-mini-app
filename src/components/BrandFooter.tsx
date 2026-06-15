interface BrandFooterProps {
  className?: string;
}

export function BrandFooter({ className }: BrandFooterProps) {
  return (
    <footer
      className={`font-raleway text-center text-[0.58rem] font-extralight uppercase tracking-[0.32em] text-gold-muted/70 ${className ?? ""}`}
    >
      TANTREE by Ksenia Bushe
    </footer>
  );
}
