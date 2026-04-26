const BASE = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:3000';

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`serverFetch ${res.status}: ${path}`);
  return res.json();
}
