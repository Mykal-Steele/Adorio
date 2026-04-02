import { describe, expect, test } from "bun:test";

import {
  createStableVisitorId,
  createVisitorFingerprint,
  isSameVisitor,
} from "../../../../backend/utils/fingerprinting.js";

describe("fingerprinting helpers", () => {
  test("createVisitorFingerprint is deterministic", () => {
    const fingerprintData = {
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        colorDepth: 24,
        pixelDepth: 24,
        devicePixelRatio: 1,
      },
      locale: {
        timezone: "UTC",
        timezoneOffset: 0,
        language: "en-US",
        languages: ["en-US", "en"],
        country: "US",
        dateFormat: "MM/DD/YYYY",
      },
      browser: {
        userAgent: "Mozilla/5.0",
        platform: "Linux x86_64",
        cookieEnabled: true,
        doNotTrack: "1",
        hardwareConcurrency: 8,
        maxTouchPoints: 0,
        vendor: "Google Inc.",
        webgl: "webgl",
        canvas: "canvas",
        fonts: ["Arial", "Roboto"],
      },
      network: {
        connectionType: "wifi",
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        saveData: false,
      },
      ipAddress: "127.0.0.1",
      behavior: {
        mouseMovement: "steady",
        keyboardTiming: "normal",
        scrollPattern: "consistent",
      },
    };

    const first = createVisitorFingerprint(fingerprintData);
    const second = createVisitorFingerprint(fingerprintData);

    expect(first).toBe(second);
    expect(first).toHaveLength(16);
  });

  test("createStableVisitorId changes when inputs change", () => {
    const first = createStableVisitorId(
      "cookie-a",
      "fingerprint-a",
      "127.0.0.1",
    );
    const second = createStableVisitorId(
      "cookie-a",
      "fingerprint-b",
      "127.0.0.1",
    );

    expect(first).not.toBe(second);
    expect(first).toHaveLength(16);
  });

  test("isSameVisitor compares similar fingerprints", () => {
    expect(isSameVisitor("abc123", "abc123")).toBe(true);
    expect(isSameVisitor("abc123", "xyz999")).toBe(false);
  });
});
