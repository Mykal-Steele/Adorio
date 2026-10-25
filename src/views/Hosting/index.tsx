'use client';

import { useState, useEffect, useRef } from 'react';
import {
  uploadHostedFile,
  getMyHostedFiles,
  deleteHostedFile,
  type HostedFile,
} from '@/api/hosting';
import { CloudArrowUpIcon, DocumentIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import PaperTornEdge from '@/components/PaperTornEdge';

const STAT_ROTATIONS = ['rotate-[-0.8deg]', 'rotate-[0.6deg]', 'rotate-[-0.4deg]'];
const FILE_ROTATIONS = ['rotate-[0.3deg]', 'rotate-[-0.35deg]', 'rotate-[0.2deg]'];

export default function HostingView() {
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [dragging, setDragging] = useState(false);
  const [deletingSlugs, setDeletingSlugs] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyHostedFiles()
      .then(setFiles)
      .catch(() => setError('Failed to load files'))
      .finally(() => setLoading(false));
  }, []);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.html')) {
      setError('Only .html files are allowed');
      return;
    }
    if (file.size > 512 * 1024) {
      setError('File must be under 512 KB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const content = await file.text();
      const uploaded = await uploadHostedFile(file.name, content);
      setFiles((prev) => [uploaded, ...prev]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = async (slug: string) => {
    setDeletingSlugs((prev) => new Set(prev).add(slug));
    try {
      await deleteHostedFile(slug);
      setFiles((prev) => prev.filter((f) => f.slug !== slug));
    } catch {
      setError('Failed to delete file');
    } finally {
      setDeletingSlugs((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/h/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  const totalViews = files.reduce((sum, f) => sum + f.views, 0);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            share a page
          </p>
          <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
            File Hosting
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            Drop in an HTML file and get a shareable link instantly at{' '}
            <span className="font-paper-mono text-[15px] text-[var(--paper-accent)]">
              adorio.space/h/your-file
            </span>
            .
          </p>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          {!loading && files.length > 0 && (
            <div className="mb-7 grid grid-cols-3 gap-3">
              {[
                { label: 'Files', value: files.length },
                { label: 'Total views', value: totalViews.toLocaleString() },
                {
                  label: 'Storage used',
                  value:
                    totalSize >= 1024 ? `${(totalSize / 1024).toFixed(1)} KB` : `${totalSize} B`,
                },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-[3px] bg-[var(--paper-cream)] px-4 py-3 shadow-[0_10px_20px_-14px_rgba(60,44,24,.35),0_2px_0_rgba(60,44,24,.1)] ${STAT_ROTATIONS[i % STAT_ROTATIONS.length]}`}
                >
                  <p className="font-paper-serif text-2xl font-bold">{s.value}</p>
                  <p className="mt-0.5 font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative mb-7 cursor-pointer rounded-[3px] border-[1.5px] border-dashed transition-colors ${
              dragging
                ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
                : 'border-[rgba(60,44,24,.45)] bg-[var(--paper-cream)] hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
            <div className="flex flex-col items-center gap-3 px-4 py-12">
              {uploading ? (
                <>
                  <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[var(--paper-accent)] border-t-transparent" />
                  <p className="font-paper-sans text-base text-[var(--paper-muted)]">Uploading…</p>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon
                    className={`h-10 w-10 ${
                      dragging ? 'text-[var(--paper-accent)]' : 'text-[var(--paper-muted-2)]'
                    }`}
                  />
                  <div className="text-center">
                    <p className="text-[15px] font-medium">
                      Drop an HTML file or{' '}
                      <span className="font-bold text-[var(--paper-accent)] underline underline-offset-[3px]">
                        browse
                      </span>
                    </p>
                    <p className="mt-1 font-paper-mono text-[10px] uppercase tracking-[.14em] text-[var(--paper-muted-2)]">
                      only .html &middot; max 512 KB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center justify-between gap-3 rounded-[3px] border border-[#8d3a33] bg-[#f3ded9] px-4 py-3"
              >
                <p className="text-sm text-[#7a2f29]">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="shrink-0 font-paper-mono text-[10px] uppercase tracking-[.12em] text-[#8d3a33] hover:text-[#7a2f29]"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
              Your files
            </h2>
            {!loading && files.length > 0 && (
              <span className="font-paper-sans text-base text-[var(--paper-accent)]">
                {files.length} page{files.length !== 1 ? 's' : ''} live
              </span>
            )}
          </div>
          <div aria-hidden="true" className="paper-dashed-rule mb-6 h-0.5" />

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[86px] animate-pulse rounded-[3px] bg-[var(--paper-cream)] shadow-[0_10px_20px_-16px_rgba(60,44,24,.3)]"
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.35)] py-16">
              <DocumentIcon className="h-8 w-8 text-[var(--paper-muted-2)]" />
              <p className="font-paper-sans text-base text-[var(--paper-muted)]">No files yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {files.map((f, i) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex items-center gap-4 rounded-[3px] bg-[var(--paper-cream)] px-5 py-4 shadow-[0_10px_20px_-16px_rgba(60,44,24,.35),0_2px_0_rgba(60,44,24,.08)] ${FILE_ROTATIONS[i % FILE_ROTATIONS.length]}`}
                  >
                    <DocumentIcon className="h-5 w-5 shrink-0 text-[var(--paper-muted-2)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{f.originalFilename}</p>
                      <p className="mt-0.5 truncate font-paper-mono text-[11px] text-[var(--paper-accent)]">
                        /h/{f.slug}
                      </p>
                      <p className="mt-0.5 font-paper-mono text-[10px] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
                        {f.size >= 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${f.size} B`}{' '}
                        &middot; {f.views === 1 ? '1 view' : `${f.views} views`} &middot;{' '}
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => copyUrl(f.slug)}
                        className="min-w-[76px] rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-3 py-1.5 font-paper-mono text-[10px] font-bold uppercase tracking-[.08em] text-center shadow-[2px_2px_0_var(--paper-ink)] transition-transform hover:-translate-y-px"
                      >
                        {copied === f.slug ? 'Copied' : 'Copy URL'}
                      </button>
                      <a
                        href={`/h/${f.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[3px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] p-1.5 text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
                        aria-label={`View ${f.originalFilename}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(f.slug)}
                        disabled={deletingSlugs.has(f.slug)}
                        className="rounded-[3px] border border-[#8d3a33] bg-[#f3ded9] p-1.5 text-[#8d3a33] transition-colors hover:bg-[#ecd0c9] disabled:opacity-50"
                        aria-label={`Delete ${f.originalFilename}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
