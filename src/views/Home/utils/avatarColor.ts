// Deterministic avatar color per username, so the same person always gets the same
// paper-craft avatar color without needing a color field on the User model.
const AVATAR_COLORS = ['#a9564f', '#8d5a2b', '#5c544a', '#7a4f10', '#2b2723', '#6b7d4a'];

export const getAvatarColor = (username?: string) => {
  const key = username || 'U';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
