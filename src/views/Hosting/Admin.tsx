'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { getAllHostedFilesAdmin, deleteHostedFile, type HostedFile } from '@/api/hosting';

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
    <div className="min-h-screen bg-gray-950 px-4 py-8 pt-20">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-bold text-white">Admin — Hosted Files</h1>
        <p className="mb-8 text-sm text-gray-400">
          {files.length} file{files.length !== 1 ? 's' : ''} across {Object.keys(grouped).length}{' '}
          user{Object.keys(grouped).length !== 1 ? 's' : ''} &middot; {totalViews} total view
          {totalViews !== 1 ? 's' : ''}
        </p>

        {error && (
          <p className="mb-5 rounded-lg bg-red-950/50 px-4 py-2.5 text-sm text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-gray-500">No files hosted yet.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([username, userFiles]) => (
              <div key={username}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {username}{' '}
                  <span className="normal-case font-normal text-gray-600">
                    ({userFiles.length} file{userFiles.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="space-y-2">
                  {userFiles.map((f) => (
                    <div
                      key={f._id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-gray-900 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{f.originalFilename}</p>
                        <p className="mt-0.5 font-mono text-xs text-purple-400">/h/{f.slug}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
