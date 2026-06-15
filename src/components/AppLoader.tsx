export function AppLoader({ label = "Загрузка..." }: { label?: string }) {
  return (
    <div className="m-auto flex flex-col items-center gap-3">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#c5a059]/25 border-t-[#c5a059]/80"
        aria-hidden
      />
      <p className="font-raleway text-xs font-light uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>
    </div>
  );
}

export function AppLoaderScreen() {
  return (
    <div className="flex h-dvh max-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#000000] px-2">
      <AppLoader />
    </div>
  );
}
