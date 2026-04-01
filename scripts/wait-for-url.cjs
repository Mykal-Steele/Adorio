#!/usr/bin/env node

const targetUrl = process.argv[2];
const timeoutMs = Number(process.argv[3] || 120000);
const intervalMs = Number(process.argv[4] || 1000);

if (!targetUrl) {
  console.error(
    "Usage: bun scripts/wait-for-url.cjs <url> [timeoutMs] [intervalMs]",
  );
  process.exit(1);
}

const startedAt = Date.now();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  while (Date.now() - startedAt <= timeoutMs) {
    const ok = await probe(targetUrl);
    if (ok) {
      console.log(`Ready: ${targetUrl}`);
      process.exit(0);
    }

    await sleep(intervalMs);
  }

  console.error(`Timed out waiting for: ${targetUrl}`);
  process.exit(1);
})();
