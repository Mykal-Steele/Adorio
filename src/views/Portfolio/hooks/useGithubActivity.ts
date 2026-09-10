'use client';

import { useEffect, useState } from 'react';
import { readLocalCache, writeLocalCache } from '../utils/localCache';

export interface GithubCommit {
  sha: string;
  message: string;
  repo: string;
  branch: string;
  url: string;
  timestamp: string;
}

export interface GithubPullRequest {
  id: number;
  repo: string;
  title: string;
  status: 'open' | 'merged' | 'closed';
  action: string;
  url: string;
  timestamp: string;
}

const LS_COMMITS = 'gh_activity_commits';
const LS_PRS = 'gh_activity_prs';
const LS_TS = 'gh_activity_ts';

export function formatRelativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function useGithubActivity() {
  const [commits, setCommits] = useState<GithubCommit[] | null>(null);
  const [pullRequests, setPullRequests] = useState<GithubPullRequest[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cachedCommits = readLocalCache<GithubCommit[]>(LS_COMMITS);
    if (cachedCommits) setCommits(cachedCommits);
    const cachedPrs = readLocalCache<GithubPullRequest[]>(LS_PRS);
    if (cachedPrs) setPullRequests(cachedPrs);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/github-activity');
        const json = await res.json();
        if (!res.ok || json.error) {
          setError(true);
          return;
        }
        setCommits(json.commits ?? []);
        setPullRequests(json.pullRequests ?? []);
        setError(false);
        writeLocalCache(LS_COMMITS, json.commits ?? []);
        writeLocalCache(LS_PRS, json.pullRequests ?? []);
        if (json.ts) writeLocalCache(LS_TS, json.ts);
      } catch {
        setError(true);
      }
    };
    const t1 = setTimeout(load, 1500);
    const t2 = setInterval(load, 60_000);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  return { commits, pullRequests, error };
}
