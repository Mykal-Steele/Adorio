/**
 * Frontend analytics performance monitor
 * Tracks client-side performance and errors
 */

class FrontendMonitor {
  constructor() {
    this.metrics = {
      trackingAttempts: 0,
      trackingSuccess: 0,
      trackingErrors: 0,
      fingerprintingTime: [],
      lastError: null,
    };

    this.setupErrorHandling();
  }

  setupErrorHandling() {
    // Capture unhandled analytics errors
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (
          args.some(
            (arg) => typeof arg === 'string' && arg.includes('analytics')
          )
        ) {
          this.recordError(new Error(args.join(' ')));
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  recordTrackingAttempt() {
    this.metrics.trackingAttempts++;
  }

  recordTrackingSuccess() {
    this.metrics.trackingSuccess++;
  }

  recordError(error) {
    this.metrics.trackingErrors++;
    this.metrics.lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack?.substring(0, 500), // Truncate stack trace
    };
  }

  recordFingerprintingTime(duration) {
    this.metrics.fingerprintingTime.push(duration);

    // Keep only last 50 measurements
    if (this.metrics.fingerprintingTime.length > 50) {
      this.metrics.fingerprintingTime.shift();
    }
  }

  getStats() {
    const avgFingerprintTime =
      this.metrics.fingerprintingTime.length > 0
        ? this.metrics.fingerprintingTime.reduce((a, b) => a + b, 0) /
          this.metrics.fingerprintingTime.length
        : 0;

    const successRate =
      this.metrics.trackingAttempts > 0
        ? this.metrics.trackingSuccess / this.metrics.trackingAttempts
        : 0;

    return {
      trackingAttempts: this.metrics.trackingAttempts,
      trackingSuccess: this.metrics.trackingSuccess,
      trackingErrors: this.metrics.trackingErrors,
      successRate: Math.round(successRate * 100) / 100,
      avgFingerprintTime: Math.round(avgFingerprintTime),
      lastError: this.metrics.lastError,
      isHealthy: successRate > 0.8 && avgFingerprintTime < 3000,
      timestamp: new Date().toISOString(),
    };
  }

  // Send stats to backend periodically (optional)
  async sendStatsToBackend() {
    try {
      const stats = this.getStats();

      // Only send if there's meaningful data
      if (stats.trackingAttempts > 0) {
        await fetch('/api/stats/client-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stats),
          credentials: 'include',
        });
      }
    } catch (error) {
      // Silent failure for stats reporting
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send client metrics:', error);
      }
    }
  }
}

// Global frontend monitor
const frontendMonitor = new FrontendMonitor();

// Performance timing wrapper
export const withPerformanceTracking = (name, fn) => {
  return async (...args) => {
    const startTime = performance.now();

    try {
      if (name === 'tracking') {
        frontendMonitor.recordTrackingAttempt();
      }

      const result = await fn(...args);

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (name === 'fingerprinting') {
        frontendMonitor.recordFingerprintingTime(duration);
      }

      if (name === 'tracking') {
        frontendMonitor.recordTrackingSuccess();
      }

      return result;
    } catch (error) {
      frontendMonitor.recordError(error);
      throw error;
    }
  };
};

// Export monitor for debugging
export { frontendMonitor };

// Send stats periodically in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Send stats every 5 minutes
  setInterval(() => {
    frontendMonitor.sendStatsToBackend();
  }, 5 * 60 * 1000);
}
