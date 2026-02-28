import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";
import jsPDF from "jspdf";

const API_URL = process.env.REACT_APP_API_URL;

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [booksRes, transRes, userRes] = await Promise.all([
        API.get("/books"),
        API.get("/transactions/my"),
        API.get("/users/me")
      ]);

      setBooks(booksRes.data);
      setTransactions(transRes.data);
      setUser(userRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const borrowed = transactions.filter(t => t.status === "borrowed");
  const history = transactions.filter(t => t.status === "returned");

  const daysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (t) =>
    new Date() > new Date(t.dueDate) && t.status === "borrowed";

  const handleReserve = async (id) => {
    try {
      await API.post(`/transactions/reserve/${id}`);
      fetchAll();
    } catch {
      alert("Failed to reserve book");
    }
  };

  const handleReturn = async (id) => {
    try {
      await API.post(`/transactions/return/${id}`);
      fetchAll();
    } catch {
      alert("Failed to return book");
    }
  };

  const handlePay = async (id) => {
    try {
      await API.post(`/transactions/pay/${id}`);
      fetchAll();
    } catch {
      alert("Failed to pay fine");
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Library Report", 20, 20);

    transactions.forEach((t, i) => {
      doc.text(
        `${i + 1}. ${t.book?.title || "Unknown"} - ${t.status} - Fine: Ksh ${t.fine}`,
        20,
        30 + i * 10
      );
    });

    doc.save("library-report.pdf");
  };

  const notificationCount = borrowed.filter(isOverdue).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading)
    return (
      <DashboardLayout role="student">
        <div className="loading">Loading...</div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout role="student">
        <div className="error">{error}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="student">
      <div className="student-container">

        <div className="student-header">
          <div>
            <h2>
              Welcome {user?.name}
              {notificationCount > 0 && (
                <span className="notification-badge">
                  {notificationCount}
                </span>
              )}
            </h2>
            <p className="subtitle">
              Manage your books and track your activity
            </p>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "available" ? "active" : ""}
            onClick={() => setActiveTab("available")}
          >
            Available
          </button>

          <button
            className={activeTab === "borrowed" ? "active" : ""}
            onClick={() => setActiveTab("borrowed")}
          >
            Borrowed ({borrowed.length})
          </button>

          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>

          <button className="download-btn" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>

        {activeTab === "available" && (
          <div className="grid">
            {books.map(book => (
              <div key={book._id} className="card">

                {book.coverImage && (
                  <img
                    src={`${API_URL}/uploads/${book.coverImage}`}
                    alt={book.title}
                    className="book-cover"
                  />
                )}

                <h4>{book.title}</h4>
                <p>{book.author}</p>

                <p className="availability">
                  Available: {book.available} / {book.copies}
                </p>

                <button
                  className="action-btn"
                  disabled={book.available === 0}
                  onClick={() => handleReserve(book._id)}
                >
                  {book.available === 0 ? "Unavailable" : "Borrow"}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "borrowed" && (
          <div className="grid">
            {borrowed.map(t => {
              const remaining = daysLeft(t.dueDate);

              return (
                <div
                  key={t._id}
                  className={`card ${isOverdue(t) ? "overdue" : ""}`}
                >
                  <h4>{t.book?.title}</h4>

                  <p>
                    Due: {new Date(t.dueDate).toDateString()}
                  </p>

                  {!isOverdue(t) ? (
                    <p className="days-left">
                      Days Left: {remaining}
                    </p>
                  ) : (
                    <p className="overdue-text">
                      Overdue by {Math.abs(remaining)} days
                    </p>
                  )}

                  <p>Fine: Ksh {t.fine}</p>

                  <div>
                    {t.fine > 0 && !t.finePaid && (
                      <button
                        className="pay-btn"
                        onClick={() => handlePay(t._id)}
                      >
                        Pay Fine
                      </button>
                    )}

                    <button
                      className="return-btn"
                      onClick={() => handleReturn(t._id)}
                    >
                      Return
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "history" && (
          <div className="grid">
            {history.map(t => (
              <div key={t._id} className="card">
                <h4>{t.book?.title}</h4>
                <p>
                  Returned: {new Date(t.returnDate).toDateString()}
                </p>
                <p>
                  Fine Paid: {t.finePaid ? "Yes" : "No"}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}