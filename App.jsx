import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Plus, Pencil, Trash2, RefreshCw, X, LibraryBig, CircleCheck, CircleAlert, Layers3 } from 'lucide-react';
import { api } from './api.js';

const emptyBook = { isbn: '', title: '', author: '', category: '', publisher: '', publicationYear: '', quantity: '1' };
const getId = (book) => book.id ?? book.bookId ?? book.isbn;
const getIsbn = (book) => book.isbn ?? book.bookIsbn ?? '';
const getQuantity = (book) => Number(book.quantity ?? book.totalCopies ?? book.stock ?? 1);
const getAvailable = (book) => Number(book.availableCopies ?? book.availableQuantity ?? book.quantityAvailable ?? getQuantity(book));
const normalize = (b) => ({
  isbn: b.isbn ?? b.bookIsbn ?? '',
  title: b.title ?? b.bookTitle ?? '',
  author: b.author ?? b.bookAuthor ?? '',
  category: b.category ?? b.genre ?? '',
  publisher: b.publisher ?? '',
  publicationYear: b.publicationYear ?? b.year ?? '',
  quantity: b.quantity ?? b.totalCopies ?? b.stock ?? 1
});

function Modal({ title, onClose, children }) {
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      {children}
    </section>
  </div>;
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);\n  const [showAdd, setShowAdd] = useState(false);

  async function loadBooks() {
    setLoading(true); setError('');
    try {
      const data = await api.listBooks();
      setBooks(Array.isArray(data) ? data : (data?.content || data?.books || data?.data || []));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadBooks(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(b => [getIsbn(b), b.title, b.bookTitle, b.author, b.bookAuthor, b.category, b.genre]
      .some(v => String(v ?? '').toLowerCase().includes(q)));
  }, [books, query]);

  const totalTitles = books.length;
  const totalCopies = books.reduce((sum, b) => sum + getQuantity(b), 0);
  const availableCopies = books.reduce((sum, b) => sum + getAvailable(b), 0);

  function openAdd() { setEditing(null); setForm({ ...emptyBook }); setShowAdd(true); setError(''); setNotice(''); }
  function openEdit(book) { setEditing(book); setForm({ ...emptyBook, ...normalize(book), quantity: String(normalize(book).quantity) }); setError(''); setNotice(''); }
  function updateField(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function saveBook(e) {
    e.preventDefault(); setError(''); setNotice('');
    if (!form.isbn.trim() || !form.title.trim() || !form.author.trim() || !form.category.trim()) {
      setError('Please fill in ISBN, title, author and category.'); return;
    }
    const payload = {
      isbn: form.isbn.trim(), title: form.title.trim(), author: form.author.trim(),
      category: form.category.trim(), publisher: form.publisher.trim() || null,
      publicationYear: form.publicationYear ? Number(form.publicationYear) : null,
      quantity: Number(form.quantity || 1)
    };
    setSaving(true);
    try {
      if (editing) await api.updateBook(getId(editing), payload);
      else await api.addBook(payload);
      setEditing(null); setShowAdd(false); setNotice(editing ? 'Book updated successfully.' : 'Book added successfully.');
      await loadBooks();
    } catch (e2) { setError(e2.message); }
    finally { setSaving(false); }
  }

  async function removeBook(book) {
    if (!window.confirm(`Delete "${book.title ?? book.bookTitle ?? 'this book'}"?`)) return;
    setError(''); setNotice('');
    try { await api.deleteBook(getId(book)); setNotice('Book deleted.'); await loadBooks(); }
    catch (e) { setError(e.message); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><LibraryBig size={24}/></div><div><strong>Page & Pine</strong><span>LIBRARY MANAGER</span></div></div>
      <div className="nav-label">WORKSPACE</div>
      <div className="nav-item active"><BookOpen size={18}/> <span>Book catalog</span></div>
      <div className="sidebar-bottom"><div className="avatar">LB</div><div><strong>Library Admin</strong><span>EMA3151 Practical</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">LIBRARY OPERATIONS / CATALOG</div><h1>Book management</h1><p>Keep your collection organized, searchable, and up to date.</p></div><button className="primary" onClick={openAdd}><Plus size={18}/> Add a book</button></header>
      {error && <div className="alert error"><CircleAlert size={18}/><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
      {notice && <div className="alert success"><CircleCheck size={18}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
      <section className="stats">
        <div className="stat-card"><div className="stat-top"><span>Unique titles</span><BookOpen size={18}/></div><strong>{totalTitles}</strong><small>Books in catalog</small></div>
        <div className="stat-card"><div className="stat-top"><span>Total copies</span><Layers3 size={18}/></div><strong>{totalCopies}</strong><small>Across all titles</small></div>
        <div className="stat-card"><div className="stat-top"><span>Available copies</span><CircleCheck size={18}/></div><strong>{availableCopies}</strong><small>Ready to issue</small></div>
      </section>
      <section className="catalog-card">
        <div className="catalog-head"><div><h2>Library collection</h2><p>Browse and manage every book record.</p></div><button className="secondary" onClick={loadBooks} disabled={loading}><RefreshCw size={16} className={loading ? 'spin' : ''}/> Refresh</button></div>
        <div className="toolbar"><div className="searchbox"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, author, category or ISBN..." aria-label="Search books"/></div><span className="result-count">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</span></div>
        <div className="table-wrap"><table><thead><tr><th>BOOK</th><th>ISBN</th><th>CATEGORY</th><th>AVAILABILITY</th><th className="right">ACTIONS</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan="5" className="empty"><RefreshCw className="spin" size={22}/><span>Loading library collection...</span></td></tr>
          : filtered.length === 0 ? <tr><td colSpan="5" className="empty"><BookOpen size={25}/><strong>{query ? 'No matching books' : 'Your catalog is empty'}</strong><span>{query ? 'Try another search term.' : 'Add your first book to get started.'}</span></td></tr>
          : filtered.map((b, i) => {
            const available = getAvailable(b), total = getQuantity(b);
            return <tr key={getId(b) ?? i}><td><div className="book-cell"><div className="book-cover">{String(b.title ?? b.bookTitle ?? 'B').slice(0,1).toUpperCase()}</div><div><strong>{b.title ?? b.bookTitle ?? 'Untitled'}</strong><span>{b.author ?? b.bookAuthor ?? 'Unknown author'}</span></div></div></td><td className="mono">{getIsbn(b) || '—'}</td><td><span className="category">{b.category ?? b.genre ?? 'General'}</span></td><td><span className={`status ${available > 0 ? 'available' : 'issued'}`}><i/> {available > 0 ? `${available} / ${total} available` : 'All issued'}</span></td><td><div className="actions"><button className="icon-btn" title="Edit book" onClick={() => openEdit(b)}><Pencil size={16}/></button><button className="icon-btn danger-btn" title="Delete book" onClick={() => removeBook(b)}><Trash2 size={16}/></button></div></td></tr>;
          })}</tbody></table></div>
        <div className="table-footer"><span>EMA3151 · Full Stack Development using Java</span><span>React + Spring Boot</span></div>
      </section>
      <footer>LIBRARY MANAGEMENT SYSTEM <span>•</span> PRACTICAL PROJECT</footer>
    </main>
    {(editing !== null || (form !== emptyBook && false)) && null}
    {((editing !== null) || window.__showAddModal) && null}
    <ModalHost
      open={Boolean(window.__showAddModal) || editing !== null}
      title={editing ? 'Edit book details' : 'Add a new book'}
      onClose={() => { window.__showAddModal = false; setEditing(null); setForm(emptyBook); forceModalRefresh(); }}
      form={form} onChange={updateField} onSubmit={saveBook} saving={saving} editing={editing}
    />
  </div>;
}

function ModalHost({ open, title, onClose, form, onChange, onSubmit, saving, editing }) {
  const [, setTick] = useState(0);
  if (!open) return <AddBookButtonBridge />;
  return <Modal title={title} onClose={onClose}>
    <form className="book-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>ISBN / Book ID *<input name="isbn" value={form.isbn} onChange={onChange} required placeholder="e.g. 9780132350884" /></label>
        <label>Category *<input name="category" value={form.category} onChange={onChange} required placeholder="e.g. Computer Science" /></label>
        <label className="full">Book title *<input name="title" value={form.title} onChange={onChange} required placeholder="Enter the book title" /></label>
        <label>Author *<input name="author" value={form.author} onChange={onChange} required placeholder="Author name" /></label>
        <label>Publisher<input name="publisher" value={form.publisher} onChange={onChange} placeholder="Publisher (optional)" /></label>
        <label>Publication year<input name="publicationYear" type="number" min="0" max="2100" value={form.publicationYear} onChange={onChange} placeholder="2025" /></label>
        <label>Total copies<input name="quantity" type="number" min="1" value={form.quantity} onChange={onChange} required /></label>
      </div>
      <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit" className="primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add book'}</button></div>
    </form>
  </Modal>;
}

function AddBookButtonBridge() {
  useEffect(() => {
    const handler = () => { window.__showAddModal = true; window.dispatchEvent(new Event('library-open-add')); };
    document.querySelector('.topbar .primary')?.addEventListener('click', handler);
    return () => document.querySelector('.topbar .primary')?.removeEventListener('click', handler);
  }, []);
  return null;
}
function forceModalRefresh() { window.__showAddModal = false; window.dispatchEvent(new Event('library-close-modal')); }