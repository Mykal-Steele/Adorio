/**
 * Converts milliseconds to a human-readable duration string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (ms) => {
  if (typeof ms !== 'number' || ms < 0 || Number.isNaN(ms)) {
    return '—';
  }

  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    if (remainingMinutes === 0 && remainingSeconds === 0) {
      return `${hours}h`;
    } else if (remainingSeconds === 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  }

  return `${seconds}s`;
};

/**
 * Formats a number with appropriate units (K, M, B)
 * @param {number} value - The number to format
 * @returns {string} - Formatted number string
 */
export const formatCompactNumber = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toLocaleString();
};
