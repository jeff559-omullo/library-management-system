import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import "../components/DashboardLayout.css";

export default function LibrarianDashboard() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    fetchAll();
  }, []);

  const daysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const overdueTransactions = transactions.filter(
    t => t.status === "borrowed" && new Date() > new Date(t.dueDate)
  );

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [
    {
      name: "Borrowed",
      value: transactions.filter(t => t.status === "borrowed").length
    },
    {
      name: "Returned",
      value: transactions.filter(t => t.status === "returned").length
    }
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
        title: "",
        author: "",
        isbn: "",
        copies: "",
        coverImage: null,
        ebookFile: null
      });

      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    }
  };

  const deleteBook = async (id) => {
    try {
      await API.delete(`/books/${id}`);
      fetchAll();
    } catch {
      setError("Failed to delete book");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const EbookViewer = ({ bookId }) => {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
      let objectUrl;

      const fetchEbook = async () => {
        try {
          const response = await API.get(`/books/read/${bookId}`, {
            responseType: "blob"
          });
          objectUrl = URL.createObjectURL(response.data);
          setPdfUrl(objectUrl);
        } catch (err) {
          console.error("Failed to load ebook", err);
        }
      };

      fetchEbook();

      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
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
    <DashboardLayout onLogout={handleLogout}>
      {error && <div className="error">{error}</div>}

      {/* CHART */}
      <div className="card">
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
      <div className="card">
        <h3>Add Book</h3>
        <input placeholder="Title" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} />

        <input placeholder="Author" value={form.author}
          onChange={e => setForm({ ...form, author: e.target.value })} />

        <input placeholder="ISBN" value={form.isbn}
          onChange={e => setForm({ ...form, isbn: e.target.value })} />

        <input type="number" placeholder="Copies" value={form.copies}
          onChange={e => setForm({ ...form, copies: e.target.value })} />

        <input type="file"
          onChange={e => setForm({ ...form, coverImage: e.target.files[0] })} />

        <input type="file" accept="application/pdf"
          onChange={e => setForm({ ...form, ebookFile: e.target.files[0] })} />

        <button onClick={addBook}>Add</button>
      </div>

      {/* SEARCH */}
      <div className="card">
        <input
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* OVERDUE */}
      <div className="card danger">
        <h3>Overdue Books ({overdueTransactions.length})</h3>
        {overdueTransactions.map(t => (
          <div key={t._id} className="overdue-item">
            {t.book?.title} — {t.student?.name}
            ({Math.abs(daysLeft(t.dueDate))} days overdue)
          </div>
        ))}
      </div>

      {/* BOOK LIST */}
      <div className="card">
        <h3>All Books</h3>
        {filteredBooks.map(book => (
          <div key={book._id} className="book-row">
            <div className="book-info">
              <strong>{book.title}</strong>
              <div>
                {book.isEbook
                  ? "E-Book (Read Online Only)"
                  : `Available: ${book.available}/${book.copies}`}
              </div>

              {book.isEbook && (
                <EbookViewer bookId={book._id} />
              )}
            </div>

            <button onClick={() => deleteBook(book._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* BORROW HISTORY */}
      <div className="card">
        <h3>Borrow History</h3>
        {transactions.map(t => (
          <div key={t._id}>
            {t.book?.title} — {t.student?.name} — {t.status}
            {t.status === "borrowed" && (
              <span> ({daysLeft(t.dueDate)} days left)</span>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}