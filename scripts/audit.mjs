#!/usr/bin/env node
/**
 * Adorio Site Audit v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Statistical multi-run benchmarking + comprehensive site quality audit.
 *
 * WHAT IT TESTS (per page):
 *   Performance  — 3× cold load avg/min/max/stddev/CV, 3× warm load same
 *   Core Web Vitals — FCP, LCP, CLS, TBT (injected PerformanceObserver)
 *   Navigation Timing — DNS, TCP+TLS, TTFB, Download, DOM Ready, Load
 *   Lighthouse — programmatic Performance / A11y / Best-Practices / SEO scores
 *   SEO          — title, description, OG, twitter, canonical, H1, JSON-LD
 *   Security     — 7 response headers scored, SSL cert info
 *   Accessibility — axe-core WCAG 2.1 AA violations (impact bucketed)
 *   UX           — interactive element density, tap target sizes, form labels,
 *                  text legibility, scroll depth, keyboard-focus rings
 *   Resources    — JS/CSS/IMG/Font breakdown, render-blocking, 3rd-party domains,
 *                  top-5 slowest + top-5 largest resources
 *   Content      — word count, link count, broken internal links, image audit
 *   Reliability  — coefficient of variation across runs, consistency grade
 *   Mobile       — repeat FCP/LCP/TTFB at 375×812 viewport
 *   Protocol     — HTTP/2 detection, redirect count
 *   Dynamic      — API call latency + post card scrape (on /home)
 *
 * Infrastructure checks (once):
 *   robots.txt · sitemap.xml · SSL cert · HSTS · Compression · Protocol
 *
 * Usage:
 *   node scripts/audit.mjs [base-url] [--runs=N]
 *   Defaults: https://adorio.space, 3 runs each
 */

import puppeteer from 'puppeteer';
import { createRequire } from 'module';
import https from 'https';
import tls from 'tls';
import dns from 'dns/promises';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');

// ── config ─────────────────────────────────────────────────────────────────────
const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'https://adorio.space';
const RUNS = parseInt(process.argv.find((a) => a.startsWith('--runs='))?.split('=')[1] ?? '3', 10);
const NOW = new Date().toLocaleString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** @type {Array<{path:string, name:string, dynamic:boolean}>} */
const PAGES = [
  { path: '/', name: 'Portfolio / Landing', dynamic: false },
  { path: '/home', name: 'Home (Feed)', dynamic: true },
  { path: '/login', name: 'Login', dynamic: false },
  { path: '/register', name: 'Register', dynamic: false },
  { path: '/coding', name: 'Coding', dynamic: false },
  { path: '/smartcity', name: 'Smart City', dynamic: false },
  { path: '/algo', name: 'Algo', dynamic: false },
  { path: '/profile', name: 'Profile (protected)', dynamic: false },
  { path: '/rygame', name: 'RyGame (protected)', dynamic: false },
  { path: '/data-lookup', name: 'Data Lookup (protected)', dynamic: false },
  { path: '/cao/', name: 'AI Sidecar (/cao/)', dynamic: false },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — TERMINAL STYLE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const R = '\x1b[0m';
const B = '\x1b[1m';
const DIM = '\x1b[2m';
const IT = '\x1b[3m';
const RED = '\x1b[31m';
const GRN = '\x1b[32m';
const YEL = '\x1b[33m';
const BLU = '\x1b[34m';
const MAG = '\x1b[35m';
const CYN = '\x1b[36m';
const WHT = '\x1b[37m';
const bgBLU = '\x1b[44m';
const bgGRN = '\x1b[42m';
const bgRED = '\x1b[41m';
const bgYEL = '\x1b[43m';
const bgMAG = '\x1b[45m';
const bgCYN = '\x1b[46m';

const co = (c, t) => `${c}${t}${R}`;
const bold = (t) => co(B, t);
const dim = (t) => co(DIM, t);
const it = (t) => co(IT, t);
const grn = (t) => co(GRN, t);
const yel = (t) => co(YEL, t);
const red = (t) => co(RED, t);
const cyn = (t) => co(CYN, t);
const mag = (t) => co(MAG, t);
const blu = (t) => co(BLU, t);
const OK = (t) => `${GRN}✔${R}  ${t}`;
const WARN = (t) => `${YEL}⚠${R}  ${t}`;
const FAIL = (t) => `${RED}✘${R}  ${t}`;
const INFO = (t) => `${CYN}ℹ${R}  ${t}`;

function stripAnsi(s) {
  return String(s).replace(/\x1b\[[0-9;]*m/g, '');
}
function padAnsi(str, width) {
  const vis = stripAnsi(str).length;
  return str + ' '.repeat(Math.max(0, width - vis));
}
function sep(char = '─', width = 78) {
  return co(DIM, char.repeat(width));
}
function truncate(str, len = 80) {
  if (!str) return dim('(empty)');
  const s = String(str).replace(/\n/g, ' ').trim();
  return s.length > len ? s.substring(0, len) + '…' : s;
}

/** Score badge with background colour */
function badge(score) {
  const n = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  const label = String(n).padStart(3);
  if (n >= 90) return co(bgGRN + B, ` ${label} `);
  if (n >= 70) return co(bgYEL + B, ` ${label} `);
  return co(bgRED + B, ` ${label} `);
}

/** Letter grade A–F */
function letterGrade(score) {
  if (score >= 90) return co(GRN + B, 'A');
  if (score >= 80) return co(GRN, 'B');
  if (score >= 70) return co(YEL, 'C');
  if (score >= 60) return co(YEL, 'D');
  return co(RED + B, 'F');
}

/** Colour millisecond value */
function msColor(ms, warn = 600, bad = 1500) {
  if (ms == null) return dim('  N/A');
  const v = Math.round(ms);
  if (v < warn) return grn(`${v}ms`);
  if (v < bad) return yel(`${v}ms`);
  return red(`${v}ms`);
}

/** CLS colour threshold */
function clsColor(v) {
  const f = (v ?? 0).toFixed(3);
  if (v <= 0.1) return grn(f);
  if (v <= 0.25) return yel(f);
  return red(f);
}

/** Horizontal timing bar */
function timingBar(ms, maxMs = 5000, width = 24) {
  if (!ms) return co(DIM, '░'.repeat(width));
  const ratio = Math.min(Math.max(ms, 0) / maxMs, 1);
  const filled = Math.max(1, Math.round(ratio * width));
  const empty = width - filled;
  const colour = ms < maxMs * 0.3 ? GRN : ms < maxMs * 0.6 ? YEL : RED;
  return co(colour, '█'.repeat(filled)) + co(DIM, '░'.repeat(empty));
}

/** +/- % change between two values */
function pctDelta(before, after) {
  if (!before || !after) return '';
  const d = Math.round(((after - before) / before) * 100);
  return d <= 0 ? grn(`(${d}%)`) : red(`(+${d}%)`);
}

/** Coefficient of variation colour */
function cvColor(cv) {
  if (cv < 0.1) return grn(`${(cv * 100).toFixed(1)}%`);
  if (cv < 0.25) return yel(`${(cv * 100).toFixed(1)}%`);
  return red(`${(cv * 100).toFixed(1)}%`);
}

/** Reliability label from CV */
function reliabilityLabel(cv) {
  if (cv < 0.1) return co(bgGRN + B, ' STABLE ');
  if (cv < 0.25) return co(bgYEL + B, ' VARIABLE ');
  return co(bgRED + B, ' UNSTABLE ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — STATISTICS UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/** @param {number[]} arr */
function stats(arr) {
  const valid = arr.filter((n) => n != null && isFinite(n));
  if (!valid.length) return { avg: null, min: null, max: null, sd: null, cv: null };
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const variance = valid.reduce((s, v) => s + (v - avg) ** 2, 0) / valid.length;
  const sd = Math.sqrt(variance);
  const cv = avg > 0 ? sd / avg : 0;
  return {
    avg: Math.round(avg),
    min: Math.round(min),
    max: Math.round(max),
    sd: Math.round(sd),
    cv,
  };
}

/** Format stats as "avg [min–max] ±sd" */
function fmtStats(s, warnMs, badMs) {
  if (!s || s.avg == null) return dim('N/A');
  const avgStr = msColor(s.avg, warnMs, badMs);
  const rangeStr = dim(`[${s.min}–${s.max}]`);
  const sdStr = dim(`±${s.sd}ms`);
  return `${avgStr}  ${rangeStr}  ${sdStr}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — COLLECTORS
// Each collector is a pure async function: (page) => result object
// Easy to add new collectors without touching runners or reporters.
// ═══════════════════════════════════════════════════════════════════════════════

/** Inject CWV PerformanceObservers BEFORE navigation */
async function injectCWV(page) {
  await page.evaluateOnNewDocument(() => {
    window.__cwv = { lcp: null, cls: 0, fcp: null, tbt: 0, longTaskCount: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__cwv.lcp = Math.round(e.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cwv.cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__cwv.longTaskCount++;
          if (e.duration > 50) window.__cwv.tbt += e.duration - 50;
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}
  });
}

/** Navigation + resource timing metrics */
async function collectTimingMetrics(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null;
    const res = performance.getEntriesByType('resource');

    const safe = (r) => Math.max(0, r.transferSize ?? 0);
    const jsKB = Math.round(
      res.filter((r) => r.initiatorType === 'script').reduce((s, r) => s + safe(r), 0) / 1024,
    );
    const cssKB = Math.round(
      res
        .filter((r) => r.initiatorType === 'link' && r.name.includes('.css'))
        .reduce((s, r) => s + safe(r), 0) / 1024,
    );
    const imgKB = Math.round(
      res.filter((r) => r.initiatorType === 'img').reduce((s, r) => s + safe(r), 0) / 1024,
    );
    const fontKB = Math.round(
      res
        .filter(
          (r) =>
            r.initiatorType === 'other' && (r.name.includes('.woff') || r.name.includes('.ttf')),
        )
        .reduce((s, r) => s + safe(r), 0) / 1024,
    );
    const totalKB = Math.round(res.reduce((s, r) => s + safe(r), 0) / 1024);

    const renderBlocking = res.filter(
      (r) => r.initiatorType === 'link' && r.renderBlockingStatus === 'blocking',
    ).length;

    // 3rd-party domains
    const origin = window.location.origin;
    const thirdPartyDomains = [
      ...new Set(
        res
          .filter((r) => !r.name.startsWith(origin) && !r.name.startsWith('data:'))
          .map((r) => {
            try {
              return new URL(r.name).hostname;
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      ),
    ];

    // Top 5 slowest resources by duration
    const slowest = [...res]
      .filter((r) => r.duration > 0)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((r) => ({
        name: r.name.split('/').pop().split('?')[0].substring(0, 40),
        ms: Math.round(r.duration),
      }));

    // Top 5 largest by transfer size
    const largest = [...res]
      .sort((a, b) => safe(b) - safe(a))
      .slice(0, 5)
      .map((r) => ({
        name: r.name.split('/').pop().split('?')[0].substring(0, 40),
        kb: Math.round(safe(r) / 1024),
      }));

    const externalScripts = [...document.querySelectorAll('script[src]')].filter(
      (s) => !s.src.startsWith(window.location.origin) && !s.src.includes('/_next/'),
    ).length;

    const images = [...document.querySelectorAll('img')];

    return {
      ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
      dns: nav ? Math.round(nav.domainLookupEnd - nav.domainLookupStart) : null,
      tcp: nav ? Math.round(nav.connectEnd - nav.connectStart) : null,
      download: nav ? Math.round(nav.responseEnd - nav.responseStart) : null,
      domInteractive: nav ? Math.round(nav.domInteractive) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd) : null,
      fcp: fcp ? Math.round(fcp) : null,
      resourceCount: res.length,
      jsKB,
      cssKB,
      imgKB,
      fontKB,
      totalKB,
      renderBlocking,
      externalScripts,
      thirdPartyDomains,
      slowest,
      largest,
      imagesTotal: images.length,
      imagesNoAlt: images.filter((i) => !i.alt?.trim()).length,
      imagesNotLazy: images.filter((i) => i.loading !== 'lazy').length,
      domNodes: document.querySelectorAll('*').length,
    };
  });
}

/** CWV after page load settles */
async function collectCWV(page) {
  return page.evaluate(() => window.__cwv ?? {});
}

/** SEO signals */
async function collectSEO(page) {
  return page.evaluate(() => {
    const get = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null;
    const getAttr = (sel, attr) => document.querySelector(sel)?.getAttribute(attr) ?? null;
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const h1s = [...document.querySelectorAll('h1')].map((h) => h.innerText?.trim() ?? '');
    return {
      title: document.title,
      description: get('meta[name="description"]'),
      ogTitle: get('meta[property="og:title"]'),
      ogImage: get('meta[property="og:image"]'),
      twitterCard: get('meta[name="twitter:card"]'),
      canonical: getAttr('link[rel="canonical"]', 'href'),
      h1Count: h1s.length,
      h1Text: h1s[0] ?? null,
      langAttr: document.documentElement.getAttribute('lang'),
      hasViewport: !!document.querySelector('meta[name="viewport"]'),
      jsonLd,
      robotsMeta: get('meta[name="robots"]'),
    };
  });
}

/** UX heuristics — interactive density, tap targets, forms, legibility */
async function collectUX(page) {
  return page.evaluate(() => {
    const allInteractive = [
      ...document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [tabindex]',
      ),
    ];
    const buttons = [...document.querySelectorAll('button, [role="button"]')];
    const links = [...document.querySelectorAll('a[href]')];
    const inputs = [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')];

    // Tap target size audit (< 44×44px is a problem per WCAG 2.5.5)
    const smallTargets = allInteractive.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
    }).length;

    // Form label coverage
    const unlabeledInputs = inputs.filter((el) => {
      const id = el.id;
      return (
        !el.getAttribute('aria-label') &&
        !el.getAttribute('aria-labelledby') &&
        !(id && document.querySelector(`label[for="${id}"]`))
      );
    }).length;

    // Text legibility: count paragraphs with font-size < 14px
    const paras = [...document.querySelectorAll('p, li, span')].slice(0, 50);
    const smallText = paras.filter((el) => {
      const fs = parseFloat(window.getComputedStyle(el).fontSize);
      return fs < 14;
    }).length;

    // Focus ring: check if any focusable element has outline:none without other focus style
    const missingFocusRing = [...document.querySelectorAll('a, button, [tabindex="0"]')].filter(
      (el) => {
        const s = window.getComputedStyle(el, ':focus');
        return s.outlineStyle === 'none' || s.outlineWidth === '0px';
      },
    ).length;

    // Scroll depth indicator (page height vs viewport)
    const scrollRatio = document.documentElement.scrollHeight / (window.innerHeight || 1);

    // Internal vs external links
    const internalLinks = links.filter((a) => a.href.startsWith(window.location.origin)).length;
    const externalLinks = links.length - internalLinks;

    // Word count approximation
    const bodyText = document.body.innerText ?? '';
    const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 1).length;

    return {
      interactiveCount: allInteractive.length,
      buttonCount: buttons.length,
      linkCount: links.length,
      inputCount: inputs.length,
      smallTargets,
      unlabeledInputs,
      smallText,
      missingFocusRing,
      scrollRatio: Math.round(scrollRatio * 10) / 10,
      internalLinks,
      externalLinks,
      wordCount,
    };
  });
}

/** Content quality: broken links check (internal only, head requests) */
async function collectBrokenLinks(page) {
  const hrefs = await page.evaluate(() => {
    return [...document.querySelectorAll('a[href]')]
      .map((a) => a.href)
      .filter((h) => h.startsWith(window.location.origin) && !h.includes('#'))
      .slice(0, 10); // cap to avoid long waits
  });

  const broken = [];
  await Promise.allSettled(
    hrefs.map(async (href) => {
      try {
        const r = await fetch(href, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (r.status >= 400) broken.push({ href, status: r.status });
      } catch {
        broken.push({ href, status: 0 });
      }
    }),
  );
  return { checked: hrefs.length, broken };
}

/** axe-core WCAG 2.1 AA */
async function collectA11y(page) {
  try {
    await page.addScriptTag({ path: AXE_PATH });
    return await page.evaluate(async () => {
      const r = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
      return {
        violations: r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          count: v.nodes.length,
        })),
        passes: r.passes.length,
      };
    });
  } catch {
    return { violations: [], passes: 0 };
  }
}

/** Dynamic content scraping (posts on /home) */
async function collectDynamic(page, entry) {
  if (!entry.dynamic) return null;
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-post-id]')];
    return {
      postCount: cards.length,
      posts: cards.slice(0, 3).map((card) => ({
        title: (card.querySelector('h2')?.innerText ?? '').trim().substring(0, 55),
        body: (card.querySelector('p')?.innerText ?? '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 90),
        author: (card.querySelector('.font-medium')?.innerText ?? '').trim().substring(0, 20),
        time: (card.querySelectorAll('p')[1]?.innerText ?? '').trim().substring(0, 14),
      })),
    };
  });
}

/** Intercept /api/* calls */
function setupApiInterception(page) {
  const calls = [];
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/') && !url.includes('/_next/')) {
      const t = res.timing();
      calls.push({
        path: url.replace(BASE, '').split('?')[0],
        status: res.status(),
        ms: t ? Math.round(t.receiveHeadersEnd) : null,
      });
    }
  });
  return calls;
}

/** HTTP response headers */
async function collectHeaders(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const h = Object.fromEntries(res.headers);
    return {
      status: res.status,
      contentType: h['content-type'] ?? 'N/A',
      encoding: h['content-encoding'] ?? null,
      xFrameOptions: h['x-frame-options'] ?? null,
      xContentTypeOptions: h['x-content-type-options'] ?? null,
      referrerPolicy: h['referrer-policy'] ?? null,
      csp: h['content-security-policy'] ?? null,
      hsts: h['strict-transport-security'] ?? null,
      permissions: h['permissions-policy'] ?? null,
      cacheControl: h['cache-control'] ?? null,
      poweredBy: h['x-powered-by'] ?? null,
      vary: h['vary'] ?? null,
      etag: !!h['etag'],
    };
  } catch {
    return { status: 0 };
  }
}

/** SSL certificate details (Node TLS) */
async function collectSSL(hostname) {
  return new Promise((resolve) => {
    try {
      const sock = tls.connect(443, hostname, { servername: hostname, timeout: 6000 }, () => {
        const cert = sock.getPeerCertificate(false);
        sock.destroy();
        const exp = cert.valid_to ? new Date(cert.valid_to) : null;
        const daysLeft = exp ? Math.round((exp - Date.now()) / 86_400_000) : null;
        resolve({
          valid: sock.authorized,
          subject: cert.subject?.CN ?? null,
          issuer: cert.issuer?.O ?? null,
          expiresAt: exp?.toLocaleDateString('en-GB') ?? null,
          daysLeft,
          protocol: sock.getProtocol(),
        });
      });
      sock.on('error', () => resolve({ valid: false }));
      sock.setTimeout(6000, () => {
        sock.destroy();
        resolve({ valid: false });
      });
    } catch {
      resolve({ valid: false });
    }
  });
}

/** DNS timing from Node (complements browser timing) */
async function collectDNS(hostname) {
  const start = Date.now();
  try {
    await dns.lookup(hostname);
    return { ms: Date.now() - start };
  } catch {
    return { ms: null };
  }
}

/** Infrastructure one-time checks */
async function collectInfrastructure() {
  const [robots, sitemap, root] = await Promise.all([
    fetch(`${BASE}/robots.txt`, { redirect: 'follow' }).catch(() => null),
    fetch(`${BASE}/sitemap.xml`, { redirect: 'follow' }).catch(() => null),
    fetch(BASE, { redirect: 'follow' }).catch(() => null),
  ]);

  const robotsBody = robots ? await robots.text() : '';
  const sitemapBody = sitemap ? await sitemap.text() : '';
  const h = root ? Object.fromEntries(root.headers) : {};

  const hostname = new URL(BASE).hostname;
  const [ssl, dnsInfo] = await Promise.all([collectSSL(hostname), collectDNS(hostname)]);

  return {
    robotsOk: (robots?.status ?? 0) === 200,
    robotsSitemap: robotsBody.match(/Sitemap:\s*(\S+)/i)?.[1] ?? null,
    sitemapOk: (sitemap?.status ?? 0) === 200,
    sitemapUrlCount: (sitemapBody.match(/<loc>/g) || []).length,
    hsts: h['strict-transport-security'] ?? null,
    encoding: h['content-encoding'] ?? null,
    poweredBy: h['x-powered-by'] ?? null,
    permissions: h['permissions-policy'] ?? null,
    server: h['server'] ?? null,
    ssl,
    dns: dnsInfo,
    redirectCount: 0, // fetch follows redirects, we can't count easily without raw
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — SCORERS
// Pure functions: (data) => { score: number, issues: string[] }
// ═══════════════════════════════════════════════════════════════════════════════

function scoreSEO(seo) {
  let s = 100;
  const issues = [];
  const tl = seo.title?.length ?? 0;
  if (!seo.title || tl < 5) {
    s -= 15;
    issues.push('Missing or too short <title>');
  } else if (tl > 70) {
    s -= 5;
    issues.push(`Title too long (${tl} chars)`);
  }
  if (!seo.description) {
    s -= 15;
    issues.push('Missing meta description');
  } else if (seo.description.length > 160) {
    s -= 5;
    issues.push('Description >160 chars');
  }
  if (!seo.ogTitle) {
    s -= 5;
    issues.push('Missing og:title');
  }
  if (!seo.ogImage) {
    s -= 5;
    issues.push('Missing og:image');
  }
  if (!seo.twitterCard) {
    s -= 5;
    issues.push('Missing twitter:card');
  }
  if (!seo.canonical) {
    s -= 5;
    issues.push('Missing canonical link');
  }
  if (seo.h1Count === 0) {
    s -= 10;
    issues.push('No <h1> tag');
  }
  if (seo.h1Count > 1) {
    s -= 5;
    issues.push(`Multiple <h1> tags (${seo.h1Count})`);
  }
  if (!seo.langAttr) {
    s -= 5;
    issues.push('Missing lang attribute');
  }
  if (!seo.hasViewport) {
    s -= 10;
    issues.push('Missing viewport meta');
  }
  return { score: Math.max(0, s), issues };
}

function scorePerf(timing, cwv) {
  let s = 100;
  const issues = [];
  const fcp = cwv?.fcp ?? timing?.avg?.fcp;
  const lcp = cwv?.lcp;
  const cls = cwv?.cls ?? 0;
  const tbt = Math.round(cwv?.tbt ?? 0);
  const ttfb = timing?.avg?.ttfb;

  if (fcp > 3000) {
    s -= 20;
    issues.push(`FCP ${fcp}ms — poor (>3s)`);
  } else if (fcp > 1800) {
    s -= 10;
    issues.push(`FCP ${fcp}ms — needs improvement`);
  }
  if (lcp && lcp > 4000) {
    s -= 25;
    issues.push(`LCP ${lcp}ms — poor (>4s)`);
  } else if (lcp && lcp > 2500) {
    s -= 10;
    issues.push(`LCP ${lcp}ms — needs improvement`);
  }
  if (ttfb > 1800) {
    s -= 20;
    issues.push(`TTFB ${ttfb}ms — poor (>1.8s)`);
  } else if (ttfb > 800) {
    s -= 10;
    issues.push(`TTFB ${ttfb}ms — slow (>800ms)`);
  } else if (ttfb > 200) {
    s -= 3;
    issues.push(`TTFB ${ttfb}ms (>200ms)`);
  }
  if (cls > 0.25) {
    s -= 15;
    issues.push(`CLS ${cls.toFixed(3)} — poor`);
  } else if (cls > 0.1) {
    s -= 5;
    issues.push(`CLS ${cls.toFixed(3)} — needs improvement`);
  }
  if (tbt > 600) {
    s -= 15;
    issues.push(`TBT ~${tbt}ms — poor`);
  } else if (tbt > 300) {
    s -= 5;
    issues.push(`TBT ~${tbt}ms — needs improvement`);
  }
  return { score: Math.max(0, s), issues };
}

function scoreSecurity(h) {
  let s = 100;
  const issues = [];
  if (!h.csp) {
    s -= 25;
    issues.push('Missing Content-Security-Policy');
  }
  if (!h.hsts) {
    s -= 15;
    issues.push('Missing HSTS');
  }
  if (!h.xFrameOptions) {
    s -= 15;
    issues.push('Missing X-Frame-Options');
  }
  if (!h.xContentTypeOptions) {
    s -= 15;
    issues.push('Missing X-Content-Type-Options');
  }
  if (!h.referrerPolicy) {
    s -= 10;
    issues.push('Missing Referrer-Policy');
  }
  if (!h.permissions) {
    s -= 10;
    issues.push('Missing Permissions-Policy');
  }
  if (h.poweredBy) {
    s -= 5;
    issues.push(`X-Powered-By exposed: ${h.poweredBy}`);
  }
  return { score: Math.max(0, s), issues };
}

function scoreA11y(axeData) {
  let s = 100;
  const issues = [];
  for (const v of axeData?.violations ?? []) {
    const d =
      v.impact === 'critical' ? 25 : v.impact === 'serious' ? 10 : v.impact === 'moderate' ? 5 : 2;
    s -= d;
    issues.push(v);
  }
  return { score: Math.max(0, s), issues };
}

function scoreUX(ux) {
  let s = 100;
  const issues = [];
  if (ux.smallTargets > 5) {
    s -= 15;
    issues.push(`${ux.smallTargets} tap targets <44px`);
  } else if (ux.smallTargets > 0) {
    s -= 5;
    issues.push(`${ux.smallTargets} small tap targets`);
  }
  if (ux.unlabeledInputs > 0) {
    s -= 20;
    issues.push(`${ux.unlabeledInputs} unlabeled inputs`);
  }
  if (ux.missingFocusRing > 5) {
    s -= 10;
    issues.push(`${ux.missingFocusRing} elements missing focus ring`);
  }
  if (ux.smallText > 5) {
    s -= 10;
    issues.push(`${ux.smallText} elements with font <14px`);
  }
  return { score: Math.max(0, s), issues };
}

function scoreReliability(coldCV) {
  // CV-based reliability score
  if (coldCV == null) return { score: 100, issues: [] };
  const pct = coldCV * 100;
  if (pct < 10) return { score: 100, issues: [] };
  if (pct < 20)
    return { score: 80, issues: [`Load time CV ${pct.toFixed(1)}% — slightly variable`] };
  if (pct < 35)
    return { score: 60, issues: [`Load time CV ${pct.toFixed(1)}% — moderate variance`] };
  return { score: 30, issues: [`Load time CV ${pct.toFixed(1)}% — highly unstable`] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — RUNNER
// Runs N cold and N warm measurements, returning raw arrays + aggregated stats.
// ═══════════════════════════════════════════════════════════════════════════════

async function runTimingPass(ctx, url, { isWarm = false } = {}) {
  const page = await ctx.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await injectCWV(page);

  const start = Date.now();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
  } catch (e) {
    if (!e.message.includes('timeout')) throw e;
  }
  await new Promise((r) => setTimeout(r, isWarm ? 600 : 1500));

  const [timing, cwv] = await Promise.all([collectTimingMetrics(page), collectCWV(page)]);
  const elapsed = Date.now() - start;
  await page.close();
  return { timing, cwv, elapsed };
}

/**
 * Audit one page with N cold runs (isolated contexts) + N warm runs (same context).
 * Returns all raw data needed by reporters.
 */
async function auditPage(browser, entry) {
  const url = BASE + entry.path;

  const coldResults = [];
  let seo, axeData, uxData, dynamicData, apiCalls, brokenLinks;

  // ── N cold runs ────────────────────────────────────────────────────────────
  for (let i = 0; i < RUNS; i++) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    apiCalls = i === 0 ? setupApiInterception(page) : apiCalls;
    await injectCWV(page);

    const start = Date.now();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
    } catch (e) {
      if (!e.message.includes('timeout')) {
        await ctx.close();
        throw e;
      }
    }
    await new Promise((r) => setTimeout(r, 1500));

    const [timing, cwv] = await Promise.all([collectTimingMetrics(page), collectCWV(page)]);
    const elapsed = Date.now() - start;

    // Only run heavy collectors once (on first cold run)
    if (i === 0) {
      [seo, axeData, uxData, dynamicData, brokenLinks] = await Promise.all([
        collectSEO(page),
        collectA11y(page),
        collectUX(page),
        collectDynamic(page, entry),
        collectBrokenLinks(page),
      ]);
    }

    coldResults.push({ timing, cwv, elapsed });
    await page.close();
    await ctx.close();
  }

  // ── N warm runs (new shared context so cache is fresh) ─────────────────────
  const warmResults = [];
  const warmCtx = await browser.createBrowserContext();

  // Prime the cache with one cold load inside the warm context
  {
    const primePage = await warmCtx.newPage();
    await primePage.setViewport({ width: 1280, height: 800 });
    try {
      await primePage.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
    } catch (_) {}
    await primePage.close();
  }

  for (let i = 0; i < RUNS; i++) {
    const pass = await runTimingPass(warmCtx, url, { isWarm: true });
    warmResults.push(pass);
  }
  await warmCtx.close();

  // ── mobile run (single, cold, 375×812) ─────────────────────────────────────
  let mobileTiming = null,
    mobileCWV = null;
  try {
    const mCtx = await browser.createBrowserContext();
    const mPage = await mCtx.newPage();
    await mPage.setViewport({ width: 375, height: 812, isMobile: true, deviceScaleFactor: 2 });
    await injectCWV(mPage);
    try {
      await mPage.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 1200));
    [mobileTiming, mobileCWV] = await Promise.all([collectTimingMetrics(mPage), collectCWV(mPage)]);
    await mPage.close();
    await mCtx.close();
  } catch (_) {}

  // ── headers ────────────────────────────────────────────────────────────────
  const headers = await collectHeaders(url);

  // ── aggregate stats ────────────────────────────────────────────────────────
  const coldStats = {
    ttfb: stats(coldResults.map((r) => r.timing.ttfb)),
    fcp: stats(coldResults.map((r) => r.cwv.fcp ?? r.timing.fcp)),
    lcp: stats(coldResults.map((r) => r.cwv.lcp)),
    load: stats(coldResults.map((r) => r.timing.loadEvent)),
    elapsed: stats(coldResults.map((r) => r.elapsed)),
    cls: stats(coldResults.map((r) => r.cwv.cls)),
    tbt: stats(coldResults.map((r) => r.cwv.tbt)),
  };
  const warmStats = {
    ttfb: stats(warmResults.map((r) => r.timing.ttfb)),
    fcp: stats(warmResults.map((r) => r.cwv.fcp ?? r.timing.fcp)),
    load: stats(warmResults.map((r) => r.timing.loadEvent)),
  };

  // Use first cold run's non-statistical metrics (resources, DOM, etc.)
  const snapshot = coldResults[0].timing;
  const cwvSnapshot = coldResults[0].cwv;

  return {
    coldResults,
    warmResults,
    coldStats,
    warmStats,
    snapshot,
    cwvSnapshot,
    mobileTiming,
    mobileCWV,
    headers,
    seo,
    axeData,
    uxData,
    dynamicData,
    apiCalls,
    brokenLinks,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — REPORTERS
// Each reporter prints a section. They receive the aggregated page data object.
// ═══════════════════════════════════════════════════════════════════════════════

function reportHeader(idx, total, entry, headers) {
  const statusColor = (headers.status ?? 0) < 400 ? GRN : RED;
  console.log(`\n${sep('━')}`);
  console.log(
    `${co(bgBLU + B, ` [${idx}/${total}] `)}  ${bold(entry.name)}  ${dim('▸')}  ${dim(BASE + entry.path)}`,
  );
  console.log(
    `  ${co(statusColor + B, ` ${headers.status ?? 0} `)}` +
      `  ${dim(headers.contentType?.split(';')[0] ?? '')}` +
      `  ${dim('·')}  ${dim(headers.encoding === 'br' ? '🗜 brotli' : headers.encoding === 'gzip' ? '🗜 gzip' : 'no compression')}`,
  );
  console.log(sep('─'));
}

function reportPerformance(coldStats, warmStats, snapshot, cwvSnapshot, mobileTiming, mobileCWV) {
  console.log(`\n  ${co(bgCYN + B, '  PERFORMANCE  ')}`);

  // ── cold stats table ───────────────────────────────────────────────────────
  console.log(`\n  ${bold('COLD LOAD')}  ${dim(`(${RUNS} isolated runs — empty cache)`)}`);

  const perfRows = [
    ['TTFB', coldStats.ttfb, 200, 1800],
    ['FCP', coldStats.fcp, 1800, 3000],
    ['LCP', coldStats.lcp, 2500, 4000],
    ['Load Complete', coldStats.load, 2000, 5000],
  ];

  console.log(
    `  ${dim('Metric'.padEnd(15))}  ${dim('Avg'.padEnd(10))}  ${dim('Min'.padEnd(8))}  ${dim('Max'.padEnd(8))}  ${dim('±SD'.padEnd(8))}  ${dim('CV')}  ${dim('Bar (avg)')}`,
  );
  console.log(`  ${dim('─'.repeat(73))}`);
  for (const [label, st, warn, bad] of perfRows) {
    if (!st || st.avg == null) continue;
    const avgC = msColor(st.avg, warn, bad);
    const minC = dim(`${st.min}ms`);
    const maxC = dim(`${st.max}ms`);
    const sdC = dim(`±${st.sd}ms`);
    const cvC = cvColor(st.cv ?? 0);
    const bar = timingBar(st.avg, 6000);
    console.log(
      `  ${dim(label.padEnd(15))}  ${padAnsi(avgC, 12)}  ${padAnsi(minC, 10)}  ${padAnsi(maxC, 10)}  ${padAnsi(sdC, 10)}  ${padAnsi(cvC, 8)}  ${bar}`,
    );
  }

  // ── CWV box ───────────────────────────────────────────────────────────────
  const fcp = coldStats.fcp?.avg ?? cwvSnapshot?.fcp;
  const lcp = coldStats.lcp?.avg ?? cwvSnapshot?.lcp;
  const cls =
    coldStats.cls?.avg != null
      ? (coldStats.cls.avg / 1000).toFixed(3)
      : (cwvSnapshot?.cls ?? 0).toFixed(3);
  const tbt = coldStats.tbt?.avg ?? Math.round(cwvSnapshot?.tbt ?? 0);
  const clsVal = parseFloat(cls);

  console.log(`\n  ${dim('┌' + '─'.repeat(66) + '┐')}`);
  console.log(
    `  ${dim('│')}  ${bold('Core Web Vitals')}  ${dim('(avg across runs)')}${' '.repeat(37)}${dim('│')}`,
  );
  console.log(
    `  ${dim('│')}  ${padAnsi('FCP  ' + msColor(fcp, 1800, 3000), 32)}  ${padAnsi('LCP  ' + (lcp ? msColor(lcp, 2500, 4000) : dim('N/A')), 32)}${dim('│')}`,
  );
  console.log(
    `  ${dim('│')}  ${padAnsi('CLS  ' + clsColor(clsVal), 32)}  ${padAnsi('TBT  ' + (tbt > 300 ? yel(`~${tbt}ms`) : tbt > 0 ? grn(`~${tbt}ms`) : dim('~0ms')), 32)}${dim('│')}`,
  );
  console.log(`  ${dim('└' + '─'.repeat(66) + '┘')}`);

  // Reliability indicator
  const ttfbCV = coldStats.ttfb?.cv ?? 0;
  console.log(
    `\n  ${bold('RELIABILITY')}  ${reliabilityLabel(ttfbCV)}  ${dim('TTFB coefficient of variation:')}  ${cvColor(ttfbCV)}`,
  );

  // ── warm cache stats (same table style as cold) ────────────────────────────
  console.log(`\n  ${bold('WARM CACHE')}  ${dim(`(${RUNS} runs — cache populated, vs cold avg)`)}`);
  const warmRows = [
    ['TTFB', warmStats.ttfb, 200, 600, coldStats.ttfb?.avg],
    ['FCP', warmStats.fcp, 600, 1200, coldStats.fcp?.avg],
    ['Load Complete', warmStats.load, 800, 2000, coldStats.load?.avg],
  ];
  console.log(
    `  ${dim('Metric'.padEnd(15))}  ${dim('Avg'.padEnd(10))}  ${dim('Min'.padEnd(8))}  ${dim('Max'.padEnd(8))}  ${dim('\u00b1SD'.padEnd(8))}  ${dim('CV')}  ${dim('Bar (avg)')}  ${dim('vs Cold')}`,
  );
  console.log(`  ${dim('─'.repeat(80))}`);
  for (const [label, st, warn, bad, coldAvg] of warmRows) {
    if (!st || st.avg == null) continue;
    const avgC = msColor(st.avg, warn, bad);
    const minC = dim(`${st.min}ms`);
    const maxC = dim(`${st.max}ms`);
    const sdC = dim(`\u00b1${st.sd}ms`);
    const cvC = cvColor(st.cv ?? 0);
    const bar = timingBar(st.avg, 6000);
    const d = coldAvg != null ? `  ${pctDelta(coldAvg, st.avg)}` : '';
    console.log(
      `  ${dim(label.padEnd(15))}  ${padAnsi(avgC, 12)}  ${padAnsi(minC, 10)}  ${padAnsi(maxC, 10)}  ${padAnsi(sdC, 10)}  ${padAnsi(cvC, 8)}  ${bar}${d}`,
    );
  }

  // ── mobile ────────────────────────────────────────────────────────────────
  if (mobileTiming) {
    const mFcp = mobileCWV?.fcp ?? mobileTiming.fcp;
    const mLcp = mobileCWV?.lcp;
    console.log(`\n  ${bold('MOBILE')}  ${dim('(375×812, single run)')}`);
    console.log(
      `  ${dim('TTFB')}  ${msColor(mobileTiming.ttfb, 600, 1800)}  ${dim('·')}  ${dim('FCP')}  ${msColor(mFcp, 1800, 3000)}  ${dim('·')}  ${dim('LCP')}  ${mLcp ? msColor(mLcp, 2500, 4000) : dim('N/A')}`,
    );
    if (mFcp && fcp) {
      const mobDelta = Math.round(((mFcp - fcp) / fcp) * 100);
      console.log(
        `  ${dim('Mobile vs Desktop FCP:')}  ${mobDelta > 0 ? red(`+${mobDelta}% slower on mobile`) : grn(`${mobDelta}% vs desktop`)}`,
      );
    }
  }

  // ── nav timing breakdown (first cold run) ─────────────────────────────────
  if (snapshot) {
    console.log(`\n  ${bold('NAV TIMING BREAKDOWN')}  ${dim('(first cold run)')}`);
    const navRows2 = [
      ['DNS lookup', snapshot.dns, 200, 800],
      ['TCP + TLS', snapshot.tcp, 300, 1000],
      ['Download', snapshot.download, 100, 400],
      ['DOM Interactive', snapshot.domInteractive, 1500, 3500],
    ];
    for (const [label, val, warn, bad] of navRows2) {
      if (val == null) continue;
      console.log(
        `  ${dim(label.padEnd(16))}  ${timingBar(val, 5000)}  ${msColor(val, warn, bad)}`,
      );
    }
  }
}

function reportResources(snapshot, headers) {
  if (!snapshot) return;
  console.log(`\n  ${co(bgCYN + B, '  RESOURCES  ')}`);
  const enc =
    headers.encoding === 'br'
      ? grn('brotli')
      : headers.encoding === 'gzip'
        ? yel('gzip')
        : red('none');
  console.log(
    `  ${dim('JS')} ${yel(snapshot.jsKB + 'KB')}  ${dim('CSS')} ${cyn(snapshot.cssKB + 'KB')}  ${dim('IMG')} ${mag(snapshot.imgKB + 'KB')}  ${dim('Font')} ${blu(snapshot.fontKB + 'KB')}  ${dim('Total')} ${bold(snapshot.totalKB + 'KB')}  ${dim('Encoding')} ${enc}`,
  );
  console.log(
    `  ${dim('DOM nodes')} ${snapshot.domNodes}  ${dim('Resources')} ${snapshot.resourceCount}  ${dim('Ext. scripts')} ${snapshot.externalScripts}`,
  );
  console.log(
    `  ${snapshot.renderBlocking > 0 ? WARN(snapshot.renderBlocking + ' render-blocking resource(s)') : OK('0 render-blocking')}`,
  );

  if (snapshot.thirdPartyDomains?.length) {
    const tp = snapshot.thirdPartyDomains.length;
    const label = tp > 5 ? WARN(`${tp} third-party domains`) : dim(`${tp} third-party domains`);
    console.log(
      `  ${label}  ${dim(snapshot.thirdPartyDomains.slice(0, 4).join(', ') + (tp > 4 ? ' …' : ''))}`,
    );
  }

  if (snapshot.imagesTotal > 0) {
    const altStr =
      snapshot.imagesNoAlt === 0
        ? OK(`all ${snapshot.imagesTotal} imgs have alt`)
        : WARN(`${snapshot.imagesNoAlt}/${snapshot.imagesTotal} missing alt`);
    const lazyStr =
      snapshot.imagesNotLazy === 0
        ? OK('all lazy-loaded')
        : WARN(`${snapshot.imagesNotLazy}/${snapshot.imagesTotal} not lazy-loaded`);
    console.log(`  ${altStr}    ${lazyStr}`);
  }

  if (snapshot.slowest?.length) {
    console.log(`\n  ${dim('Slowest resources:')}`);
    for (const r of snapshot.slowest) console.log(`  ${msColor(r.ms, 300, 800)}  ${dim(r.name)}`);
  }
  if (snapshot.largest?.length) {
    console.log(`\n  ${dim('Largest resources:')}`);
    for (const r of snapshot.largest)
      console.log(`  ${r.kb > 500 ? yel(r.kb + 'KB') : dim(r.kb + 'KB')}  ${dim(r.name)}`);
  }
}

function reportSEO(seo, seoScore) {
  console.log(
    `\n  ${co(bgCYN + B, '  SEO  ')}  ${badge(seoScore.score)}  ${letterGrade(seoScore.score)}`,
  );
  const tl = seo.title?.length ?? 0;
  const dl = seo.description?.length ?? 0;
  const row = (lbl, ok, detail) =>
    console.log(`  ${dim(lbl.padEnd(13))}  ${ok ? OK(detail) : WARN(detail)}`);
  row(
    'Title',
    !!seo.title && tl <= 70,
    seo.title ? `"${truncate(seo.title, 48)}"  (${tl})` : 'Missing',
  );
  row(
    'Description',
    !!seo.description && dl <= 160,
    seo.description ? `"${truncate(seo.description, 50)}"  (${dl})` : 'Missing',
  );
  row('OG title', !!seo.ogTitle, seo.ogTitle ? truncate(seo.ogTitle, 50) : 'Missing');
  row('OG image', !!seo.ogImage, seo.ogImage ? truncate(seo.ogImage, 50) : 'Missing');
  row('Twitter', !!seo.twitterCard, seo.twitterCard || 'Missing');
  row('Canonical', !!seo.canonical, seo.canonical ? truncate(seo.canonical, 50) : 'Missing');
  row(
    'H1',
    seo.h1Count === 1,
    seo.h1Count === 1 ? `"${truncate(seo.h1Text ?? '', 45)}"` : `${seo.h1Count} found`,
  );
  row(
    'JSON-LD',
    (seo.jsonLd?.length ?? 0) > 0,
    (seo.jsonLd?.length ?? 0) > 0 ? `${seo.jsonLd.length} block(s)` : 'None',
  );
  row('lang attr', !!seo.langAttr, seo.langAttr || 'Missing');
}

function reportSecurity(headers, secScore) {
  console.log(
    `\n  ${co(bgCYN + B, '  SECURITY  ')}  ${badge(secScore.score)}  ${letterGrade(secScore.score)}`,
  );
  const dupFrame = (headers.xFrameOptions ?? '').split(',').length > 1;
  const r = (lbl, ok, detail) =>
    console.log(`  ${dim(lbl.padEnd(20))}  ${ok ? OK(detail) : FAIL(detail)}`);
  r('HSTS', !!headers.hsts, headers.hsts ? truncate(headers.hsts, 50) : 'Missing');
  r('CSP', !!headers.csp, headers.csp ? 'Present' : 'Missing  (−25)');
  r(
    'X-Frame-Options',
    !!headers.xFrameOptions,
    headers.xFrameOptions
      ? dupFrame
        ? `${headers.xFrameOptions}  ⚠ dup`
        : headers.xFrameOptions
      : 'Missing',
  );
  r('X-Content-Type', !!headers.xContentTypeOptions, headers.xContentTypeOptions || 'Missing');
  r('Referrer-Policy', !!headers.referrerPolicy, headers.referrerPolicy || 'Missing');
  r(
    'Permissions-Policy',
    !!headers.permissions,
    headers.permissions ? truncate(headers.permissions, 40) : 'Missing',
  );
  console.log(
    `  ${dim('Cache-Control'.padEnd(20))}  ${dim(headers.cacheControl ? truncate(headers.cacheControl, 50) : 'Not set')}`,
  );
  console.log(`  ${dim('ETag'.padEnd(20))}  ${headers.etag ? OK('present') : dim('none')}`);
  console.log(
    `  ${headers.poweredBy ? WARN(`X-Powered-By: ${headers.poweredBy}`) : OK('X-Powered-By hidden')}`,
  );
}

function reportA11y(axeData, a11yScore) {
  console.log(
    `\n  ${co(bgCYN + B, '  ACCESSIBILITY  ')}  ${badge(a11yScore.score)}  ${letterGrade(a11yScore.score)}  ${dim('WCAG 2.1 AA')}`,
  );
  const violations = axeData?.violations ?? [];
  const passes = axeData?.passes ?? 0;
  const ct = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of violations) ct[v.impact] = (ct[v.impact] ?? 0) + 1;

  if (!violations.length) {
    console.log(`  ${OK(`0 violations  ·  ${passes} checks passed`)}`);
  } else {
    console.log(
      `  ${co(RED + B, ct.critical + ' critical')}  ·  ${co(YEL, ct.serious + ' serious')}  ·  ${co(MAG, ct.moderate + ' moderate')}  ·  ${dim(ct.minor + ' minor')}`,
    );
    if (passes) console.log(`  ${dim(passes + ' checks passed')}`);
    const impCol = (i) =>
      i === 'critical' ? RED + B : i === 'serious' ? YEL : i === 'moderate' ? MAG : DIM;
    for (const v of violations.slice(0, 6)) {
      console.log(
        `  ${co(impCol(v.impact), v.impact.padEnd(9))}  ${yel(v.id.padEnd(30))}  ${dim(truncate(v.description, 45))}  ${dim('×' + v.count)}`,
      );
    }
    if (violations.length > 6)
      console.log(`  ${dim(`… and ${violations.length - 6} more violation(s)`)}`);
  }
}

function reportUX(uxData, uxScore, brokenLinks) {
  console.log(
    `\n  ${co(bgCYN + B, '  USER EXPERIENCE  ')}  ${badge(uxScore.score)}  ${letterGrade(uxScore.score)}`,
  );
  const row = (ok, detail) => console.log(`  ${ok ? OK(detail) : WARN(detail)}`);

  row(uxData.unlabeledInputs === 0, `${uxData.unlabeledInputs} unlabeled inputs`);
  row(uxData.smallTargets === 0, `${uxData.smallTargets} tap targets <44px`);
  row(uxData.missingFocusRing < 5, `${uxData.missingFocusRing} elements without focus ring`);
  row(uxData.smallText < 5, `${uxData.smallText} small-text elements (<14px)`);

  console.log(
    `  ${dim('Interactive elements:')}  ${bold(String(uxData.interactiveCount))}  ${dim('Links:')}  ${uxData.linkCount}  ${dim('Buttons:')}  ${uxData.buttonCount}  ${dim('Inputs:')}  ${uxData.inputCount}`,
  );
  console.log(
    `  ${dim('Content:')}  ${uxData.wordCount} words  ${dim('·')}  ${uxData.internalLinks} internal / ${uxData.externalLinks} external links  ${dim('·')}  scroll depth ×${uxData.scrollRatio}`,
  );

  if (brokenLinks) {
    const b = brokenLinks.broken.length;
    console.log(
      `  ${b === 0 ? OK(`${brokenLinks.checked} links checked — none broken`) : FAIL(`${b}/${brokenLinks.checked} broken links`)}`,
    );
    for (const bl of brokenLinks.broken.slice(0, 3)) {
      console.log(`  ${dim('  ✘')} ${red(bl.href)}  ${dim('→')}  ${red(String(bl.status))}`);
    }
  }
}

function reportDynamic(dynamicData, apiCalls, entry) {
  if (!entry.dynamic || !dynamicData) return;
  console.log(`\n  ${co(bgCYN + B, '  DYNAMIC CONTENT  ')}`);

  const seen = new Set();
  for (const call of apiCalls) {
    if (seen.has(call.path)) continue;
    seen.add(call.path);
    const st = call.status < 400 ? GRN : RED;
    const ms = call.ms != null ? msColor(call.ms, 300, 800) : dim('?ms');
    console.log(`  ${dim('API')}  ${bold(call.path)}  →  ${co(st, call.status)}  ${ms}`);
  }

  const pc = dynamicData.postCount ?? 0;
  console.log(`  ${pc > 0 ? grn(pc + ' posts rendered') : WARN('0 posts — unauthenticated?')}`);

  if (dynamicData.posts?.length > 0) {
    const bw = 68;
    console.log(`  ${dim('┌' + '─'.repeat(bw) + '┐')}`);
    dynamicData.posts.forEach((p, i) => {
      const hdr = `  ${co(BLU + B, `❯${i + 1}`)}  ${bold(padAnsi(p.author || '?', 16))}  ${dim(p.time || '')}`;
      console.log(
        `  ${dim('│')} ${hdr}${' '.repeat(Math.max(0, bw - 1 - stripAnsi(hdr).length))}${dim('│')}`,
      );
      if (p.title) {
        const tl = `     ${p.title}`;
        console.log(
          `  ${dim('│')}${tl}${' '.repeat(Math.max(0, bw - stripAnsi(tl).length))}${dim('│')}`,
        );
      }
      if (p.body) {
        const bl = `     ${dim(p.body)}`;
        console.log(
          `  ${dim('│')}${bl}${' '.repeat(Math.max(0, bw - stripAnsi(bl).length))}${dim('│')}`,
        );
      }
      if (i < dynamicData.posts.length - 1) console.log(`  ${dim('├' + '─'.repeat(bw) + '┤')}`);
    });
    console.log(`  ${dim('└' + '─'.repeat(bw) + '┘')}`);
  }
}

function reportScoreSummaryLine(entry, coldStats, headers, scores) {
  const { seoScore, perfScore, secScore, a11yScore, uxScore, relScore } = scores;
  const composite = Math.round(
    (seoScore.score + perfScore.score + secScore.score + a11yScore.score + uxScore.score) / 5,
  );
  console.log(
    `  ${entry.name.padEnd(28)} ` +
      `${co((headers.status ?? 0) < 400 ? GRN : RED, String(headers.status ?? 0).padStart(3))}  ` +
      `${badge(seoScore.score)}  ${badge(perfScore.score)}  ${badge(secScore.score)}  ${badge(a11yScore.score)}  ${badge(uxScore.score)}  ` +
      `${padAnsi(msColor(coldStats?.fcp?.avg, 1800, 3000), 10)}  ` +
      `${padAnsi(coldStats?.lcp?.avg ? msColor(coldStats.lcp.avg, 2500, 4000) : dim('N/A'), 10)}  ` +
      `${letterGrade(composite)}`,
  );
  return composite;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — INFRASTRUCTURE REPORTER
// ═══════════════════════════════════════════════════════════════════════════════

function reportInfrastructure(infra) {
  console.log(`\n${sep('━')}`);
  console.log(co(bgMAG + B, '  INFRASTRUCTURE & DNS / SSL  '));
  console.log(sep('─'));

  const row = (ok, label, detail) =>
    console.log(`  ${ok ? OK(label.padEnd(22)) : FAIL(label.padEnd(22))}  ${dim(detail)}`);

  row(
    infra.robotsOk,
    'robots.txt',
    infra.robotsOk
      ? infra.robotsSitemap
        ? `Sitemap: ${infra.robotsSitemap}`
        : 'Found (no Sitemap line)'
      : 'Not found (404)',
  );
  row(
    infra.sitemapOk,
    'sitemap.xml',
    infra.sitemapOk ? `${infra.sitemapUrlCount} URLs indexed` : 'Not found (404)',
  );
  row(!!infra.hsts, 'HSTS', infra.hsts ?? 'Missing');
  row(
    infra.encoding === 'br' || infra.encoding === 'gzip',
    'Compression',
    infra.encoding ?? 'None detected',
  );
  row(!!infra.permissions, 'Permissions-Policy', infra.permissions ?? 'Missing');
  row(
    !infra.poweredBy,
    'X-Powered-By hidden',
    infra.poweredBy ? `Exposed: ${infra.poweredBy}` : 'Not exposed',
  );

  if (infra.ssl) {
    const ssl = infra.ssl;
    console.log(sep('─'));
    console.log(`  ${co(bgCYN + B, '  SSL CERTIFICATE  ')}`);
    row(
      ssl.valid,
      'SSL Valid',
      ssl.valid ? `${ssl.issuer ?? 'Unknown issuer'}` : 'Invalid or error',
    );
    row(
      ssl.daysLeft > 30,
      'Expiry',
      ssl.expiresAt ? `${ssl.expiresAt}  (${ssl.daysLeft}d remaining)` : 'Unknown',
    );
    if (ssl.protocol) console.log(`  ${dim('TLS Protocol:'.padEnd(24))}  ${dim(ssl.protocol)}`);
    if (ssl.subject) console.log(`  ${dim('Subject CN:'.padEnd(24))}  ${dim(ssl.subject)}`);
  }

  if (infra.dns?.ms != null) {
    console.log(`  ${dim('DNS lookup (Node):'.padEnd(24))}  ${msColor(infra.dns.ms, 50, 150)}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8 — SUMMARY TABLE
// ═══════════════════════════════════════════════════════════════════════════════

function reportSummary(results) {
  console.log(`\n${sep('━')}`);
  console.log(co(bgMAG + B, '  FINAL SUMMARY  '));
  console.log(sep('─'));
  console.log(
    `  ${'Page'.padEnd(28)}  ${'HTTP'}  ${'SEO'}  ${'Perf'}  ${'Sec'}  ${'A11y'}  ${'UX'}    ${'FCP avg'.padStart(9)}  ${'LCP avg'.padStart(9)}  ${'Grade'}`,
  );
  console.log(sep('─'));

  const totals = { seo: 0, perf: 0, sec: 0, a11y: 0, ux: 0, n: 0 };
  const allIssues = [];
  const composites = [];

  for (const [, r] of results) {
    if (r.error) continue;
    const c = reportScoreSummaryLine(r.entry, r.data.coldStats, r.data.headers, r.scores);
    composites.push(c);
    totals.seo += r.scores.seoScore.score;
    totals.perf += r.scores.perfScore.score;
    totals.sec += r.scores.secScore.score;
    totals.a11y += r.scores.a11yScore.score;
    totals.ux += r.scores.uxScore.score;
    totals.n++;

    for (const i of r.scores.seoScore.issues)
      allIssues.push({ type: 'SEO', page: r.entry.name, msg: i });
    for (const i of r.scores.perfScore.issues)
      allIssues.push({ type: 'Perf', page: r.entry.name, msg: i });
    for (const i of r.scores.secScore.issues)
      allIssues.push({ type: 'Sec', page: r.entry.name, msg: i });
    for (const v of r.scores.a11yScore.issues)
      allIssues.push({
        type: 'A11y',
        page: r.entry.name,
        msg: `${v.id} — ${v.impact} (×${v.count})`,
      });
    for (const i of r.scores.uxScore.issues)
      allIssues.push({ type: 'UX', page: r.entry.name, msg: i });
  }

  if (totals.n > 0) {
    console.log(sep('─'));
    const avg = (k) => badge(Math.round(totals[k] / totals.n));
    const overallAvg = Math.round(
      (totals.seo + totals.perf + totals.sec + totals.a11y + totals.ux) / (totals.n * 5),
    );
    console.log(
      `  ${'AVERAGES'.padEnd(28)}        ${avg('seo')}  ${avg('perf')}  ${avg('sec')}  ${avg('a11y')}  ${avg('ux')}  ` +
        `${' '.repeat(22)}${letterGrade(overallAvg)}`,
    );
  }
  console.log(sep('━'));

  // ── Top Issues ─────────────────────────────────────────────────────────────
  const deduped = new Map();
  for (const i of allIssues) {
    const key = `${i.type}:${i.msg}`;
    if (!deduped.has(key)) deduped.set(key, { ...i, pages: [] });
    deduped.get(key).pages.push(i.page);
  }
  const sorted = [...deduped.values()].sort((a, b) => b.pages.length - a.pages.length);

  if (sorted.length > 0) {
    console.log(`\n${bold('  TOP ISSUES  ')}${dim(`(${sorted.length} unique across all pages)`)}`);
    const typeColor = { Sec: RED, Perf: YEL, SEO: MAG, A11y: CYN, UX: BLU };
    for (const issue of sorted.slice(0, 18)) {
      const tc = typeColor[issue.type] ?? DIM;
      const scope =
        issue.pages.length >= totals.n
          ? red('ALL pages')
          : issue.pages.length > 3
            ? yel(`${issue.pages.length} pages`)
            : dim(issue.pages.map((p) => p.replace(' (protected)', '')).join(', '));
      console.log(
        `  ${co(tc + B, issue.type.padEnd(5))}  ${issue.msg.padEnd(48)}  ${dim('—')}  ${scope}`,
      );
    }
  }

  // ── Errors ─────────────────────────────────────────────────────────────────
  const errors = [...results.values()].filter((r) => r.error);
  if (errors.length) {
    console.log(`\n  ${red('ERRORS')}`);
    for (const r of errors) console.log(`  ${FAIL(r.entry?.name ?? '?')}  ${dim(r.error)}`);
  }

  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10 — HTML REPORT BUILDER + PDF EXPORT
// Pure functions that mirror terminal sections but output dark-mode HTML.
// ═══════════════════════════════════════════════════════════════════════════════

function buildHtmlReport(results, infra) {
  const e = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const mCls = (ms, w, b) => (ms == null ? '' : ms < w ? 'good' : ms < b ? 'warn' : 'bad');
  const hms = (ms, w = 600, b = 1500) =>
    ms == null ? '<span class="dim">N/A</span>' : `<span class="${mCls(ms, w, b)}">${ms}ms</span>`;
  const bdg = (n) => {
    const c = n >= 90 ? 'good' : n >= 70 ? 'warn' : 'bad';
    return `<span class="badge ${c}">${Math.round(n ?? 0)}</span>`;
  };
  const grd = (n) => {
    const [c, g] =
      n >= 90
        ? ['good', 'A']
        : n >= 80
          ? ['good', 'B']
          : n >= 70
            ? ['warn', 'C']
            : n >= 60
              ? ['warn', 'D']
              : ['bad', 'F'];
    return `<span class="${c}" style="font-weight:bold">${g}</span>`;
  };
  const icon = (ok) =>
    ok ? '<span class="good">&#10004;</span>' : '<span class="bad">&#10008;</span>';
  const pBar = (ms, max = 6000) => {
    const pct = ms ? Math.min((ms / max) * 100, 100).toFixed(1) : 0;
    const bg = ms < max * 0.3 ? 'var(--good)' : ms < max * 0.6 ? 'var(--warn)' : 'var(--bad)';
    return `<div class="bar"><div class="bar-fill" style="width:${pct}%;background:${bg}"></div></div>`;
  };
  const relBadge = (cv) => {
    if (cv == null) return '';
    if (cv < 0.1) return '<span class="rel-stable">STABLE</span>';
    if (cv < 0.25) return '<span class="rel-variable">VARIABLE</span>';
    return '<span class="rel-unstable">UNSTABLE</span>';
  };
  const cvSpan = (cv) => {
    const c = cv < 0.1 ? 'good' : cv < 0.25 ? 'warn' : 'bad';
    return `<span class="${c}">${(cv * 100).toFixed(1)}%</span>`;
  };
  const dlt = (before, after) => {
    if (!before || !after) return '';
    const d = Math.round(((after - before) / before) * 100);
    return d <= 0 ? `<span class="good">(${d}%)</span>` : `<span class="bad">(+${d}%)</span>`;
  };

  /** Render a metrics table — rows: [{label, st, warn, bad, coldAvg?}], extraHeader for extra column */
  const metricsTable = (rows, extraHeader = '') => {
    let t = `<table class="mtable"><thead><tr><th>Metric</th><th>Avg</th><th>Min</th><th>Max</th><th>&plusmn;SD</th><th>CV</th><th>Bar</th>${extraHeader ? `<th>${extraHeader}</th>` : ''}</tr></thead><tbody>`;
    for (const { label, st, warn: w, bad: b, coldAvg } of rows) {
      if (!st || st.avg == null) continue;
      const cvCls = st.cv < 0.1 ? 'good' : st.cv < 0.25 ? 'warn' : 'bad';
      t += `<tr>
        <td class="dim">${e(label)}</td>
        <td>${hms(st.avg, w, b)}</td>
        <td class="dim">${st.min}ms</td>
        <td class="dim">${st.max}ms</td>
        <td class="dim">&plusmn;${st.sd}ms</td>
        <td class="${cvCls}">${(st.cv * 100).toFixed(1)}%</td>
        <td>${pBar(st.avg)}</td>
        ${coldAvg !== undefined ? `<td>${dlt(coldAvg, st.avg)}</td>` : ''}
      </tr>`;
    }
    return t + '</tbody></table>';
  };

  const lines = [];
  const p = (...ss) => lines.push(...ss);

  // ── CSS ─────────────────────────────────────────────────────────────────────
  p(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Adorio Site Audit &mdash; ${e(NOW)}</title>
<style>
:root{--bg:#111827;--bg2:#1f2937;--bg3:#374151;--border:#374151;--text:#f9fafb;--dim:#9ca3af;
  --good:#10b981;--warn:#f59e0b;--bad:#ef4444;--blue:#3b82f6;--purple:#a78bfa;--cyan:#22d3ee}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;padding:24px 32px;max-width:1100px;margin:0 auto}
h1{font-size:20px;font-weight:600;color:var(--text);margin-bottom:6px}
h2{font-size:11px;font-weight:600;color:var(--dim);margin:18px 0 8px;text-transform:uppercase;letter-spacing:.7px;border-bottom:1px solid var(--border);padding-bottom:5px}
h3{font-size:11px;color:var(--dim);margin:12px 0 5px;font-weight:500}
.report-hdr{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:18px 22px;margin-bottom:24px}
.page-hdr{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin:28px 0 12px}
.section{margin:12px 0;padding:8px 0}
.row{display:flex;gap:8px;align-items:center;margin:4px 0;font-size:12px;flex-wrap:wrap}
.label{color:var(--dim);min-width:140px;flex-shrink:0;font-size:12px}
table{border-collapse:collapse;width:100%;margin:6px 0;font-size:12px}
th{background:var(--bg2);color:var(--dim);font-weight:500;padding:6px 10px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap;font-size:11px}
td{padding:5px 10px;border-bottom:1px solid var(--bg3);vertical-align:middle;white-space:nowrap}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--bg2)}
.good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}.dim{color:var(--dim)}.blue{color:var(--blue)}.purple{color:var(--purple)}.cyan{color:var(--cyan)}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;min-width:34px;text-align:center}
.badge.good{background:rgba(16,185,129,.15);color:var(--good)}.badge.warn{background:rgba(245,158,11,.15);color:var(--warn)}.badge.bad{background:rgba(239,68,68,.15);color:var(--bad)}
.rel-stable{background:rgba(16,185,129,.15);color:var(--good);padding:2px 10px;border-radius:4px;font-weight:600;font-size:11px}
.rel-variable{background:rgba(245,158,11,.15);color:var(--warn);padding:2px 10px;border-radius:4px;font-weight:600;font-size:11px}
.rel-unstable{background:rgba(239,68,68,.15);color:var(--bad);padding:2px 10px;border-radius:4px;font-weight:600;font-size:11px}
.bar{background:var(--bg3);height:6px;border-radius:3px;width:88px;display:inline-block;vertical-align:middle;flex-shrink:0}
.bar-fill{height:100%;border-radius:3px}
.cwv-box{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:14px 18px;margin:8px 0}
.cwv-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cwv-item label{color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:.5px;display:block;font-weight:500}
.cwv-item .val{font-size:15px;font-weight:600;margin-top:3px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:8px 0}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 14px}
.score-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0}
.post-card{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin:4px 0}
.post-card .author{color:var(--blue);font-weight:600}
.post-card .time{color:var(--dim);font-size:11px;margin-left:8px}
hr{border:none;border-top:1px solid var(--border);margin:12px 0}
a{color:var(--blue);text-decoration:none}
a:hover{text-decoration:underline}
@page{margin:12mm 10mm}
@media print{body{padding:0;max-width:none;font-size:11px}.page-hdr{page-break-before:always;margin-top:0}}
</style></head><body>`);

  // ── Collect summary data first (needed for the top-of-page summary) ────────
  const summaryTotals = { seo: 0, perf: 0, sec: 0, a11y: 0, ux: 0, n: 0 };
  const summaryAllIssues = [];
  for (const [, r] of results) {
    if (r.error) continue;
    const { data, entry, scores } = r;
    summaryTotals.seo += scores.seoScore.score;
    summaryTotals.perf += scores.perfScore.score;
    summaryTotals.sec += scores.secScore.score;
    summaryTotals.a11y += scores.a11yScore.score;
    summaryTotals.ux += scores.uxScore.score;
    summaryTotals.n++;
    for (const i of scores.seoScore.issues)
      summaryAllIssues.push({ type: 'SEO', page: entry.name, msg: i });
    for (const i of scores.perfScore.issues)
      summaryAllIssues.push({ type: 'Perf', page: entry.name, msg: i });
    for (const i of scores.secScore.issues)
      summaryAllIssues.push({ type: 'Sec', page: entry.name, msg: i });
    for (const v of scores.a11yScore.issues)
      summaryAllIssues.push({
        type: 'A11y',
        page: entry.name,
        msg: `${v.id} — ${v.impact} (×${v.count})`,
      });
    for (const i of scores.uxScore.issues)
      summaryAllIssues.push({ type: 'UX', page: entry.name, msg: i });
  }
  const dedupedIssues = new Map();
  for (const iss of summaryAllIssues) {
    const key = `${iss.type}:${iss.msg}`;
    if (!dedupedIssues.has(key)) dedupedIssues.set(key, { ...iss, pages: [] });
    dedupedIssues.get(key).pages.push(iss.page);
  }
  const sortedIssues = [...dedupedIssues.values()].sort((a, b) => b.pages.length - a.pages.length);

  // ── Report header ─────────────────────────────────────────────────────────
  p(`<div class="report-hdr">
  <h1>Adorio Site Audit</h1>
  <div style="color:var(--dim);font-size:12px;margin-top:6px">
    Target:&ensp;<span style="color:var(--text)">${e(BASE)}</span>&ensp;&middot;&ensp;
    Each page tested&ensp;<span style="color:var(--text)">${RUNS}&times; cold + ${RUNS}&times; warm</span>&ensp;&middot;&ensp;
    Run date:&ensp;<span style="color:var(--text)">${e(NOW)}</span>
  </div>
  <div style="color:var(--dim);font-size:11px;margin-top:4px">Covers: Core Web Vitals &middot; Navigation Timing &middot; Mobile performance &middot; SSL &middot; SEO &middot; Security headers &middot; WCAG 2.1 AA accessibility &middot; UX &middot; Resources</div>
</div>`);

  // ── SUMMARY (top of report) ───────────────────────────────────────────────
  p(`<div class="section">
<h2>Summary &mdash; all pages</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:10px">
  Scores are out of 100. FCP and LCP show the average of ${RUNS} cold runs (no browser cache) and ${RUNS} warm runs (cache populated).<br>
  Cold = real-world first visit. Warm = repeat visitor with browser cache.
</p>
<table><thead><tr>
  <th>Page</th><th>HTTP</th>
  <th title="SEO score based on title, description, OG tags, canonical, H1 etc.">SEO</th>
  <th title="Performance score based on FCP, LCP, TTFB, CLS, TBT averages">Perf</th>
  <th title="Security score based on response headers: CSP, HSTS, X-Frame-Options etc.">Sec</th>
  <th title="Accessibility score from axe-core WCAG 2.1 AA scan">A11y</th>
  <th title="UX score based on tap target sizes, unlabeled inputs, focus rings, font size">UX</th>
  <th title="First Contentful Paint — when the user first sees something on screen">FCP cold</th>
  <th title="FCP on a repeat visit with browser cache">FCP warm</th>
  <th title="Largest Contentful Paint — when the main content finishes loading">LCP cold</th>
  <th title="Overall grade across all 5 score categories">Grade</th>
</tr></thead><tbody>`);
  for (const [, r] of results) {
    if (r.error) {
      p(`<tr><td>${e(r.entry?.name)}</td><td colspan="10" class="bad">${e(r.error)}</td></tr>`);
      continue;
    }
    const { data, entry, scores } = r;
    const comp = Math.round(
      (scores.seoScore.score +
        scores.perfScore.score +
        scores.secScore.score +
        scores.a11yScore.score +
        scores.uxScore.score) /
        5,
    );
    p(`<tr>
      <td><a href="#page-${e(entry.name.replace(/[^a-z0-9]/gi, '-').toLowerCase())}">${e(entry.name)}</a></td>
      <td class="${(data.headers.status ?? 0) < 400 ? 'good' : 'bad'}">${data.headers.status ?? 0}</td>
      <td>${bdg(scores.seoScore.score)}</td><td>${bdg(scores.perfScore.score)}</td><td>${bdg(scores.secScore.score)}</td><td>${bdg(scores.a11yScore.score)}</td><td>${bdg(scores.uxScore.score)}</td>
      <td>${hms(data.coldStats?.fcp?.avg, 1800, 3000)}</td>
      <td>${hms(data.warmStats?.fcp?.avg, 600, 1200)}</td>
      <td>${data.coldStats?.lcp?.avg ? hms(data.coldStats.lcp.avg, 2500, 4000) : '<span class="dim">N/A</span>'}</td>
      <td>${grd(comp)}</td>
    </tr>`);
  }
  if (summaryTotals.n > 0) {
    const av = (k) => bdg(Math.round(summaryTotals[k] / summaryTotals.n));
    const ovAvg = Math.round(
      (summaryTotals.seo +
        summaryTotals.perf +
        summaryTotals.sec +
        summaryTotals.a11y +
        summaryTotals.ux) /
        (summaryTotals.n * 5),
    );
    p(
      `<tr style="background:var(--bg2);font-weight:600"><td>Site averages</td><td></td><td>${av('seo')}</td><td>${av('perf')}</td><td>${av('sec')}</td><td>${av('a11y')}</td><td>${av('ux')}</td><td></td><td></td><td></td><td>${grd(ovAvg)}</td></tr>`,
    );
  }
  p(`</tbody></table></div>`);

  // ── Top Issues (also at top) ─────────────────────────────────────────────
  if (sortedIssues.length) {
    const typeColor = { Sec: 'bad', Perf: 'warn', SEO: 'purple', A11y: 'blue', UX: 'cyan' };
    p(`<div class="section"><h2>Top issues across all pages</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:10px">Issues that appear on the most pages are listed first. Fix high-frequency issues for the biggest impact.</p>
<table><thead><tr><th>Category</th><th>Issue</th><th>Affected pages</th></tr></thead><tbody>`);
    for (const iss of sortedIssues.slice(0, 20)) {
      const tc = typeColor[iss.type] ?? 'dim';
      const scope =
        iss.pages.length >= summaryTotals.n
          ? '<span class="bad">All pages</span>'
          : iss.pages.length > 3
            ? `<span class="warn">${iss.pages.length} pages</span>`
            : `<span class="dim">${iss.pages.map((pg) => pg.replace(' (protected)', '').substring(0, 22)).join(', ')}</span>`;
      p(
        `<tr><td class="${tc}" style="font-weight:600;width:55px">${e(iss.type)}</td><td>${e(iss.msg)}</td><td>${scope}</td></tr>`,
      );
    }
    p(`</tbody></table></div>`);
  }

  // ── Infrastructure ─────────────────────────────────────────────────────────
  p(`<div class="section"><h2>Infrastructure</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:8px">One-time checks for the whole site — robots.txt, SSL certificate, compression, and security headers at the root level.</p>
<table><tbody>
  <tr><td class="label">${icon(infra.robotsOk)} robots.txt</td><td>${infra.robotsOk ? e(infra.robotsSitemap ? `Sitemap: ${infra.robotsSitemap}` : 'Found') : '<span class="bad">Not found (404)</span>'}</td></tr>
  <tr><td class="label">${icon(infra.sitemapOk)} sitemap.xml</td><td>${infra.sitemapOk ? `${infra.sitemapUrlCount} URLs indexed` : '<span class="bad">Not found (404)</span>'}</td></tr>
  <tr><td class="label">${icon(!!infra.hsts)} HSTS</td><td class="${infra.hsts ? '' : 'bad'}">${e(infra.hsts ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(infra.encoding === 'br' || infra.encoding === 'gzip')} Compression</td><td class="${infra.encoding === 'br' || infra.encoding === 'gzip' ? 'good' : 'bad'}">${e(infra.encoding ?? 'None detected')}</td></tr>
  <tr><td class="label">${icon(!!infra.permissions)} Permissions-Policy</td><td class="${infra.permissions ? '' : 'warn'}">${e(infra.permissions ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!infra.poweredBy)} X-Powered-By hidden</td><td class="${infra.poweredBy ? 'warn' : 'good'}">${infra.poweredBy ? `Exposed: ${e(infra.poweredBy)}` : 'Not exposed'}</td></tr>
  </tbody></table>`);
  if (infra.ssl) {
    const ssl = infra.ssl;
    p(`<h3>SSL Certificate</h3><table><tbody>
    <tr><td class="label">${icon(ssl.valid)} Valid</td><td class="${ssl.valid ? 'good' : 'bad'}">${e(ssl.issuer ?? (ssl.valid ? 'Yes' : 'Invalid'))}</td></tr>
    <tr><td class="label">${icon(ssl.daysLeft > 30)} Expiry</td><td class="${ssl.daysLeft > 30 ? 'good' : 'bad'}">${e(ssl.expiresAt ?? 'Unknown')} &mdash; ${ssl.daysLeft}d remaining</td></tr>
    ${ssl.protocol ? `<tr><td class="label dim">Protocol</td><td class="dim">${e(ssl.protocol)}</td></tr>` : ''}
    ${ssl.subject ? `<tr><td class="label dim">Subject CN</td><td class="dim">${e(ssl.subject)}</td></tr>` : ''}
    </tbody></table>`);
  }
  if (infra.dns?.ms != null) {
    p(
      `<div class="row"><span class="label dim">DNS lookup (Node)</span>&ensp;${hms(infra.dns.ms, 50, 150)}</div>`,
    );
  }
  p(`</div>`);

  // ── Per-page sections ───────────────────────────────────────────────────────
  let pageIdx = 0;
  for (const [, r] of results) {
    pageIdx++;
    const anchorId = `page-${(r.entry?.name ?? '').replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    if (r.error) {
      p(
        `<div class="page-hdr" id="${anchorId}"><b class="bad">[${pageIdx}/${PAGES.length}] ${e(r.entry?.name)}</b> &mdash; <span class="bad">${e(r.error)}</span></div>`,
      );
      continue;
    }
    const { data, entry, scores } = r;
    const {
      coldStats,
      warmStats,
      snapshot,
      cwvSnapshot,
      mobileTiming,
      mobileCWV,
      headers,
      seo,
      axeData,
      uxData,
      dynamicData,
      apiCalls,
      brokenLinks,
    } = data;
    const composite = Math.round(
      (scores.seoScore.score +
        scores.perfScore.score +
        scores.secScore.score +
        scores.a11yScore.score +
        scores.uxScore.score) /
        5,
    );

    p(`<div class="page-hdr" id="${anchorId}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
    <div>
      <span class="blue" style="font-weight:600">[${pageIdx}/${PAGES.length}]</span>&ensp;
      <b>${e(entry.name)}</b>
      <div style="color:var(--dim);font-size:11px;margin-top:2px">${e(BASE + entry.path)}</div>
    </div>
    <div style="text-align:right;font-size:11px">
      <span class="${(headers.status ?? 0) < 400 ? 'good' : 'bad'}" style="font-weight:600">${headers.status ?? 0}</span>
      &ensp;<span class="dim">${e(headers.contentType?.split(';')[0] ?? '')}</span>
      &ensp;<span class="${headers.encoding === 'br' || headers.encoding === 'gzip' ? 'good' : 'warn'}">${headers.encoding === 'br' ? 'brotli compressed' : headers.encoding === 'gzip' ? 'gzip compressed' : 'no compression'}</span>
    </div>
  </div>
  <div class="score-row" style="margin-top:8px">
    <span class="dim" style="font-size:11px">SEO</span>${bdg(scores.seoScore.score)}&ensp;
    <span class="dim" style="font-size:11px">Perf</span>${bdg(scores.perfScore.score)}&ensp;
    <span class="dim" style="font-size:11px">Sec</span>${bdg(scores.secScore.score)}&ensp;
    <span class="dim" style="font-size:11px">A11y</span>${bdg(scores.a11yScore.score)}&ensp;
    <span class="dim" style="font-size:11px">UX</span>${bdg(scores.uxScore.score)}&ensp;
    <span class="dim" style="font-size:11px">Grade</span>&ensp;${grd(composite)}
  </div>
</div>`);

    // Performance
    p(`<div class="section"><h2>Performance</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:10px">
  All timings are averages across ${RUNS} separate browser runs. <b>Cold</b> = fresh browser with no cache (simulates a first-time visitor).
  <b>Warm</b> = cache already populated (simulates a returning visitor). Each metric is explained in the column header tooltip.
</p>`);
    p(`<h3>Cold load &mdash; ${RUNS} runs, no cache</h3>
<p style="font-size:11px;color:var(--dim);margin-bottom:6px">
  <b>TTFB</b> = time until the server starts sending a response (under 200ms is great, over 800ms is slow).
  <b>FCP</b> = when the user first sees any content (under 1.8s is good).
  <b>LCP</b> = when the main/largest content finishes loading — this is what users feel as "loaded" (under 2.5s is good).
  <b>Load Complete</b> = when all resources finish downloading. <b>CV</b> = consistency — how much the times vary across runs (lower is more reliable).
</p>`);
    p(
      metricsTable([
        { label: 'TTFB', st: coldStats.ttfb, warn: 200, bad: 1800 },
        { label: 'FCP', st: coldStats.fcp, warn: 1800, bad: 3000 },
        { label: 'LCP', st: coldStats.lcp, warn: 2500, bad: 4000 },
        { label: 'Load Complete', st: coldStats.load, warn: 2000, bad: 5000 },
      ]),
    );

    // CWV box
    const fcpAvg = coldStats.fcp?.avg ?? cwvSnapshot?.fcp;
    const lcpAvg = coldStats.lcp?.avg ?? cwvSnapshot?.lcp;
    const clsVal = cwvSnapshot?.cls ?? 0;
    const tbtVal = Math.round(cwvSnapshot?.tbt ?? 0);
    p(`<div class="cwv-box">
  <div style="font-size:12px;color:var(--dim);margin-bottom:8px">Core Web Vitals <span style="font-size:11px">(averages across all runs)</span></div>
  <div class="cwv-grid">
    <div class="cwv-item"><label title="First Contentful Paint — when the user first sees any content">FCP</label><div class="val">${hms(fcpAvg, 1800, 3000)}</div></div>
    <div class="cwv-item"><label title="Largest Contentful Paint — when the main content finishes loading">LCP</label><div class="val">${lcpAvg ? hms(lcpAvg, 2500, 4000) : '<span class="dim">N/A</span>'}</div></div>
    <div class="cwv-item"><label title="Cumulative Layout Shift — how much the page jumps around while loading (lower is better, under 0.1 is good)">CLS</label><div class="val"><span class="${clsVal <= 0.1 ? 'good' : clsVal <= 0.25 ? 'warn' : 'bad'}">${clsVal.toFixed(3)}</span></div></div>
    <div class="cwv-item"><label title="Total Blocking Time — how long the main thread was blocked and couldn't respond to user input (under 300ms is good)">TBT</label><div class="val"><span class="${tbtVal > 600 ? 'bad' : tbtVal > 300 ? 'warn' : 'good'}">${tbtVal > 0 ? `~${tbtVal}ms` : '~0ms'}</span></div></div>
  </div>
</div>`);

    // Reliability
    const ttfbCV = coldStats.ttfb?.cv ?? 0;
    p(
      `<div class="row" style="margin-top:6px"><span class="label" title="How consistent the load time is across runs. CV = standard deviation / average. Under 10% is stable, over 25% is noisy.">Reliability</span>${relBadge(ttfbCV)}&ensp;<span class="dim">TTFB variation (CV):</span>&ensp;${cvSpan(ttfbCV)}</div>`,
    );

    // Warm table
    p(`<h3 style="margin-top:14px">Warm cache &mdash; ${RUNS} runs, cache populated</h3>
<p style="font-size:11px;color:var(--dim);margin-bottom:6px">
  The page was loaded once to warm the cache, then measured ${RUNS} more times.
  This reflects what a returning visitor experiences. The "vs cold" column shows how much faster warm is compared to the cold average.
</p>`);
    p(
      metricsTable(
        [
          { label: 'TTFB', st: warmStats.ttfb, warn: 200, bad: 600, coldAvg: coldStats.ttfb?.avg },
          { label: 'FCP', st: warmStats.fcp, warn: 600, bad: 1200, coldAvg: coldStats.fcp?.avg },
          {
            label: 'Load Complete',
            st: warmStats.load,
            warn: 800,
            bad: 2000,
            coldAvg: coldStats.load?.avg,
          },
        ],
        'vs Cold',
      ),
    );

    // Mobile
    if (mobileTiming) {
      const mFcp = mobileCWV?.fcp ?? mobileTiming.fcp;
      const mLcp = mobileCWV?.lcp;
      const mobDelta = mFcp && fcpAvg ? Math.round(((mFcp - fcpAvg) / fcpAvg) * 100) : null;
      p(`<h3>Mobile (375&times;812, single run)</h3><div class="grid3">
  <div class="card"><div class="dim" style="font-size:9px">TTFB</div><div style="margin-top:3px">${hms(mobileTiming.ttfb, 600, 1800)}</div></div>
  <div class="card"><div class="dim" style="font-size:9px">FCP</div><div style="margin-top:3px">${hms(mFcp, 1800, 3000)}</div></div>
  <div class="card"><div class="dim" style="font-size:9px">LCP</div><div style="margin-top:3px">${mLcp ? hms(mLcp, 2500, 4000) : '<span class="dim">N/A</span>'}</div></div>
</div>${mobDelta != null ? `<div class="row"><span class="dim">Mobile vs Desktop FCP:</span>&ensp;<span class="${mobDelta > 0 ? 'bad' : 'good'}">${mobDelta > 0 ? `+${mobDelta}%` : `${mobDelta}%`}</span></div>` : ''}`);
    }

    // Nav timing breakdown
    if (snapshot) {
      p(`<h3>Nav Timing Breakdown (first cold run)</h3><table><tbody>
  ${snapshot.dns != null ? `<tr><td class="dim" style="width:130px">DNS lookup</td><td>${pBar(snapshot.dns, 5000)}</td><td>${hms(snapshot.dns, 200, 800)}</td></tr>` : ''}
  ${snapshot.tcp != null ? `<tr><td class="dim">TCP + TLS</td><td>${pBar(snapshot.tcp, 5000)}</td><td>${hms(snapshot.tcp, 300, 1000)}</td></tr>` : ''}
  ${snapshot.download != null ? `<tr><td class="dim">Download</td><td>${pBar(snapshot.download, 5000)}</td><td>${hms(snapshot.download, 100, 400)}</td></tr>` : ''}
  ${snapshot.domInteractive != null ? `<tr><td class="dim">DOM Interactive</td><td>${pBar(snapshot.domInteractive, 5000)}</td><td>${hms(snapshot.domInteractive, 1500, 3500)}</td></tr>` : ''}
  </tbody></table>`);
    }
    p(`</div>`);

    // Resources
    if (snapshot) {
      p(`<div class="section"><h2>Resources</h2><div class="grid2">
<div class="card">
  <div class="row"><span class="dim">JS</span>&ensp;<span class="warn">${snapshot.jsKB}KB</span>&ensp;<span class="dim">CSS</span>&ensp;<span class="blue">${snapshot.cssKB}KB</span>&ensp;<span class="dim">IMG</span>&ensp;<span class="purple">${snapshot.imgKB}KB</span>&ensp;<span class="dim">Font</span>&ensp;${snapshot.fontKB}KB</div>
  <div class="row"><span class="dim">Total</span>&ensp;<b>${snapshot.totalKB}KB</b>&ensp;<span class="dim">Encoding</span>&ensp;<span class="${headers.encoding === 'br' ? 'good' : headers.encoding === 'gzip' ? 'warn' : 'bad'}">${headers.encoding ?? 'none'}</span></div>
  <div class="row"><span class="dim">DOM nodes</span>&ensp;${snapshot.domNodes}&ensp;<span class="dim">Resources</span>&ensp;${snapshot.resourceCount}&ensp;<span class="dim">Ext scripts</span>&ensp;${snapshot.externalScripts}</div>
  <div class="row">${snapshot.renderBlocking > 0 ? `<span class="warn">&#9888; ${snapshot.renderBlocking} render-blocking</span>` : '<span class="good">&#10004; 0 render-blocking</span>'}</div>
  ${snapshot.imagesTotal > 0 ? `<div class="row">${icon(snapshot.imagesNoAlt === 0)}&ensp;${snapshot.imagesNoAlt === 0 ? `All ${snapshot.imagesTotal} imgs have alt` : `${snapshot.imagesNoAlt}/${snapshot.imagesTotal} missing alt`}&ensp;&middot;&ensp;${icon(snapshot.imagesNotLazy === 0)}&ensp;${snapshot.imagesNotLazy === 0 ? 'All lazy-loaded' : `${snapshot.imagesNotLazy}/${snapshot.imagesTotal} not lazy`}</div>` : ''}
</div>
<div class="card">
  <div style="font-size:9px;color:var(--dim);margin-bottom:4px">3rd-party domains</div>
  ${snapshot.thirdPartyDomains?.length ? snapshot.thirdPartyDomains.map((d) => `<div style="font-size:9.5px;margin:2px 0" class="dim">&middot; ${e(d)}</div>`).join('') : '<span class="good" style="font-size:9.5px">&#10004; None</span>'}
</div></div>`);

      if (snapshot.slowest?.length || snapshot.largest?.length) {
        p(`<div class="grid2">`);
        if (snapshot.slowest?.length) {
          p(
            `<div><h3>Slowest resources</h3><table><thead><tr><th>Duration</th><th>Name</th></tr></thead><tbody>`,
          );
          for (const re of snapshot.slowest)
            p(`<tr><td>${hms(re.ms, 300, 800)}</td><td class="dim">${e(re.name)}</td></tr>`);
          p(`</tbody></table></div>`);
        }
        if (snapshot.largest?.length) {
          p(
            `<div><h3>Largest resources</h3><table><thead><tr><th>Size</th><th>Name</th></tr></thead><tbody>`,
          );
          for (const re of snapshot.largest)
            p(
              `<tr><td class="${re.kb > 500 ? 'warn' : 'dim'}">${re.kb}KB</td><td class="dim">${e(re.name)}</td></tr>`,
            );
          p(`</tbody></table></div>`);
        }
        p(`</div>`);
      }
      p(`</div>`);
    }

    // SEO
    if (seo) {
      p(`<div class="section"><h2>SEO &mdash; ${bdg(scores.seoScore.score)} ${grd(scores.seoScore.score)}</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:8px">Checks what search engines can read about this page. Missing tags mean Google/social platforms can't generate good previews.</p>
<table><tbody>
  <tr><td class="label">${icon(!!seo.title && seo.title.length <= 70)} Title</td><td>${seo.title ? `"${e(seo.title.substring(0, 65))}" <span class="dim">(${seo.title.length})</span>` : '<span class="bad">Missing</span>'}</td></tr>
  <tr><td class="label">${icon(!!seo.description)} Description</td><td>${seo.description ? `"${e(seo.description.substring(0, 80))}"` : '<span class="bad">Missing</span>'}</td></tr>
  <tr><td class="label">${icon(!!seo.ogTitle)} OG Title</td><td class="${seo.ogTitle ? '' : 'warn'}">${e(seo.ogTitle ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!!seo.ogImage)} OG Image</td><td class="${seo.ogImage ? '' : 'warn'}">${seo.ogImage ? `<a href="${e(seo.ogImage)}">${e(seo.ogImage.substring(0, 65))}</a>` : 'Missing'}</td></tr>
  <tr><td class="label">${icon(!!seo.twitterCard)} Twitter Card</td><td class="${seo.twitterCard ? '' : 'warn'}">${e(seo.twitterCard ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!!seo.canonical)} Canonical</td><td class="${seo.canonical ? '' : 'warn'}">${e(seo.canonical ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(seo.h1Count === 1)} H1</td><td>${seo.h1Count === 1 ? `"${e((seo.h1Text ?? '').substring(0, 55))}"` : `<span class="warn">${seo.h1Count} found</span>`}</td></tr>
  <tr><td class="label">${icon((seo.jsonLd?.length ?? 0) > 0)} JSON-LD</td><td class="${(seo.jsonLd?.length ?? 0) > 0 ? '' : 'dim'}">${(seo.jsonLd?.length ?? 0) > 0 ? `${seo.jsonLd.length} block(s)` : 'None'}</td></tr>
  <tr><td class="label">${icon(!!seo.langAttr)} lang attr</td><td class="${seo.langAttr ? '' : 'warn'}">${e(seo.langAttr ?? 'Missing')}</td></tr>
  </tbody></table></div>`);
    }

    // Security
    p(`<div class="section"><h2>Security &mdash; ${bdg(scores.secScore.score)} ${grd(scores.secScore.score)}</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:8px">HTTP response headers that protect users. HSTS forces HTTPS. CSP limits what scripts can run. X-Frame-Options stops clickjacking. X-Content-Type stops MIME sniffing attacks.</p>
<table><tbody>
  <tr><td class="label">${icon(!!headers.hsts)} HSTS</td><td>${e(headers.hsts ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!!headers.csp)} CSP</td><td class="${headers.csp ? '' : 'bad'}">${headers.csp ? 'Present' : 'Missing (&minus;25)'}</td></tr>
  <tr><td class="label">${icon(!!headers.xFrameOptions)} X-Frame-Options</td><td class="${headers.xFrameOptions ? '' : 'warn'}">${e(headers.xFrameOptions ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!!headers.xContentTypeOptions)} X-Content-Type</td><td class="${headers.xContentTypeOptions ? '' : 'warn'}">${e(headers.xContentTypeOptions ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!!headers.referrerPolicy)} Referrer-Policy</td><td class="${headers.referrerPolicy ? '' : 'warn'}">${e(headers.referrerPolicy ?? 'Missing')}</td></tr>
  <tr><td class="label">${icon(!!headers.permissions)} Permissions-Policy</td><td class="${headers.permissions ? '' : 'warn'}">${e(headers.permissions ? headers.permissions.substring(0, 70) : 'Missing')}</td></tr>
  <tr><td class="label dim">Cache-Control</td><td class="dim">${e(headers.cacheControl ?? 'Not set')}</td></tr>
  <tr><td class="label">${icon(!headers.poweredBy)} X-Powered-By</td><td class="${headers.poweredBy ? 'warn' : 'good'}">${headers.poweredBy ? `Exposed: ${e(headers.poweredBy)}` : 'Hidden'}</td></tr>
  </tbody></table></div>`);

    // Accessibility
    const violations = axeData?.violations ?? [];
    p(
      `<div class="section"><h2>Accessibility &mdash; ${bdg(scores.a11yScore.score)} ${grd(scores.a11yScore.score)} <span class="dim" style="font-size:11px">WCAG 2.1 AA</span></h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:8px">Automated scan using axe-core against WCAG 2.1 AA rules. Critical issues block screen reader users entirely. Serious issues make the page very hard to use. This does not replace manual testing but catches the common stuff.</p>`,
    );
    if (!violations.length) {
      p(
        `<div class="good">&#10004; 0 violations &mdash; ${axeData?.passes ?? 0} checks passed</div>`,
      );
    } else {
      const ct = { critical: 0, serious: 0, moderate: 0, minor: 0 };
      for (const v of violations) ct[v.impact] = (ct[v.impact] ?? 0) + 1;
      p(
        `<div class="row"><span class="bad">${ct.critical} critical</span>&ensp;<span class="warn">${ct.serious} serious</span>&ensp;<span class="purple">${ct.moderate} moderate</span>&ensp;<span class="dim">${ct.minor} minor</span>&ensp;<span class="dim">&middot; ${axeData?.passes ?? 0} passed</span></div>`,
      );
      p(
        `<table><thead><tr><th>Impact</th><th>Rule ID</th><th>Description</th><th>Count</th></tr></thead><tbody>`,
      );
      for (const v of violations) {
        const ic =
          v.impact === 'critical'
            ? 'bad'
            : v.impact === 'serious'
              ? 'warn'
              : v.impact === 'moderate'
                ? 'purple'
                : 'dim';
        p(
          `<tr><td class="${ic}">${e(v.impact)}</td><td class="warn">${e(v.id)}</td><td class="dim">${e((v.description ?? '').substring(0, 90))}</td><td class="dim">&times;${v.count}</td></tr>`,
        );
      }
      p(`</tbody></table>`);
    }
    p(`</div>`);

    // UX
    p(`<div class="section"><h2>User Experience &mdash; ${bdg(scores.uxScore.score)} ${grd(scores.uxScore.score)}</h2>
<p style="font-size:12px;color:var(--dim);margin-bottom:8px">Heuristic checks for usability. Tap targets under 44px are hard to tap on mobile. Unlabeled inputs break screen readers. Missing focus rings make keyboard navigation impossible.</p>
<div class="grid2"><div class="card">
  <div class="row">${icon(uxData.unlabeledInputs === 0)}&ensp;${uxData.unlabeledInputs} unlabeled inputs</div>
  <div class="row">${icon(uxData.smallTargets === 0)}&ensp;${uxData.smallTargets} tap targets &lt;44px</div>
  <div class="row">${icon(uxData.missingFocusRing < 5)}&ensp;${uxData.missingFocusRing} elements without focus ring</div>
  <div class="row">${icon(uxData.smallText < 5)}&ensp;${uxData.smallText} small-text elements (&lt;14px)</div>
</div><div class="card">
  <div class="row"><span class="dim">Interactive</span>&ensp;${uxData.interactiveCount}&ensp;<span class="dim">Links</span>&ensp;${uxData.linkCount}&ensp;<span class="dim">Buttons</span>&ensp;${uxData.buttonCount}&ensp;<span class="dim">Inputs</span>&ensp;${uxData.inputCount}</div>
  <div class="row"><span class="dim">Words</span>&ensp;${uxData.wordCount}&ensp;<span class="dim">Int.links</span>&ensp;${uxData.internalLinks}&ensp;<span class="dim">Ext.links</span>&ensp;${uxData.externalLinks}</div>
  <div class="row"><span class="dim">Scroll depth</span>&ensp;&times;${uxData.scrollRatio}</div>
</div></div>`);
    if (brokenLinks) {
      const b = brokenLinks.broken.length;
      p(
        `<div class="row">${icon(b === 0)}&ensp;${b === 0 ? `${brokenLinks.checked} links checked &mdash; none broken` : `<span class="bad">${b}/${brokenLinks.checked} broken links</span>`}</div>`,
      );
      for (const bl of brokenLinks.broken.slice(0, 3)) {
        p(
          `<div class="row bad" style="font-size:9.5px">&ensp;&#10008; ${e(bl.href)} &rarr; ${bl.status}</div>`,
        );
      }
    }
    p(`</div>`);

    // Dynamic content
    if (entry.dynamic && dynamicData) {
      p(`<div class="section"><h2>Dynamic Content</h2>`);
      if (apiCalls?.length) {
        const seen = new Set();
        p(`<table><thead><tr><th>API Path</th><th>Status</th><th>Latency</th></tr></thead><tbody>`);
        for (const call of apiCalls) {
          if (seen.has(call.path)) continue;
          seen.add(call.path);
          p(
            `<tr><td class="blue">${e(call.path)}</td><td class="${call.status < 400 ? 'good' : 'bad'}">${call.status}</td><td>${call.ms ? hms(call.ms, 300, 800) : '<span class="dim">?</span>'}</td></tr>`,
          );
        }
        p(`</tbody></table>`);
      }
      const pc = dynamicData.postCount ?? 0;
      p(
        `<div class="row">${icon(pc > 0)}&ensp;${pc > 0 ? `${pc} posts rendered` : '<span class="warn">0 posts (unauthenticated?)</span>'}</div>`,
      );
      if (dynamicData.posts?.length) {
        for (const post of dynamicData.posts) {
          p(
            `<div class="post-card"><span class="author">${e(post.author || '?')}</span><span class="time">${e(post.time)}</span>${post.title ? `<div style="margin-top:3px">${e(post.title)}</div>` : ''}${post.body ? `<div class="dim" style="font-size:9px;margin-top:2px">${e(post.body)}</div>` : ''}</div>`,
          );
        }
      }
      p(`</div>`);
    }
  }

  p(`</body></html>`);
  return lines.join('\n');
}

async function saveHtml(results, infra) {
  const html = buildHtmlReport(results, infra);
  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const htmlPath = path.join(reportsDir, `audit-${ts}.html`);
  await fs.writeFile(htmlPath, html, 'utf8');

  // Prune: keep only the 3 most recent reports
  const files = (await fs.readdir(reportsDir))
    .filter((f) => f.startsWith('audit-') && f.endsWith('.html'))
    .sort(); // ISO timestamp names sort lexicographically = chronologically
  if (files.length > 3) {
    const toDelete = files.slice(0, files.length - 3);
    await Promise.all(toDelete.map((f) => fs.unlink(path.join(reportsDir, f))));
  }

  return htmlPath;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9 — MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n${sep('━')}`);
  console.log(
    co(bgBLU + B, '  ADORIO SITE AUDIT v3  ') +
      `  ${dim('▸')}  ${bold(BASE)}  ${dim('▸')}  ${dim(NOW)}`,
  );
  console.log(
    `  ${dim(`Runs: ${RUNS}× cold + ${RUNS}× warm per page  ·  CWV · Nav Timing · Mobile · SSL · SEO · Sec · A11y · UX · Resources`)}`,
  );
  console.log(sep('━'));

  // Infrastructure
  process.stdout.write(`\n  ${INFO('Checking infrastructure + SSL ...')}`);
  const infra = await collectInfrastructure();
  process.stdout.write(` ${grn('done')}\n`);
  reportInfrastructure(infra);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  /** @type {Map<string, object>} */
  const results = new Map();
  const pageResults = new Array(PAGES.length);
  // Use one worker per CPU core, capped at the number of pages.
  // Each worker runs full browser sessions so we don't want more than ~1 per core.
  const CONCURRENCY = Math.min(os.cpus().length, PAGES.length);
  let nextPage = 0;

  async function pageWorker() {
    while (nextPage < PAGES.length) {
      const i = nextPage++;
      const entry = PAGES[i];
      console.log(`  ${dim('→')} ${dim(`[${i + 1}/${PAGES.length}]`)} ${bold(entry.name)}`);
      try {
        const data = await auditPage(browser, entry);
        const scores = {
          seoScore: scoreSEO(data.seo),
          perfScore: scorePerf(data.coldStats, data.cwvSnapshot),
          secScore: scoreSecurity(data.headers),
          a11yScore: scoreA11y(data.axeData),
          uxScore: scoreUX(data.uxData),
          relScore: scoreReliability(data.coldStats.ttfb?.cv),
        };
        pageResults[i] = { entry, scores, data, error: null };
        console.log(`  ${grn('✔')} ${dim(`[${i + 1}/${PAGES.length}]`)} ${bold(entry.name)}`);
      } catch (err) {
        console.log(
          `  ${red('✘')} ${dim(`[${i + 1}/${PAGES.length}]`)} ${bold(entry.name)}  ${red(err.message.substring(0, 60))}`,
        );
        pageResults[i] = { entry, data: null, error: err.message.substring(0, 120) };
      }
    }
  }

  console.log(
    `\n  ${dim(`Auditing ${PAGES.length} pages  ·  ${CONCURRENCY} concurrent (${os.cpus().length} CPU cores)  ·  ${RUNS}× cold + ${RUNS}× warm each`)}\n`,
  );
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, PAGES.length) }, pageWorker));

  // Populate results Map and print per-page reports in original page order
  for (let i = 0; i < pageResults.length; i++) {
    const r = pageResults[i];
    results.set(r.entry.name, r);
    if (r.error) continue;
    const { data, entry, scores } = r;
    reportHeader(i + 1, PAGES.length, entry, data.headers);
    reportPerformance(
      data.coldStats,
      data.warmStats,
      data.snapshot,
      data.cwvSnapshot,
      data.mobileTiming,
      data.mobileCWV,
    );
    reportResources(data.snapshot, data.headers);
    reportSEO(data.seo, scores.seoScore);
    reportSecurity(data.headers, scores.secScore);
    reportA11y(data.axeData, scores.a11yScore);
    reportUX(data.uxData, scores.uxScore, data.brokenLinks);
    reportDynamic(data.dynamicData, data.apiCalls, entry);
  }

  reportSummary(results);

  // ── Save HTML report ───────────────────────────────────────────────────────
  process.stdout.write(`\n  ${INFO('Generating HTML report...')}`);
  try {
    const htmlFile = await saveHtml(results, infra);
    console.log(` ${grn('done')}  ${dim('→')}  ${bold(path.relative(process.cwd(), htmlFile))}`);
  } catch (htmlErr) {
    console.log(` ${yel('warning:')} ${dim(htmlErr.message)}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(FAIL('Fatal: ' + err.message));
  console.error(err.stack);
  process.exit(1);
});
