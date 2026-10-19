
import { useEffect, useState } from "react";
import { getBooks } from "./api";
import "./styles.css";

export default function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks(search)
      .then(setBooks)
      .catch(() => setError("Cannot connect to the backend. Please start the API server."))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <main>
      <h1>📚 Library Book Management</h1>
      <p>Search and browse the library catalogue.</p>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search books..."
        aria-label="Search books"
      />
      {loading && <p>Loading books...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && books.length === 0 && <p>No books found.</p>}
      {books.map((book) => (
        <section className="card" key={book.id ?? book.bookId ?? book.title}>
          <h2>{book.title}</h2>
          <p>Author: {book.author}</p>
          <p>ISBN: {book.isbn}</p>
          <p>Available copies: {book.availableCopies ?? "Not specified"}</p>
        </section>
      ))}
    </main>
  );
}
