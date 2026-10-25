'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { getAllHostedFilesAdmin, deleteHostedFile, type HostedFile } from '@/api/hosting';
import PaperTornEdge from '@/components/PaperTornEdge';

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

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            admin &middot; file hosting
          </p>
          <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
            Hosted files
          </h1>
          <p className="mt-3.5 text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            {files.length} file{files.length !== 1 ? 's' : ''} across {Object.keys(grouped).length}{' '}
            user{Object.keys(grouped).length !== 1 ? 's' : ''} &middot; {totalViews} total view
            {totalViews !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-5xl">
          {error && (
            <p className="mb-5 rounded-[3px] border border-[#8d3a33] bg-[#f3ded9] px-4 py-2.5 text-sm text-[#7a2f29]">
              {error}
            </p>
          )}

          {loading ? (
            <p className="font-paper-sans text-lg text-[var(--paper-muted)]">Loading…</p>
          ) : files.length === 0 ? (
            <p className="font-paper-sans text-lg text-[var(--paper-muted)]">
              No files hosted yet.
            </p>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([username, userFiles]) => (
                <div key={username}>
                  <h2 className="mb-2 flex items-baseline gap-2 border-b border-dashed border-[var(--paper-line)] pb-1.5 font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
                    {username}
                    <span className="normal-case tracking-normal">
                      ({userFiles.length} file{userFiles.length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                  <div className="space-y-2.5">
                    {userFiles.map((f) => (
                      <div
                        key={f._id}
                        className="flex items-center justify-between gap-4 rounded-[3px] bg-[var(--paper-cream)] px-5 py-4 shadow-[0_10px_20px_-16px_rgba(60,44,24,.35),0_2px_0_rgba(60,44,24,.08)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{f.originalFilename}</p>
                          <p className="mt-0.5 truncate font-paper-mono text-[11px] text-[var(--paper-accent)]">
                            /h/{f.slug}
                          </p>
                          <p className="mt-0.5 font-paper-mono text-[10px] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
                            {(f.size / 1024).toFixed(1)} KB &middot; {f.views} view
                            {f.views !== 1 ? 's' : ''} &middot;{' '}
                            {new Date(f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <a
                            href={`/h/${f.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-3 py-1.5 font-paper-mono text-[10px] font-bold uppercase tracking-[.08em] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(f.slug)}
                            className="rounded-[3px] border border-[#8d3a33] bg-[#f3ded9] px-3 py-1.5 font-paper-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#8d3a33] transition-colors hover:bg-[#ecd0c9]"
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
