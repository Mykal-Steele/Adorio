/**
 * Advanced visitor matching and deduplication algorithms
 * Production-ready user classification system
 */

import crypto from 'crypto';

// Weights for different fingerprint components in similarity calculation
const SIMILARITY_WEIGHTS = {
  screen: 0.25,
  browser: 0.3,
  network: 0.15,
  locale: 0.2,
  behavior: 0.1,
};

// Thresholds for different similarity levels
const SIMILARITY_THRESHOLDS = {
  SAME_USER: 0.85,
  LIKELY_SAME: 0.75,
  POSSIBLY_SAME: 0.65,
  DIFFERENT: 0.5,
};

/**
 * Calculate similarity between two screen fingerprints
 */
const calculateScreenSimilarity = (screen1, screen2) => {
  if (!screen1 || !screen2) return 0;

  let score = 0;
  let total = 0;

  // Exact matches get full points
  if (screen1.width === screen2.width && screen1.height === screen2.height) {
    score += 0.4;
  }
  total += 0.4;

  // Available screen size
  if (
    screen1.availWidth === screen2.availWidth &&
    screen1.availHeight === screen2.availHeight
  ) {
    score += 0.3;
  }
  total += 0.3;

  // Color depth and pixel ratio
  if (screen1.colorDepth === screen2.colorDepth) score += 0.15;
  if (screen1.devicePixelRatio === screen2.devicePixelRatio) score += 0.15;
  total += 0.3;

  return total > 0 ? score / total : 0;
};

/**
 * Calculate similarity between two browser fingerprints
 */
const calculateBrowserSimilarity = (browser1, browser2) => {
  if (!browser1 || !browser2) return 0;

  let score = 0;
  let total = 0;

  // User agent similarity (partial matches allowed)
  if (browser1.userAgent && browser2.userAgent) {
    const ua1 = browser1.userAgent.toLowerCase();
    const ua2 = browser2.userAgent.toLowerCase();

    if (ua1 === ua2) {
      score += 0.3;
    } else {
      // Calculate partial similarity for user agent
      const commonParts = ua1.split(' ').filter((part) => ua2.includes(part));
      score += (commonParts.length / ua1.split(' ').length) * 0.15;
    }
  }
  total += 0.3;

  // Platform and vendor
  if (browser1.platform === browser2.platform) score += 0.1;
  if (browser1.vendor === browser2.vendor) score += 0.1;
  total += 0.2;

  // Hardware capabilities
  if (browser1.hardwareConcurrency === browser2.hardwareConcurrency)
    score += 0.1;
  if (browser1.maxTouchPoints === browser2.maxTouchPoints) score += 0.05;
  total += 0.15;

  // WebGL comparison
  if (browser1.webgl && browser2.webgl) {
    if (browser1.webgl.vendor === browser2.webgl.vendor) score += 0.1;
    if (browser1.webgl.renderer === browser2.webgl.renderer) score += 0.15;
  }
  total += 0.25;

  // Canvas similarity (first 50 chars)
  if (browser1.canvas && browser2.canvas) {
    const canvas1 = browser1.canvas.substring(0, 50);
    const canvas2 = browser2.canvas.substring(0, 50);
    if (canvas1 === canvas2) score += 0.1;
  }
  total += 0.1;

  return total > 0 ? score / total : 0;
};

/**
 * Calculate similarity between two locale fingerprints
 */
const calculateLocaleSimilarity = (locale1, locale2) => {
  if (!locale1 || !locale2) return 0;

  let score = 0;
  let total = 0;

  // Timezone exact match is very important
  if (locale1.timezone === locale2.timezone) score += 0.4;
  total += 0.4;

  // Timezone offset (fallback)
  if (locale1.timezoneOffset === locale2.timezoneOffset) score += 0.2;
  total += 0.2;

  // Language preferences
  if (locale1.language === locale2.language) score += 0.25;
  total += 0.25;

  // Languages array similarity
  if (locale1.languages && locale2.languages) {
    const common = locale1.languages.filter((lang) =>
      locale2.languages.includes(lang)
    );
    const similarity =
      common.length /
      Math.max(locale1.languages.length, locale2.languages.length, 1);
    score += similarity * 0.15;
  }
  total += 0.15;

  return total > 0 ? score / total : 0;
};

/**
 * Calculate similarity between two network fingerprints
 */
const calculateNetworkSimilarity = (network1, network2) => {
  if (!network1 || !network2) return 0.5; // Neutral if no network data

  let score = 0;
  let total = 0;

  if (network1.connectionType === network2.connectionType) score += 0.3;
  if (network1.effectiveType === network2.effectiveType) score += 0.3;
  total += 0.6;

  // RTT and downlink are less reliable but can be indicators
  if (network1.rtt && network2.rtt) {
    const rttDiff = Math.abs(network1.rtt - network2.rtt);
    if (rttDiff < 50) score += 0.2; // Similar RTT
  }
  total += 0.2;

  if (network1.saveData === network2.saveData) score += 0.2;
  total += 0.2;

  return total > 0 ? score / total : 0;
};

/**
 * Calculate overall similarity between two fingerprints
 */
export const calculateFingerprintSimilarity = (fp1, fp2) => {
  if (!fp1 || !fp2) return 0;

  const screenSim = calculateScreenSimilarity(fp1.screen, fp2.screen);
  const browserSim = calculateBrowserSimilarity(fp1.browser, fp2.browser);
  const localeSim = calculateLocaleSimilarity(fp1.locale, fp2.locale);
  const networkSim = calculateNetworkSimilarity(fp1.network, fp2.network);

  // Behavior similarity is more complex and would need actual data
  const behaviorSim = 0.5; // Neutral for now

  const totalSimilarity =
    screenSim * SIMILARITY_WEIGHTS.screen +
    browserSim * SIMILARITY_WEIGHTS.browser +
    localeSim * SIMILARITY_WEIGHTS.locale +
    networkSim * SIMILARITY_WEIGHTS.network +
    behaviorSim * SIMILARITY_WEIGHTS.behavior;

  return Math.min(1, Math.max(0, totalSimilarity));
};

/**
 * Determine if two visitors are likely the same person
 */
export const isSameVisitor = (visitor1, visitor2, customThreshold = null) => {
  const similarity = calculateFingerprintSimilarity(
    visitor1.fingerprint,
    visitor2.fingerprint
  );
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

/**
 * Advanced visitor deduplication for analytics
 */
export const deduplicateVisitors = (visitors) => {
  if (!Array.isArray(visitors) || visitors.length < 2) {
    return visitors;
  }

  const deduplicated = [];
  const processed = new Set();

  for (let i = 0; i < visitors.length; i++) {
    if (processed.has(i)) continue;

    const currentVisitor = visitors[i];
    const duplicates = [i];

    // Find all similar visitors
    for (let j = i + 1; j < visitors.length; j++) {
      if (processed.has(j)) continue;

      const comparison = isSameVisitor(currentVisitor, visitors[j]);
      if (comparison.isSame) {
        duplicates.push(j);
        processed.add(j);
      }
    }

    // Merge duplicate visitors
    if (duplicates.length > 1) {
      const mergedVisitor = mergeDuplicateVisitors(
        duplicates.map((idx) => visitors[idx])
      );
      deduplicated.push(mergedVisitor);
    } else {
      deduplicated.push(currentVisitor);
    }

    processed.add(i);
  }

  return deduplicated;
};

/**
 * Merge multiple visitor records that represent the same person
 */
const mergeDuplicateVisitors = (visitors) => {
  if (visitors.length === 1) return visitors[0];

  // Sort by most recent activity
  visitors.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

  const primary = visitors[0];
  const merged = {
    ...primary,
    // Combine visit counts
    totalVisits: visitors.reduce((sum, v) => sum + (v.totalVisits || 0), 0),
    uniquePages: Math.max(...visitors.map((v) => v.uniquePages || 0)),
    // Use earliest first visit
    firstVisit: new Date(
      Math.min(...visitors.map((v) => new Date(v.firstVisit || Date.now())))
    ),
    // Use latest last visit
    lastVisit: new Date(
      Math.max(...visitors.map((v) => new Date(v.lastVisit || 0)))
    ),
    // Average duration
    avgDuration:
      visitors.reduce((sum, v) => sum + (v.avgDuration || 0), 0) /
      visitors.length,
    // Mark as merged
    isDeduplicated: true,
    duplicateCount: visitors.length,
    mergedIds: visitors.map((v) => v.visitorId).filter(Boolean),
  };

  return merged;
};

/**
 * Create a stable hash from fingerprint components
 */
export const createFingerprintHash = (fingerprint) => {
  if (!fingerprint) return null;

  try {
    const components = [
      fingerprint.screen ? JSON.stringify(fingerprint.screen) : '',
      fingerprint.browser ? JSON.stringify(fingerprint.browser) : '',
      fingerprint.locale ? JSON.stringify(fingerprint.locale) : '',
      fingerprint.network ? JSON.stringify(fingerprint.network) : '',
    ];

    const combined = components.join('|');
    return crypto
      .createHash('sha256')
      .update(combined)
      .digest('hex')
      .substring(0, 16);
  } catch (error) {
    return null;
  }
};
