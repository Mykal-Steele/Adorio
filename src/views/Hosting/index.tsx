'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  presignHostedUpload,
  confirmHostedUpload,
  getHostedUsage,
  getMyHostedFiles,
  deleteHostedFile,
  MAX_HOSTED_FILE_BYTES,
  type HostedFile,
  type HostedUsage,
} from '@/api/hosting';
import { CloudArrowUpIcon, DocumentIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import PaperTornEdge from '@/components/PaperTornEdge';
import { formatBytes } from './formatBytes';
import TurnstileWidget from './TurnstileWidget';

const STAT_ROTATIONS = ['rotate-[-0.8deg]', 'rotate-[0.6deg]', 'rotate-[-0.4deg]'];
const FILE_ROTATIONS = ['rotate-[0.3deg]', 'rotate-[-0.35deg]', 'rotate-[0.2deg]'];

// The file goes straight to R2 with the presigned URL, not through our servers, which is
// how uploads get past Cloudflare's 100 MB request limit. XHR because fetch can't report
// upload progress.
const putFile = (
  url: string,
  file: File,
  contentType: string,
  onProgress: (fraction: number) => void,
) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.send(file);
  });

export default function HostingView() {
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [dragging, setDragging] = useState(false);
  const [deletingSlugs, setDeletingSlugs] = useState<Set<string>>(new Set());
  const [usage, setUsage] = useState<HostedUsage | null>(null);
  const [usageFailed, setUsageFailed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  // A new key remounts the widget for a fresh token, since each one works only once
  const [turnstileKey, setTurnstileKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  // The meter, whether uploads are on, and the bot check key all come from here, so a
  // failure is shown with a retry instead of quietly leaving the form half set up
  const loadUsage = useCallback(() => {
    setUsageFailed(false);
    getHostedUsage()
      .then(setUsage)
      .catch(() => setUsageFailed(true));
  }, []);

  useEffect(() => {
    getMyHostedFiles()
      .then(setFiles)
      .catch(() => setError('Failed to load files'))
      .finally(() => setLoading(false));
    loadUsage();
  }, [loadUsage]);

  const uploadsEnabled = usage?.uploadsEnabled === true;
  const storageFull = usage ? usage.remainingBytes <= 0 : false;
  const canUpload = uploadsEnabled && !storageFull && !uploading;

  const handleFile = async (file: File) => {
    if (!canUpload) return;
    if (file.size > MAX_HOSTED_FILE_BYTES) {
      setError('File must be under 100 MB');
      return;
    }
    if (usage && file.size > usage.remainingBytes) {
      setError(`Not enough space left. ${formatBytes(usage.remainingBytes)} is free.`);
      return;
    }
    if (usage?.turnstileSiteKey && !turnstileToken) {
      setError('Finish the bot check above first.');
      return;
    }
    setError('');
    setUploading(true);
    setProgress(0);
    const contentType = file.type || 'application/octet-stream';
    try {
      const { slug, uploadUrl } = await presignHostedUpload(
        file.name,
        contentType,
        file.size,
        turnstileToken || undefined,
      );
      await putFile(uploadUrl, file, contentType, setProgress);
      const uploaded = await confirmHostedUpload(slug);
      setFiles((prev) => [uploaded, ...prev]);
      loadUsage();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setTurnstileToken('');
      setTurnstileKey((key) => key + 1);
      setUploading(false);
      setProgress(0);
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
      // The space is free again, so the meter and the full-storage lock should say so
      loadUsage();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete file');
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

  const dropHint = !usage
    ? usageFailed
      ? 'Could not check storage'
      : 'Checking storage…'
    : !uploadsEnabled
      ? 'Uploads are off right now'
      : storageFull
        ? 'Storage is full'
        : 'any file · max 100 MB';

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            share a file
          </p>
          <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
            File Hosting
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            Upload a file and get a link to it at{' '}
            <span className="font-paper-mono text-[15px] text-[var(--paper-accent)]">
              adorio.space/h/your-file
            </span>
            . HTML, PDFs, images, zips, anything up to 100&nbsp;MB.
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
                { label: 'Your storage', value: formatBytes(totalSize) },
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

          {usage && uploadsEnabled && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-baseline justify-between gap-3 font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                <span>Shared storage</span>
                <span className="tabular-nums">
                  {formatBytes(usage.usedBytes)} of {formatBytes(usage.limitBytes)} used
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(60,44,24,.12)]">
                <div
                  className={`h-full rounded-full ${storageFull ? 'bg-[#8d3a33]' : 'bg-[var(--paper-accent)]'}`}
                  style={{ width: `${Math.min(100, (usage.usedBytes / usage.limitBytes) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {usageFailed && (
            <p className="mb-5 rounded-[3px] border border-[#8d3a33] bg-[#f3ded9] px-4 py-3 text-sm text-[#7a2f29]">
              Couldn&apos;t check the storage, so uploads are paused.{' '}
              <button
                type="button"
                onClick={loadUsage}
                className="font-bold underline underline-offset-[3px]"
              >
                Try again
              </button>
            </p>
          )}

          {usage && !uploadsEnabled && (
            <p className="mb-5 rounded-[3px] border border-dashed border-[rgba(60,44,24,.45)] bg-[var(--paper-cream)] px-4 py-3 text-sm text-[var(--paper-muted)]">
              Uploads are off on the site right now. Your files below still work.
            </p>
          )}

          {usage?.turnstileSiteKey && canUpload && (
            <div className="mb-5">
              <TurnstileWidget
                key={turnstileKey}
                siteKey={usage.turnstileSiteKey}
                onToken={handleToken}
              />
            </div>
          )}

          <div
            role="button"
            tabIndex={canUpload ? 0 : -1}
            aria-disabled={!canUpload}
            onClick={() => canUpload && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (canUpload && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (canUpload) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative mb-7 rounded-[3px] border-[1.5px] border-dashed transition-colors ${
              !canUpload && !uploading
                ? 'cursor-not-allowed border-[rgba(60,44,24,.3)] bg-[var(--paper-cream)] opacity-70'
                : dragging
                  ? 'cursor-pointer border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
                  : 'cursor-pointer border-[rgba(60,44,24,.45)] bg-[var(--paper-cream)] hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
            />
            <div className="flex flex-col items-center gap-3 px-4 py-12">
              {uploading ? (
                <div className="w-full max-w-xs text-center">
                  <p className="font-paper-sans text-base text-[var(--paper-muted)]">
                    Uploading… <span className="tabular-nums">{Math.round(progress * 100)}%</span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(60,44,24,.12)]">
                    <div
                      className="h-full rounded-full bg-[var(--paper-accent)] transition-[width] duration-150"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CloudArrowUpIcon
                    className={`h-10 w-10 ${
                      dragging ? 'text-[var(--paper-accent)]' : 'text-[var(--paper-muted-2)]'
                    }`}
                  />
                  <div className="text-center">
                    <p className="text-[15px] font-medium">
                      Drop a file or{' '}
                      <span className="font-bold text-[var(--paper-accent)] underline underline-offset-[3px]">
                        browse
                      </span>
                    </p>
                    <p className="mt-1 font-paper-mono text-[10px] uppercase tracking-[.14em] text-[var(--paper-muted-2)]">
                      {dropHint}
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
                {files.length} file{files.length !== 1 ? 's' : ''} live
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
                        {formatBytes(f.size)} &middot;{' '}
                        {f.views === 1 ? '1 view' : `${f.views} views`} &middot;{' '}
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
