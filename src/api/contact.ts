// /api/contact is a Next.js route handler, not the Express backend. A relative fetch
// keeps it on Next.js in dev (localhost:3001) and in prod (nginx sends it to :3001).
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
