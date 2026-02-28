import { useEffect, useState } from "react";
import API from "../services/api";
import logo from "../assets/logo.png";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [bookStats, setBookStats] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const fetchAll = async () => {
    const [usersRes, statsRes, booksRes] = await Promise.all([
      API.get("/users"),
      API.get("/transactions/admin-stats"),
      API.get("/books/admin-count")
    ]);

    setUsers(usersRes.data);
    setStats(statsRes.data);
    setBookStats(booksRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const createLibrarian = async () => {
    await API.post("/users/create-librarian", form);
    setForm({ name: "", email: "", password: "" });
    fetchAll();
  };

  const deleteUser = async (id) => {
    await API.delete(`/users/${id}`);
    fetchAll();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.sidebar}>
        <img src={logo} width={120} alt="logo" />
        <h2>Admin Panel</h2>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      <div style={styles.content}>

        {/* SYSTEM STATS */}
        {stats && bookStats && (
          <div style={styles.statsGrid}>
            <StatCard title="Total Books" value={bookStats.totalBooks} />
            <StatCard title="Total Copies" value={bookStats.totalCopies} />
            <StatCard title="Borrowed" value={stats.borrowed} />
            <StatCard title="Returned" value={stats.returned} />
            <StatCard title="Overdue" value={stats.overdue} />
            <StatCard title="Total Fines" value={`Ksh ${stats.totalFines}`} />
          </div>
        )}

        {/* CREATE LIBRARIAN */}
        <div style={styles.card}>
          <h3>Create Librarian</h3>
          <input placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={styles.primaryBtn} onClick={createLibrarian}>
            Create
          </button>
        </div>

        {/* USERS */}
        <div style={styles.card}>
          <h3>All Users</h3>
          {users.map(user => (
            <div key={user._id} style={styles.userRow}>
              <span>{user.name} ({user.role})</span>
              <button style={styles.deleteBtn}
                onClick={() => deleteUser(user._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", minHeight: "100vh", background: "#f1f5f9" },
  sidebar: { width: 240, background: "#0f172a", color: "#fff", padding: 30 },
  content: { flex: 1, padding: 40 },
  logoutBtn: { marginTop: 20, padding: 10, background: "#ef4444", color: "#fff", border: "none" },
  card: { background: "#fff", padding: 25, borderRadius: 12, marginBottom: 30, display: "flex", flexDirection: "column", gap: 10 },
  primaryBtn: { padding: 10, background: "#2563eb", color: "#fff", border: "none" },
  deleteBtn: { padding: 6, background: "#ef4444", color: "#fff", border: "none" },
  userRow: { display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #ddd" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20, marginBottom: 30 }
};