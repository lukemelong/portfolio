import { config } from '../config';

/**
 * @param {{ name: string, email: string, message: string }} data
 * @returns {Promise<{ ok: boolean, body: any }>}
 */
export async function submitContactForm(data) {
  const response = await fetch(config.contact.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await response.json().catch(() => null);
  return { ok: response.ok, body };
}
