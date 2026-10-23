'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  presignHostedUpload,
  confirmHostedUpload,
  getMyHostedFiles,
  getHostedUsage,
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
    xhr.onerror = () => reject(new Error('Upload failed — check your connection'));
    xhr.send(file);
  });

const ROTATIONS = ['rotate-[-0.5deg]', 'rotate-[0.4deg]', 'rotate-[-0.3deg]', 'rotate-[0.6deg]'];

const IconButton = ({
  label,
  onClick,
  href,
  danger,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const className = `grid h-9 w-9 place-items-center rounded-[4px] border-[1.5px] border-[var(--paper-ink)] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px disabled:opacity-50 ${
    danger ? 'bg-[#f4e0dc] text-[#8d3a33]' : 'bg-[var(--paper-cream)] text-[var(--paper-ink)]'
  }`;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
      {children}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={className}
    >
      {children}
    </button>
  );
};

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
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  useEffect(() => {
    getMyHostedFiles()
      .then(setFiles)
      .catch(() => setError('Failed to load files'))
      .finally(() => setLoading(false));
    getHostedUsage()
      .then(setUsage)
      .catch(() => {});
  }, []);

  const storageFull = usage ? usage.remainingBytes <= 0 : false;

  const handleFile = async (file: File) => {
    if (file.size > MAX_HOSTED_FILE_BYTES) {
      setError('File must be under 100 MB');
      return;
    }
    if (storageFull) {
      setError('Storage is full — delete a file to free space.');
      return;
    }
    if (usage?.turnstileSiteKey && !turnstileToken) {
      setError('Please complete the captcha first.');
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
      setUsage((prev) =>
        prev
          ? {
              ...prev,
              usedBytes: prev.usedBytes + uploaded.size,
              remainingBytes: Math.max(0, prev.remainingBytes - uploaded.size),
            }
          : prev,
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      // A Turnstile token is single-use, so solve again for the next attempt.
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
    if (file && !uploading && !storageFull) handleFile(file);
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

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            adorio community &middot; file hosting
          </p>
          <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
            File hosting
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            Drop in any file and get a shareable link at{' '}
            <span className="font-paper-mono text-[15px] text-[var(--paper-accent)]">
              adorio.space/h/your-file
            </span>
            . HTML, PDF, images, archives — up to 100&nbsp;MB.
          </p>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          {/* Stats */}
          {!loading && files.length > 0 && (
            <div className="mb-8 grid grid-cols-3 gap-[clamp(12px,2vw,20px)]">
              {[
                { label: 'Files', value: files.length },
                { label: 'Total views', value: totalViews.toLocaleString() },
                { label: 'Storage used', value: formatBytes(totalSize) },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-[3px] bg-[var(--paper-cream)] p-[clamp(14px,2vw,22px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)] ${ROTATIONS[i % ROTATIONS.length]}`}
                >
                  <p className="font-paper-serif text-[clamp(22px,3vw,30px)] font-bold leading-none">
                    {s.value}
                  </p>
                  <p className="mt-1.5 font-paper-mono text-[10px] uppercase tracking-[.14em] text-[var(--paper-muted-2)]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            className={`relative mb-8 rounded-[3px] p-[clamp(20px,3vw,30px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)] transition-transform ${
              dragging
                ? 'rotate-[-0.4deg] scale-[1.01] bg-[var(--paper-yellow-soft)]'
                : 'bg-[var(--paper-cream)]'
            } ${!uploading && !storageFull ? 'cursor-pointer' : ''}`}
            onClick={() => !uploading && !storageFull && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!storageFull) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 left-7 h-[24px] w-24 rotate-[-3deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
            />
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
            <div className="flex flex-col items-center gap-3 rounded-[2px] border-2 border-dashed border-[rgba(60,44,24,.35)] py-12">
              {uploading ? (
                <>
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--paper-accent)] border-t-transparent" />
                  <p className="font-paper-serif text-lg font-bold">
                    Uploading… {Math.round(progress * 100)}%
                  </p>
                  <div className="h-2 w-52 overflow-hidden rounded-[2px] border border-[rgba(60,44,24,.3)] bg-[var(--paper-yellow-soft)]">
                    <div
                      className="h-full bg-[var(--paper-yellow)] transition-all"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </>
              ) : storageFull ? (
                <>
                  <DocumentIcon className="h-10 w-10 text-[#8d3a33]" />
                  <div className="text-center">
                    <p className="font-paper-serif text-lg font-bold text-[#8d3a33]">
                      Storage is full
                    </p>
                    <p className="mt-1 font-paper-mono text-[11px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                      Delete a file below to free space
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CloudArrowUpIcon
                    className={`h-10 w-10 transition-colors ${dragging ? 'text-[var(--paper-accent)]' : 'text-[var(--paper-muted-2)]'}`}
                  />
                  <div className="text-center">
                    <p className="font-paper-serif text-lg font-bold">
                      Drop a file or{' '}
                      <span className="text-[var(--paper-accent)] underline underline-offset-2">
                        browse
                      </span>
                    </p>
                    <p className="mt-1 font-paper-mono text-[11px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                      HTML · PDF · images · archives — up to 100 MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Host-wide storage meter */}
          {usage && usage.limitBytes > 0 && (
            <div className="mb-8 rounded-[3px] border border-[rgba(60,44,24,.25)] bg-[var(--paper-cream)]/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3 font-paper-mono text-[11px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                <span>Host storage</span>
                <span>
                  {formatBytes(usage.usedBytes)} / {formatBytes(usage.limitBytes)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-[2px] border border-[rgba(60,44,24,.3)] bg-[var(--paper-yellow-soft)]">
                <div
                  className={`h-full transition-all ${storageFull ? 'bg-[#c0655a]' : 'bg-[var(--paper-yellow)]'}`}
                  style={{
                    width: `${Math.min(100, Math.round((usage.usedBytes / usage.limitBytes) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Bot check — only when the backend has Turnstile keys configured */}
          {usage?.turnstileSiteKey && (
            <div className="mb-8">
              <TurnstileWidget
                key={turnstileKey}
                siteKey={usage.turnstileSiteKey}
                onToken={handleToken}
              />
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 flex items-start justify-between gap-3 rounded-[3px] border border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 shadow-[3px_4px_0_var(--paper-ink)]"
              >
                <p className="text-sm text-[#8d3a33]">{error}</p>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="shrink-0 text-sm font-medium text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File list */}
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-paper-mono text-xs uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
              Your files
            </h2>
            {!loading && files.length > 0 && (
              <p className="font-paper-mono text-xs uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </p>
            )}
          </div>
          <div aria-hidden="true" className="paper-dashed-rule mt-2 h-0.5" />

          {loading ? (
            <div className="mt-8 space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-[3px] bg-[var(--paper-cream)]/70"
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="mt-8 rounded-[3px] border-2 border-dashed border-[rgba(60,44,24,.3)] py-16 text-center">
              <DocumentIcon className="mx-auto h-8 w-8 text-[var(--paper-muted-2)]" />
              <p className="mt-2 font-paper-hand text-2xl text-[var(--paper-muted)]">
                No files yet — pin one up above
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <AnimatePresence>
                {files.map((f, i) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`relative flex items-center gap-4 rounded-[3px] bg-[var(--paper-cream)] p-[clamp(16px,2.4vw,24px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)] transition-transform hover:-translate-y-1 ${ROTATIONS[i % ROTATIONS.length]}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -top-3 left-6 h-[20px] w-16 rotate-[-4deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.6)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
                    />
                    <DocumentIcon className="h-5 w-5 shrink-0 text-[var(--paper-muted-2)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-paper-serif text-lg font-bold">
                        {f.originalFilename}
                      </p>
                      <p className="mt-0.5 font-paper-mono text-xs text-[var(--paper-accent)]">
                        /h/{f.slug}
                      </p>
                      <p className="mt-1 font-paper-mono text-[11px] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
                        {formatBytes(f.size)} &middot;{' '}
                        {f.views === 1 ? '1 view' : `${f.views} views`} &middot;{' '}
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => copyUrl(f.slug)}
                        className="min-w-[76px] rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-3 py-1.5 font-paper-mono text-[11px] font-bold uppercase tracking-[.1em] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px"
                      >
                        {copied === f.slug ? '✓ Copied' : 'Copy'}
                      </button>
                      <IconButton label={`View ${f.originalFilename}`} href={`/h/${f.slug}`}>
                        <EyeIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label={`Delete ${f.originalFilename}`}
                        onClick={() => handleDelete(f.slug)}
                        danger
                        disabled={deletingSlugs.has(f.slug)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
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
