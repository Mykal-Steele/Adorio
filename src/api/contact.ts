// /api/contact is a Next.js Route Handler (same-origin), not the Express
// backend. Using fetch with a relative path keeps it routed to Next.js in both
// dev (localhost:3001) and production (nginx → :3001).
import { CONTACT_ENDPOINT } from './constants/contact_const';
import type { ContactMessagePayload } from './types/contact';

export const sendContactMessage = async (payload: ContactMessagePayload) => {
  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to send. Please email me directly.');
  }

  return data;
};
