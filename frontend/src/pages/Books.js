import { useEffect, useState } from "react";
import API from "../services/api";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await API.get("/books");
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const reserveBook = async (id) => {
    try {
      await API.post(`/transactions/reserve/${id}`);
      alert("Book reserved successfully");
      // update local availability
      setBooks((prev) =>
        prev.map((b) => (b._id === id ? { ...b, available: b.available - 1 } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Reservation failed");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{
        color: "#1e293b",
        fontSize: "2rem",
        marginBottom: "20px",
        fontWeight: "600"
      }}>Available Books</h2>

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading books...</p>
      ) : books.length === 0 ? (
        <p style={{ color: "#64748b" }}>No books available.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px"
        }}>
          {books.map((book) => (
            <div key={book._id} style={{
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0px)"}
            >
              <div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "10px", color: "#0f172a" }}>
                  {book.title}
                </h3>
                <p style={{ margin: "0 0 5px 0", color: "#475569" }}>
                  <strong>Author:</strong> {book.author}
                </p>
                <p style={{ margin: "0", color: "#475569" }}>
                  <strong>Available:</strong> {book.available}
                </p>
              </div>

              <button
                onClick={() => reserveBook(book._id)}
                disabled={book.available === 0}
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: book.available === 0 ? "not-allowed" : "pointer",
                  background: book.available === 0 ? "#94a3b8" : "#2563eb",
                  color: "#fff",
                  fontWeight: "500",
                  transition: "background 0.3s",
                }}
                onMouseEnter={e => {
                  if (book.available !== 0) e.currentTarget.style.background = "#1d4ed8";
                }}
                onMouseLeave={e => {
                  if (book.available !== 0) e.currentTarget.style.background = "#2563eb";
                }}
              >
                {book.available === 0 ? "Out of Stock" : "Reserve"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}