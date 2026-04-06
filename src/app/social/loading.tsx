function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-social-surface/75 ring-1 ring-social-border/55 ${className}`}
    />
  );
}

export default function SocialLoading() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-social-page-bg text-social-ink">
      <div className="pointer-events-none absolute -left-32 -top-16 h-72 w-72 rounded-full bg-social-border/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-social-border/22 blur-3xl" />

      <div className="relative mx-auto max-w-350 px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-36 rounded-md" />
            <SkeletonBlock className="h-11 w-[min(40rem,88vw)] rounded-md" />
            <SkeletonBlock className="h-4 w-[min(46rem,92vw)] rounded-md" />
          </div>

          <div className="flex flex-wrap items-center gap-2 md:self-center md:justify-end">
            <SkeletonBlock className="h-10 w-44 rounded-md" />
            <SkeletonBlock className="h-9 w-9 rounded-md" />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <aside className="grid h-fit gap-4 lg:sticky lg:top-4">
            <SkeletonBlock className="h-50 w-full" />
            <SkeletonBlock className="h-60 w-full" />
          </aside>

          <main className="grid gap-4">
            <SkeletonBlock className="h-64 w-full" />
            <SkeletonBlock className="h-52 w-full" />
            <SkeletonBlock className="h-52 w-full" />
          </main>

          <aside className="grid h-fit gap-4 lg:sticky lg:top-4">
            <SkeletonBlock className="h-42 w-full" />
            <SkeletonBlock className="h-72 w-full" />
          </aside>
        </div>
      </div>
    </section>
  );
}
