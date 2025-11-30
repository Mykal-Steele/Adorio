/**
 * Production monitoring and health checks for analytics system
 * Ensures system stability and tracks performance metrics
 */

import { performance } from 'perf_hooks';

// Performance monitoring
class AnalyticsMonitor {
  constructor() {
    this.metrics = {
      fingerprintingTime: [],
      processingTime: [],
      errorCount: 0,
      successCount: 0,
      cacheHitRate: 0,
      lastHealthCheck: null,
    };

    this.maxMetricsSamples = 100;
  }

  // Record fingerprinting performance
  recordFingerprintingTime(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.fingerprintingTime.push(duration);

    if (this.metrics.fingerprintingTime.length > this.maxMetricsSamples) {
      this.metrics.fingerprintingTime.shift();
    }
  }

  // Record processing performance
  recordProcessingTime(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.processingTime.push(duration);

    if (this.metrics.processingTime.length > this.maxMetricsSamples) {
      this.metrics.processingTime.shift();
    }
  }

  // Record success/error counts
  recordSuccess() {
    this.metrics.successCount++;
  }

  recordError() {
    this.metrics.errorCount++;
  }

  // Calculate statistics
  getStats() {
    const avgFingerprintTime =
      this.metrics.fingerprintingTime.length > 0
        ? this.metrics.fingerprintingTime.reduce((a, b) => a + b, 0) /
          this.metrics.fingerprintingTime.length
        : 0;

    const avgProcessingTime =
      this.metrics.processingTime.length > 0
        ? this.metrics.processingTime.reduce((a, b) => a + b, 0) /
          this.metrics.processingTime.length
        : 0;

    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    const errorRate =
      totalRequests > 0 ? this.metrics.errorCount / totalRequests : 0;

    return {
      avgFingerprintTime: Math.round(avgFingerprintTime),
      avgProcessingTime: Math.round(avgProcessingTime),
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests,
      successRate: Math.round((1 - errorRate) * 100) / 100,
      isHealthy: errorRate < 0.1 && avgProcessingTime < 5000, // Less than 10% errors and under 5s processing
      lastUpdate: new Date().toISOString(),
    };
  }

  // Health check
  async performHealthCheck() {
    const startTime = performance.now();

    try {
      // Test database connection
      const Visit = (await import('../models/Visit.js')).default;
      await Visit.findOne({}).limit(1).lean();

      // Test fingerprinting (lightweight)
      const testFingerprint = {
        screen: { width: 1920, height: 1080 },
        browser: { userAgent: 'test' },
        locale: { timezone: 'UTC' },
        network: null,
      };

      const endTime = performance.now();
      this.recordProcessingTime(startTime, endTime);
      this.recordSuccess();

      this.metrics.lastHealthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: Math.round(endTime - startTime),
      };

      return {
        status: 'healthy',
        responseTime: Math.round(endTime - startTime),
      };
    } catch (error) {
      const endTime = performance.now();
      this.recordProcessingTime(startTime, endTime);
      this.recordError();

      this.metrics.lastHealthCheck = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: Math.round(endTime - startTime),
      };

      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: Math.round(endTime - startTime),
      };
    }
  }

  // Get current health status
  getHealthStatus() {
    const stats = this.getStats();
    const lastCheck = this.metrics.lastHealthCheck;

    return {
      ...stats,
      lastHealthCheck: lastCheck,
      systemStatus: stats.isHealthy ? 'operational' : 'degraded',
    };
  }
}

// Global monitor instance
const monitor = new AnalyticsMonitor();

// Validation functions
export const validateFingerprint = (fingerprint) => {
  if (!fingerprint || typeof fingerprint !== 'object') {
    return { isValid: false, errors: ['Invalid fingerprint format'] };
  }

  const errors = [];

  // Check required components
  if (!fingerprint.screen || typeof fingerprint.screen !== 'object') {
    errors.push('Missing or invalid screen fingerprint');
  }

  if (!fingerprint.browser || typeof fingerprint.browser !== 'object') {
    errors.push('Missing or invalid browser fingerprint');
  }

  if (!fingerprint.locale || typeof fingerprint.locale !== 'object') {
    errors.push('Missing or invalid locale fingerprint');
  }

  // Check for suspicious data
  if (
    fingerprint.screen &&
    (fingerprint.screen.width < 100 ||
      fingerprint.screen.width > 10000 ||
      fingerprint.screen.height < 100 ||
      fingerprint.screen.height > 10000)
  ) {
    errors.push('Suspicious screen dimensions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    quality:
      errors.length === 0 ? 'high' : errors.length < 3 ? 'medium' : 'low',
  };
};

export const validateVisitorId = (visitorId) => {
  if (!visitorId || typeof visitorId !== 'string') {
    return { isValid: false, error: 'Invalid visitor ID format' };
  }

  if (visitorId.length < 8 || visitorId.length > 64) {
    return { isValid: false, error: 'Invalid visitor ID length' };
  }

  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9-_]+$/.test(visitorId)) {
    return { isValid: false, error: 'Invalid visitor ID characters' };
  }

  return { isValid: true };
};

// Performance monitoring decorators
export const monitoredFunction = (name, fn) => {
  return async (...args) => {
    const startTime = performance.now();

    try {
      const result = await fn(...args);
      const endTime = performance.now();

      if (name === 'fingerprinting') {
        monitor.recordFingerprintingTime(startTime, endTime);
      } else {
        monitor.recordProcessingTime(startTime, endTime);
      }

      monitor.recordSuccess();
      return result;
    } catch (error) {
      const endTime = performance.now();
      monitor.recordProcessingTime(startTime, endTime);
      monitor.recordError();
      throw error;
    }
  };
};

// Rate limiting for analytics
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    // 100 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old entries
    for (const [id, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((t) => t > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, validTimestamps);
      }
    }

    // Check current identifier
    const timestamps = this.requests.get(identifier) || [];
    const recentRequests = timestamps.filter((t) => t > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  getRemainingRequests(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = this.requests.get(identifier) || [];
    const recentRequests = timestamps.filter((t) => t > windowStart);

    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Global rate limiter
const rateLimiter = new RateLimiter();

// Export monitoring functions
export { monitor, rateLimiter, AnalyticsMonitor };

// Automatic health checks (every 5 minutes in production)
if (
  process.env.NODE_ENV === 'production' &&
  typeof setInterval !== 'undefined'
) {
  setInterval(() => {
    monitor.performHealthCheck().catch((error) => {
      console.error('Health check failed:', error);
    });
  }, 5 * 60 * 1000);
}
