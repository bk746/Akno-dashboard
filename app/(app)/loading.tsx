export default function AppLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-akno-bg px-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-akno-primary border-t-transparent" />
      <p className="text-sm font-medium text-akno-text">Chargement…</p>
    </div>
  );
}
