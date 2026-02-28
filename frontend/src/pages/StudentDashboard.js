import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";
import jsPDF from "jspdf";

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

  const isOverdue = (t) =>
    new Date() > new Date(t.dueDate) && t.status === "borrowed";

  const daysLeft = (t) => {
    const diff = new Date(t.dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

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
            <p className="subtitle">Manage your books and track your activity</p>
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
                    src={`http://localhost:5000/uploads/${book.coverImage}`}
                    alt={book.title}
                    className="book-cover"
                  />
                )}
                <h4>{book.title}</h4>
                <p className="book-author">{book.author}</p>
                <p className="availability">
                  Available: {book.available} / {book.copies}
                </p>

                <button
                  className="action-btn"
                  disabled={book.available === 0}
                  onClick={() => handleReserve(book._id)}
                >
                  {book.available === 0 ? "Reserved" : "Borrow"}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "borrowed" && (
          <div className="grid">
            {borrowed.map(t => (
              <div
                key={t._id}
                className={`card ${isOverdue(t) ? "overdue" : ""}`}
              >
                <h4>{t.book?.title}</h4>
                <p>Due: {new Date(t.dueDate).toDateString()}</p>
                <p>Fine: Ksh {t.fine}</p>

                <div>
                  {t.fine > 0 && !t.finePaid && (
                    <button className="pay-btn" onClick={() => handlePay(t._id)}>
                      Pay Fine
                    </button>
                  )}
                  <button className="return-btn" onClick={() => handleReturn(t._id)}>
                    Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="grid">
            {history.map(t => (
              <div key={t._id} className="card">
                <h4>{t.book?.title}</h4>
                <p>Returned: {new Date(t.returnDate).toDateString()}</p>
                <p>Fine Paid: {t.finePaid ? "Yes" : "No"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .student-container {
          padding: 40px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .subtitle {
          color: #64748b;
        }

        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 25px;
          cursor: pointer;
          transition: 0.3s;
        }

        .logout-btn:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .tabs {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 25px;
        }

        .tabs button {
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          background: #e2e8f0;
          cursor: pointer;
          transition: 0.3s;
        }

        .tabs button.active {
          background: #334155;
          color: white;
        }

        .download-btn {
          margin-left: auto;
          background: #22c55e !important;
          color: white !important;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .card {
          background: white;
          padding: 18px;
          border-radius: 14px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          transition: 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .book-cover {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .availability {
          font-size: 13px;
          color: #0ea5e9;
        }

        .action-btn,
        .pay-btn,
        .return-btn {
          margin-top: 10px;
          padding: 7px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          color: white;
        }

        .action-btn {
          background: #3b82f6;
        }

        .pay-btn {
          background: #f59e0b;
          margin-right: 8px;
        }

        .return-btn {
          background: #10b981;
        }

        .notification-badge {
          background: red;
          color: white;
          padding: 4px 8px;
          border-radius: 50%;
          margin-left: 8px;
          font-size: 12px;
        }

        .loading, .error {
          padding: 40px;
          text-align: center;
        }
      `}</style>
    </DashboardLayout>
  );
}