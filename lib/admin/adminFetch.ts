export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('nearmart_admin_token');
  }

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
