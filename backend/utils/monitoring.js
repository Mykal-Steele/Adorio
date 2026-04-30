import { performance } from 'perf_hooks';
import mongoose from 'mongoose';

class AnalyticsMonitor {
  constructor() {
    this.metrics = {
      fingerprintingTime: [],
      processingTime: [],
      errorCount: 0,
      successCount: 0,
      lastHealthCheck: null,
    };
    this.maxMetricsSamples = 100;
  }

  recordFingerprintingTime(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.fingerprintingTime.push(duration);
    if (this.metrics.fingerprintingTime.length > this.maxMetricsSamples) {
      this.metrics.fingerprintingTime.shift();
    }
  }

  recordProcessingTime(startTime, endTime) {
    const duration = endTime - startTime;
    this.metrics.processingTime.push(duration);
    if (this.metrics.processingTime.length > this.maxMetricsSamples) {
      this.metrics.processingTime.shift();
    }
  }

  recordSuccess() {
    this.metrics.successCount++;
  }

  recordError() {
    this.metrics.errorCount++;
  }

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
    const errorRate = totalRequests > 0 ? this.metrics.errorCount / totalRequests : 0;

    return {
      avgFingerprintTime: Math.round(avgFingerprintTime),
      avgProcessingTime: Math.round(avgProcessingTime),
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests,
      successRate: Math.round((1 - errorRate) * 100) / 100,
      isHealthy: errorRate < 0.1 && avgProcessingTime < 5000,
      lastUpdate: new Date().toISOString(),
    };
  }

  async performHealthCheck() {
    const startTime = performance.now();
    try {
      await mongoose.connection.db.command({ ping: 1 });
      const endTime = performance.now();
      this.recordProcessingTime(startTime, endTime);
      this.recordSuccess();
      this.metrics.lastHealthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: Math.round(endTime - startTime),
      };
      return { status: 'healthy', responseTime: Math.round(endTime - startTime) };
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

  getHealthStatus() {
    const stats = this.getStats();
    return {
      ...stats,
      lastHealthCheck: this.metrics.lastHealthCheck,
      systemStatus: stats.isHealthy ? 'operational' : 'degraded',
    };
  }
}

export const validateFingerprint = (fingerprint) => {
  if (!fingerprint || typeof fingerprint !== 'object') {
    return { isValid: false, errors: ['Invalid fingerprint format'] };
  }

  const errors = [];

  if (!fingerprint.screen || typeof fingerprint.screen !== 'object') {
    errors.push('Missing or invalid screen fingerprint');
  }
  if (!fingerprint.browser || typeof fingerprint.browser !== 'object') {
    errors.push('Missing or invalid browser fingerprint');
  }
  if (!fingerprint.locale || typeof fingerprint.locale !== 'object') {
    errors.push('Missing or invalid locale fingerprint');
  }
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
    quality: errors.length === 0 ? 'high' : errors.length < 3 ? 'medium' : 'low',
  };
};

export const validateVisitorId = (visitorId) => {
  if (!visitorId || typeof visitorId !== 'string') {
    return { isValid: false, error: 'Invalid visitor ID format' };
  }
  if (visitorId.length < 8 || visitorId.length > 64) {
    return { isValid: false, error: 'Invalid visitor ID length' };
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(visitorId)) {
    return { isValid: false, error: 'Invalid visitor ID characters' };
  }
  return { isValid: true };
};

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

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [id, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((t) => t > windowStart);
      if (valid.length === 0) {
        this.requests.delete(id);
      } else {
        this.requests.set(id, valid);
      }
    }

    const timestamps = this.requests.get(identifier) || [];
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= this.maxRequests) return false;

    recent.push(now);
    this.requests.set(identifier, recent);
    return true;
  }

  getRemainingRequests(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = this.requests.get(identifier) || [];
    const recent = timestamps.filter((t) => t > windowStart);
    return Math.max(0, this.maxRequests - recent.length);
  }
}

export const monitor = new AnalyticsMonitor();
export const rateLimiter = new RateLimiter();

if (process.env.NODE_ENV === 'production' && typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      monitor.performHealthCheck().catch((err) => {
        console.error('Health check failed:', err);
      });
    },
    5 * 60 * 1000,
  );
}
