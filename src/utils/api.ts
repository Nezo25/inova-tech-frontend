import { parseCookies } from 'nookies';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const cookies = parseCookies();
  const token = cookies['inova.token'];

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('ngrok-skip-browser-warning', 'true');

  return fetch(url, {
    ...options,
    headers,
  });
}
