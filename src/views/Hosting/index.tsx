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

export default function HostingView() {
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [dragging, setDragging] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState('');
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
    setDeletingSlug(slug);
    try {
      await deleteHostedFile(slug);
      setFiles((prev) => prev.filter((f) => f.slug !== slug));
    } catch {
      setError('Failed to delete file');
    } finally {
      setDeletingSlug('');
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
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">File Hosting</h1>
          <p className="text-gray-400 text-sm">
            Upload an HTML file — get a shareable link instantly at{' '}
            <span className="font-mono text-purple-400">adorio.space/h/your-file</span>
          </p>
        </div>

        {/* Stats row */}
        {!loading && files.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Files', value: files.length },
              { label: 'Total views', value: totalViews.toLocaleString() },
              {
                label: 'Storage used',
                value: totalSize >= 1024 ? `${(totalSize / 1024).toFixed(1)} KB` : `${totalSize} B`,
              },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800/50">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone */}
        <div
          className={`mb-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            dragging
              ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
              : 'border-gray-700 hover:border-gray-500 hover:bg-white/[0.02]'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
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
          <div className="py-10 flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-sm text-gray-400">Uploading…</p>
              </>
            ) : (
              <>
                <CloudArrowUpIcon
                  className={`h-10 w-10 transition-colors ${dragging ? 'text-purple-400' : 'text-gray-600'}`}
                />
                <div className="text-center">
                  <p className="text-gray-300 text-sm font-medium">
                    Drop an HTML file or{' '}
                    <span className="text-purple-400 underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Only .html · max 512 KB</p>
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
              className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-red-950/40 border border-red-900/50 px-4 py-3"
            >
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-300 text-xs shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File list */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your files
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-900 animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 py-16 flex flex-col items-center gap-2">
              <DocumentIcon className="h-8 w-8 text-gray-700" />
              <p className="text-sm text-gray-600">No files yet — upload one above</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {files.map((f) => (
                  <motion.div
                    key={f._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 rounded-xl bg-gray-900 border border-gray-800/50 px-5 py-4 hover:border-gray-700/50 transition-colors"
                  >
                    <DocumentIcon className="h-5 w-5 text-gray-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {f.originalFilename}
                      </p>
                      <p className="font-mono text-xs text-purple-400 mt-0.5">/h/{f.slug}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {(f.size / 1024).toFixed(1)} KB &middot;{' '}
                        {f.views === 1 ? '1 view' : `${f.views} views`} &middot;{' '}
                        {new Date(f.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => copyUrl(f.slug)}
                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors min-w-[72px] text-center"
                      >
                        {copied === f.slug ? '✓ Copied' : 'Copy URL'}
                      </button>
                      <a
                        href={`/h/${f.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-gray-800 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(f.slug)}
                        disabled={deletingSlug === f.slug}
                        className="rounded-lg bg-red-950/40 p-1.5 text-red-500 hover:bg-red-950/70 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
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
      </div>
    </div>
  );
}
