'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { getAllHostedFilesAdmin, deleteHostedFile, type HostedFile } from '@/api/hosting';
import PaperTornEdge from '@/components/PaperTornEdge';
import { formatBytes } from './formatBytes';

export default function HostingAdminView() {
  const user = useAppSelector((s) => s.user.user);
  const router = useRouter();
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace('/hosting');
      return;
    }
    getAllHostedFilesAdmin()
      .then(setFiles)
      .catch(() => setError('Failed to load files'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleDelete = async (slug: string) => {
    try {
      await deleteHostedFile(slug);
      setFiles((prev) => prev.filter((f) => f.slug !== slug));
    } catch {
      setError('Failed to delete file');
    }
  };

  const grouped = files.reduce<Record<string, HostedFile[]>>((acc, f) => {
    const username = f.userId && typeof f.userId === 'object' ? f.userId.username : 'Unknown';
    (acc[username] ??= []).push(f);
    return acc;
  }, {});

  const totalViews = files.reduce((sum, f) => sum + f.views, 0);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            admin &middot; file hosting
          </p>
          <h1 className="font-paper-serif text-[clamp(34px,5.2vw,52px)] font-bold leading-[1.02] tracking-[-.02em]">
            All hosted files
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            {files.length} file{files.length !== 1 ? 's' : ''} across {Object.keys(grouped).length}{' '}
            user{Object.keys(grouped).length !== 1 ? 's' : ''} &middot; {totalViews} view
            {totalViews !== 1 ? 's' : ''} &middot; {formatBytes(totalSize)} stored.
          </p>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-5xl">
          {error && (
            <p className="mb-8 rounded-[3px] border border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 text-sm text-[#8d3a33] shadow-[3px_4px_0_var(--paper-ink)]">
              {error}
            </p>
          )}

          {loading ? (
            <p className="font-paper-hand text-2xl text-[var(--paper-muted)]">Loading…</p>
          ) : files.length === 0 ? (
            <p className="font-paper-hand text-2xl text-[var(--paper-muted)]">
              No files hosted yet.
            </p>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped).map(([username, userFiles]) => (
                <div key={username}>
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="font-paper-mono text-xs uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
                      {username}
                    </h2>
                    <p className="font-paper-mono text-xs uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                      {userFiles.length} file{userFiles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div aria-hidden="true" className="paper-dashed-rule mt-2 h-0.5" />

                  <div className="mt-6 space-y-5">
                    {userFiles.map((f, i) => (
                      <div
                        key={f._id}
                        className={`flex items-center justify-between gap-4 rounded-[3px] bg-[var(--paper-cream)] p-[clamp(16px,2.4vw,24px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)] transition-transform hover:-translate-y-1 ${
                          i % 2 === 0 ? 'rotate-[-0.4deg]' : 'rotate-[0.4deg]'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-paper-serif text-lg font-bold">
                            {f.originalFilename}
                          </p>
                          <p className="mt-0.5 font-paper-mono text-xs text-[var(--paper-accent)]">
                            /h/{f.slug}
                          </p>
                          <p className="mt-1 font-paper-mono text-[11px] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
                            {formatBytes(f.size)} &middot; {f.views} view
                            {f.views !== 1 ? 's' : ''} &middot;{' '}
                            {new Date(f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2.5">
                          <a
                            href={`/h/${f.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-3 py-1.5 font-paper-mono text-[11px] font-bold uppercase tracking-[.1em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(f.slug)}
                            className="rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[#f4e0dc] px-3 py-1.5 font-paper-mono text-[11px] font-bold uppercase tracking-[.1em] text-[#8d3a33] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
