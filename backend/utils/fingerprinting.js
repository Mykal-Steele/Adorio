import crypto from 'crypto';

/**
 * Advanced visitor fingerprinting to distinguish users on same network
 * Uses multiple data points to create unique identifiers
 */

// Generate a hash from multiple fingerprint components
const generateFingerprint = (components) => {
  const normalized = components
    .filter(Boolean) // Remove null/undefined values
    .map(String) // Ensure all are strings
    .join('|');

  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')
    .substring(0, 16);
};

// Extract screen characteristics
const extractScreenFingerprint = (screenData) => {
  if (!screenData) return null;

  const {
    width,
    height,
    availWidth,
    availHeight,
    colorDepth,
    pixelDepth,
    devicePixelRatio,
  } = screenData;

  return `${width}x${height}|${availWidth}x${availHeight}|${colorDepth}|${pixelDepth}|${devicePixelRatio}`;
};

// Extract timezone and locale fingerprint
const extractLocaleFingerprint = (localeData) => {
  if (!localeData) return null;

  const { timezone, timezoneOffset, language, languages, country, dateFormat } =
    localeData;

  return `${timezone}|${timezoneOffset}|${language}|${languages?.join(
    ','
  )}|${country}|${dateFormat}`;
};

// Extract browser capabilities fingerprint
const extractBrowserFingerprint = (browserData) => {
  if (!browserData) return null;

  const {
    userAgent,
    platform,
    cookieEnabled,
    doNotTrack,
    hardwareConcurrency,
    maxTouchPoints,
    vendor,
    webgl,
    canvas,
    fonts,
  } = browserData;

  return `${userAgent}|${platform}|${cookieEnabled}|${doNotTrack}|${hardwareConcurrency}|${maxTouchPoints}|${vendor}|${webgl}|${canvas}|${fonts?.join(
    ','
  )}`;
};

// Extract network fingerprint (more subtle indicators)
const extractNetworkFingerprint = (networkData) => {
  if (!networkData) return null;

  const { connectionType, effectiveType, downlink, rtt, saveData } =
    networkData;

  return `${connectionType}|${effectiveType}|${downlink}|${rtt}|${saveData}`;
};

// Create comprehensive visitor fingerprint
export const createVisitorFingerprint = (fingerprintData) => {
  const { screen, locale, browser, network, ipAddress, behavior } =
    fingerprintData || {};

  const components = [
    extractScreenFingerprint(screen),
    extractLocaleFingerprint(locale),
    extractBrowserFingerprint(browser),
    extractNetworkFingerprint(network),
    ipAddress, // Still use IP as one component
    behavior?.mouseMovement,
    behavior?.keyboardTiming,
    behavior?.scrollPattern,
  ];

  return generateFingerprint(components);
};

// Create a stable visitor ID that combines cookie and fingerprint
export const createStableVisitorId = (cookieId, fingerprint, ipAddress) => {
  // If we have a cookie and fingerprint matches previous sessions, use cookie
  // Otherwise, create new ID based on fingerprint
  const components = [cookieId, fingerprint, ipAddress].filter(Boolean);
  return generateFingerprint(components);
};

// Analyze if two fingerprints likely belong to same person
export const isSameVisitor = (fp1, fp2, threshold = 0.8) => {
  if (!fp1 || !fp2) return false;

  // Simple similarity check - in production you'd want more sophisticated matching
  const similarity = calculateSimilarity(fp1, fp2);
  return similarity >= threshold;
};

const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};
