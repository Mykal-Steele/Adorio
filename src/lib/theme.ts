export const SOCIAL_THEMES = {
  "theme-social-olive": {
    label: "Olive",
  },
  "theme-social-ocean": {
    label: "Ocean",
  },
} as const;

export type SocialThemeId = keyof typeof SOCIAL_THEMES;

export const DEFAULT_SOCIAL_THEME: SocialThemeId = "theme-social-ocean";
export const SOCIAL_THEME_STORAGE_KEY = "social-theme-user";
export const SOCIAL_THEME_IDS = Object.keys(SOCIAL_THEMES) as SocialThemeId[];

export const isValidSocialTheme = (themeId: unknown): themeId is SocialThemeId =>
  typeof themeId === "string" && themeId in SOCIAL_THEMES;

export const resolveSocialThemeId = (themeId: unknown): SocialThemeId =>
  isValidSocialTheme(themeId) ? themeId : DEFAULT_SOCIAL_THEME;

export const applySocialTheme = (
  setTheme: (theme: string) => void,
  themeId: unknown,
): SocialThemeId => {
  const resolvedTheme = resolveSocialThemeId(themeId);
  setTheme(resolvedTheme);
  return resolvedTheme;
};

export const SOCIAL_THEME_OPTIONS = SOCIAL_THEME_IDS.map((id) => ({
  id,
  label: SOCIAL_THEMES[id].label,
}));
