import crypto from 'crypto';

const SIMILARITY_WEIGHTS = {
  screen: 0.25,
  browser: 0.3,
  network: 0.15,
  locale: 0.2,
  behavior: 0.1,
};

const SIMILARITY_THRESHOLDS = {
  SAME_USER: 0.85,
  LIKELY_SAME: 0.75,
  POSSIBLY_SAME: 0.65,
  DIFFERENT: 0.5,
};

const calculateScreenSimilarity = (screen1, screen2) => {
  if (!screen1 || !screen2) return 0;

  let score = 0;

  if (screen1.width === screen2.width && screen1.height === screen2.height) score += 0.4;
  if (screen1.availWidth === screen2.availWidth && screen1.availHeight === screen2.availHeight)
    score += 0.3;
  if (screen1.colorDepth === screen2.colorDepth) score += 0.15;
  if (screen1.devicePixelRatio === screen2.devicePixelRatio) score += 0.15;

  return score;
};

const calculateBrowserSimilarity = (browser1, browser2) => {
  if (!browser1 || !browser2) return 0;

  let score = 0;

  if (browser1.userAgent && browser2.userAgent) {
    const ua1 = browser1.userAgent.toLowerCase();
    const ua2 = browser2.userAgent.toLowerCase();
    if (ua1 === ua2) {
      score += 0.3;
    } else {
      const commonParts = ua1.split(' ').filter((part) => ua2.includes(part));
      score += (commonParts.length / ua1.split(' ').length) * 0.15;
    }
  }

  if (browser1.platform === browser2.platform) score += 0.1;
  if (browser1.vendor === browser2.vendor) score += 0.1;
  if (browser1.hardwareConcurrency === browser2.hardwareConcurrency) score += 0.1;
  if (browser1.maxTouchPoints === browser2.maxTouchPoints) score += 0.05;

  if (browser1.webgl && browser2.webgl) {
    if (browser1.webgl.vendor === browser2.webgl.vendor) score += 0.1;
    if (browser1.webgl.renderer === browser2.webgl.renderer) score += 0.15;
  }

  if (browser1.canvas && browser2.canvas) {
    if (browser1.canvas.substring(0, 50) === browser2.canvas.substring(0, 50)) score += 0.1;
  }

  return score;
};

const calculateLocaleSimilarity = (locale1, locale2) => {
  if (!locale1 || !locale2) return 0;

  let score = 0;

  if (locale1.timezone === locale2.timezone) score += 0.4;
  if (locale1.timezoneOffset === locale2.timezoneOffset) score += 0.2;
  if (locale1.language === locale2.language) score += 0.25;

  if (locale1.languages && locale2.languages) {
    const common = locale1.languages.filter((lang) => locale2.languages.includes(lang));
    score +=
      (common.length / Math.max(locale1.languages.length, locale2.languages.length, 1)) * 0.15;
  }

  return score;
};

const calculateNetworkSimilarity = (network1, network2) => {
  if (!network1 || !network2) return 0.5;

  let score = 0;

  if (network1.connectionType === network2.connectionType) score += 0.3;
  if (network1.effectiveType === network2.effectiveType) score += 0.3;
  if (network1.rtt && network2.rtt && Math.abs(network1.rtt - network2.rtt) < 50) score += 0.2;
  if (network1.saveData === network2.saveData) score += 0.2;

  return score;
};

export const calculateFingerprintSimilarity = (fp1, fp2) => {
  if (!fp1 || !fp2) return 0;

  const total =
    calculateScreenSimilarity(fp1.screen, fp2.screen) * SIMILARITY_WEIGHTS.screen +
    calculateBrowserSimilarity(fp1.browser, fp2.browser) * SIMILARITY_WEIGHTS.browser +
    calculateLocaleSimilarity(fp1.locale, fp2.locale) * SIMILARITY_WEIGHTS.locale +
    calculateNetworkSimilarity(fp1.network, fp2.network) * SIMILARITY_WEIGHTS.network +
    0.5 * SIMILARITY_WEIGHTS.behavior;

  return Math.min(1, Math.max(0, total));
};

export const isSameVisitor = (visitor1, visitor2, customThreshold = null) => {
  const similarity = calculateFingerprintSimilarity(visitor1.fingerprint, visitor2.fingerprint);
  const threshold = customThreshold || SIMILARITY_THRESHOLDS.SAME_USER;

  return {
    isSame: similarity >= threshold,
    similarity,
    confidence:
      similarity >= SIMILARITY_THRESHOLDS.SAME_USER
        ? 'high'
        : similarity >= SIMILARITY_THRESHOLDS.LIKELY_SAME
          ? 'medium'
          : similarity >= SIMILARITY_THRESHOLDS.POSSIBLY_SAME
            ? 'low'
            : 'very_low',
  };
};

export const deduplicateVisitors = (visitors) => {
  if (!Array.isArray(visitors) || visitors.length < 2) return visitors;

  const deduplicated = [];
  const processed = new Set();

  for (let i = 0; i < visitors.length; i++) {
    if (processed.has(i)) continue;

    const duplicates = [i];

    for (let j = i + 1; j < visitors.length; j++) {
      if (processed.has(j)) continue;
      if (isSameVisitor(visitors[i], visitors[j]).isSame) {
        duplicates.push(j);
        processed.add(j);
      }
    }

    if (duplicates.length > 1) {
      deduplicated.push(mergeDuplicateVisitors(duplicates.map((idx) => visitors[idx])));
    } else {
      deduplicated.push(visitors[i]);
    }

    processed.add(i);
  }

  return deduplicated;
};

const mergeDuplicateVisitors = (visitors) => {
  if (visitors.length === 1) return visitors[0];

  visitors.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
  const primary = visitors[0];

  return {
    ...primary,
    totalVisits: visitors.reduce((sum, v) => sum + (v.totalVisits || 0), 0),
    uniquePages: Math.max(...visitors.map((v) => v.uniquePages || 0)),
    firstVisit: new Date(Math.min(...visitors.map((v) => new Date(v.firstVisit || Date.now())))),
    lastVisit: new Date(Math.max(...visitors.map((v) => new Date(v.lastVisit || 0)))),
    avgDuration: visitors.reduce((sum, v) => sum + (v.avgDuration || 0), 0) / visitors.length,
    isDeduplicated: true,
    duplicateCount: visitors.length,
    mergedIds: visitors.map((v) => v.visitorId).filter(Boolean),
  };
};

export const createFingerprintHash = (fingerprint) => {
  if (!fingerprint) return null;
  try {
    const combined = [
      fingerprint.screen ? JSON.stringify(fingerprint.screen) : '',
      fingerprint.browser ? JSON.stringify(fingerprint.browser) : '',
      fingerprint.locale ? JSON.stringify(fingerprint.locale) : '',
      fingerprint.network ? JSON.stringify(fingerprint.network) : '',
    ].join('|');
    return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
  } catch {
    return null;
  }
};
