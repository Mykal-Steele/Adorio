import { describe, expect, test } from "bun:test";

import { validateFingerprint, validateVisitorId } from "../../../../backend/utils/monitoring.js";

describe("analytics validation helpers", () => {
  test("validateVisitorId rejects malformed ids", () => {
    expect(validateVisitorId(123)).toEqual({
      isValid: false,
      error: "Invalid visitor ID format",
    });

    expect(validateVisitorId("short")).toEqual({
      isValid: false,
      error: "Invalid visitor ID length",
    });

    expect(validateVisitorId("bad id! more")).toEqual({
      isValid: false,
      error: "Invalid visitor ID characters",
    });
  });

  test("validateVisitorId accepts valid ids", () => {
    expect(validateVisitorId("visitor-123_abcd")).toEqual({ isValid: true });
  });

  test("validateFingerprint reports missing fields and suspicious dimensions", () => {
    expect(validateFingerprint(null)).toEqual({
      isValid: false,
      errors: ["Invalid fingerprint format"],
    });

    const result = validateFingerprint({
      screen: { width: 50, height: 50 },
      browser: {},
      locale: {},
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Suspicious screen dimensions");
    expect(result.quality).toBe("medium");
  });

  test("validateFingerprint accepts a sensible fingerprint", () => {
    const result = validateFingerprint({
      screen: { width: 1920, height: 1080 },
      browser: {},
      locale: {},
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.quality).toBe("high");
  });
});
