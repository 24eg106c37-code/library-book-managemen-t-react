const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

export async function getBooks(search = "") {
  const url = new URL(`${API_BASE}/books`);
  if (search) url.searchParams.set("search", search);

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load books");

  return response.json();
}
