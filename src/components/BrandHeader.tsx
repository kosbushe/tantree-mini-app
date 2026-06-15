interface HomeAuthorCreditProps {
  className?: string;
}

export function HomeAuthorCredit({ className = "" }: HomeAuthorCreditProps) {
  return (
    <p
      className={`w-full text-center font-raleway text-xs font-light uppercase tracking-[0.34em] text-[#8f7a4f] ${className}`}
    >
      by Ksenia Bushe
    </p>
  );
}
