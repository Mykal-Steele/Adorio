'use client';

import { useState, useEffect, useRef } from 'react';
import {
  uploadHostedFile,
  getMyHostedFiles,
  deleteHostedFile,
  type HostedFile,
} from '@/api/hosting';

export default function HostingView() {
  const [files, setFiles] = useState<HostedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [dragging, setDragging] = useState(false);
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
    try {
      await deleteHostedFile(slug);
      setFiles((prev) => prev.filter((f) => f.slug !== slug));
    } catch {
      setError('Failed to delete file');
    }
  };

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/h/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 pt-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-white">File Hosting</h1>
        <p className="mb-8 text-sm text-gray-400">
          Upload an HTML file and share it instantly at{' '}
          <span className="font-mono text-purple-400">adorio.space/h/your-filename</span>. No deploy
          required.
        </p>

        <div
          className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
            dragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-700 hover:border-gray-500'
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
          {uploading ? (
            <p className="text-gray-400">Uploading…</p>
          ) : (
            <>
              <p className="text-gray-300">Drop an HTML file here or click to browse</p>
              <p className="mt-1 text-xs text-gray-500">Only .html · max 512 KB</p>
            </>
          )}
        </div>

        {error && (
          <p className="mb-5 rounded-lg bg-red-950/50 px-4 py-2.5 text-sm text-red-400">{error}</p>
        )}

        <h2 className="mb-3 text-lg font-semibold text-white">Your files</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-gray-500">No files hosted yet.</p>
        ) : (
          <div className="space-y-3">
            {files.map((f) => (
              <div
                key={f._id}
                className="flex items-center justify-between gap-4 rounded-xl bg-gray-900 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{f.originalFilename}</p>
                  <p className="mt-0.5 font-mono text-xs text-purple-400">/h/{f.slug}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {(f.size / 1024).toFixed(1)} KB &middot; {f.views} view
                    {f.views !== 1 ? 's' : ''} &middot; {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => copyUrl(f.slug)}
                    className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                  >
                    {copied === f.slug ? 'Copied!' : 'Copy URL'}
                  </button>
                  <a
                    href={`/h/${f.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(f.slug)}
                    className="rounded-lg bg-red-950/50 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-950/80"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
