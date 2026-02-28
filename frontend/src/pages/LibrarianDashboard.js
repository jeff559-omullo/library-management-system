import { useEffect, useState } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom"; // for logout redirect

export default function LibrarianDashboard() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingBook, setEditingBook] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    copies: "",
    coverImage: null,
    ebookFile: null
  });

  const fetchAll = async () => {
    try {
      const [booksRes, transRes] = await Promise.all([
        API.get("/books"),
        API.get("/transactions/all")
      ]);
      setBooks(booksRes.data);
      setTransactions(transRes.data);
    } catch {
      setError("Failed to load data");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const daysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const overdueTransactions = transactions.filter(t =>
    t.status === "borrowed" && new Date() > new Date(t.dueDate)
  );

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [
    { name: "Borrowed", value: transactions.filter(t => t.status === "borrowed").length },
    { name: "Returned", value: transactions.filter(t => t.status === "returned").length }
  ];

  const addBook = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });

      await API.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm({
        title: "", author: "", isbn: "", copies: "",
        coverImage: null, ebookFile: null
      });

      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  const deleteBook = async (id) => {
    await API.delete(`/books/${id}`);
    fetchAll();
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // or however you store token
    navigate("/login");
  };

  // Helper component to load ebooks securely
  const EbookViewer = ({ bookId }) => {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
      const fetchEbook = async () => {
        try {
          const response = await API.get(`/books/read/${bookId}`, {
            responseType: "blob"
          });
          const url = URL.createObjectURL(response.data);
          setPdfUrl(url);
        } catch (err) {
          console.error("Failed to load ebook", err);
        }
      };

      fetchEbook();

      return () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      };
    }, [bookId]);

    if (!pdfUrl) return <div>Loading ebook...</div>;

    return (
      <iframe
        src={pdfUrl}
        width="100%"
        height="300px"
        title="ebook"
      />
    );
  };

  return (
    <div style={layout.wrapper}>
      <div style={layout.sidebar}>
        <img src={logo} alt="logo" width={120} />
        <h3>Librarian Panel</h3>
        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
        >
          Logout
        </button>
      </div>

      <div style={layout.content}>

        {error && <div style={{ color: "red" }}>{error}</div>}

        {/* CHART */}
        <div style={card}>
          <h3>Borrow Statistics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ADD BOOK */}
        <div style={card}>
          <h3>Add Book</h3>

          <input
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Author"
            value={form.author}
            onChange={e => setForm({ ...form, author: e.target.value })}
          />

          <input
            placeholder="ISBN"
            value={form.isbn}
            onChange={e => setForm({ ...form, isbn: e.target.value })}
          />

          <input
            type="number"
            placeholder="Copies"
            value={form.copies}
            onChange={e => setForm({ ...form, copies: e.target.value })}
          />

          <input
            type="file"
            onChange={e => setForm({ ...form, coverImage: e.target.files[0] })}
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={e => setForm({ ...form, ebookFile: e.target.files[0] })}
          />

          <button onClick={addBook}>Add</button>
        </div>

        {/* SEARCH */}
        <div style={card}>
          <input
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* OVERDUE */}
        <div style={{ ...card, border: "2px solid red" }}>
          <h3>Overdue Books ({overdueTransactions.length})</h3>
          {overdueTransactions.map(t => (
            <div key={t._id} style={{ color: "red" }}>
              {t.book?.title} — {t.student?.name}
              ({daysLeft(t.dueDate) * -1} days overdue)
            </div>
          ))}
        </div>

        {/* BOOK LIST */}
        <div style={card}>
          <h3>All Books</h3>
          {filteredBooks.map(book => (
            <div key={book._id} style={row}>
              <div style={{ flex: 1 }}>
                <strong>{book.title}</strong>
                <div>
                  {book.isEbook
                    ? "E-Book (Read Online Only)"
                    : `Available: ${book.available}/${book.copies}`}
                </div>

                {/* SECURE EBOOK VIEWER */}
                {book.isEbook && (
                  <EbookViewer bookId={book._id} />
                )}
              </div>

              <button onClick={() => deleteBook(book._id)}>Delete</button>
            </div>
          ))}
        </div>

        {/* BORROW HISTORY */}
        <div style={card}>
          <h3>Borrow History</h3>
          {transactions.map(t => (
            <div key={t._id}>
              {t.book?.title} —
              {t.student?.name} —
              {t.status}
              {t.status === "borrowed" && (
                <span>
                  {" "}({daysLeft(t.dueDate)} days left)
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const layout = {
  wrapper: { display: "flex", minHeight: "100vh", background: "#f1f5f9" },
  sidebar: { width: 240, background: "#0f172a", color: "#fff", padding: 30 },
  content: { flex: 1, padding: 40 }
};

const card = {
  background: "#fff",
  padding: 25,
  marginBottom: 30,
  borderRadius: 10
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  borderBottom: "1px solid #ddd"
};

const logoutButtonStyle = {
  marginTop: "20px",
  padding: "10px",
  width: "100%",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};