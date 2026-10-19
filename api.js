const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const token = sessionStorage.getItem('libraryToken');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot connect to ${API_BASE}. Start the Spring Boot backend and check the API URL.`);
  }
  if (response.status === 204) return null;
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const message = typeof data === 'object' && data
      ? (data.message || data.error || data.detail || `Request failed (${response.status})`)
      : (data || `Request failed (${response.status})`);
    throw new Error(message);
  }
  return data;
}

export const api = {
  listBooks: () => request('/books'),
  addBook: (book) => request('/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id, book) => request(`/books/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' })
};