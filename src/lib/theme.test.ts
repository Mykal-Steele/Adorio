import {
  DEFAULT_SOCIAL_THEME,
  SOCIAL_THEME_OPTIONS,
  applySocialTheme,
  isValidSocialTheme,
  resolveSocialThemeId,
} from "./theme";

describe("theme", () => {
  it("validates known theme ids", () => {
    expect(isValidSocialTheme("theme-social-ocean")).toBe(true);
    expect(isValidSocialTheme("theme-social-olive")).toBe(true);
    expect(isValidSocialTheme("bad-theme")).toBe(false);
  });

  it("resolves invalid ids to default theme", () => {
    expect(resolveSocialThemeId("bad-theme")).toBe(DEFAULT_SOCIAL_THEME);
    expect(resolveSocialThemeId(undefined)).toBe(DEFAULT_SOCIAL_THEME);
  });

  it("applies and returns resolved theme id", () => {
    const setTheme = vi.fn();

    const resolved = applySocialTheme(setTheme, "theme-social-olive");

    expect(resolved).toBe("theme-social-olive");
    expect(setTheme).toHaveBeenCalledWith("theme-social-olive");
  });

  it("exposes theme options for UI selectors", () => {
    expect(SOCIAL_THEME_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "theme-social-ocean" }),
        expect.objectContaining({ id: "theme-social-olive" }),
      ]),
    );
  });
});
