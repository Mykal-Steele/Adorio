import { describe, expect, test } from "bun:test";

import { formatCompactNumber, formatDuration } from "../../../../src/utils/timeFormatting";

describe("time formatting helpers", () => {
  test("formatDuration handles invalid and short durations", () => {
    expect(formatDuration(-1)).toBe("—");
    expect(formatDuration(Number.NaN)).toBe("—");
    expect(formatDuration(999)).toBe("999ms");
    expect(formatDuration(1500)).toBe("1s");
  });

  test("formatDuration handles minutes and hours", () => {
    expect(formatDuration(61000)).toBe("1m 1s");
    expect(formatDuration(3600000)).toBe("1h");
    expect(formatDuration(3661000)).toBe("1h 1m 1s");
  });

  test("formatCompactNumber formats large values", () => {
    expect(formatCompactNumber(Number.NaN)).toBe("—");
    expect(formatCompactNumber(999)).toBe("999");
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatCompactNumber(1500000)).toBe("1.5M");
    expect(formatCompactNumber(1500000000)).toBe("1.5B");
  });
});
