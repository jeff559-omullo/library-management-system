import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard"); // change to your student dashboard route
  }, [navigate]);

  const handleSignup = async () => {
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await API.post("/auth/register", form);
      alert("Account created. You can login now.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img src={logo} alt="Logo" style={{ width: "100px", marginBottom: 20 }} />
        <h2 style={{ marginBottom: 20, color: "#0f172a" }}>Create Student Account</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          placeholder="Full Name"
          style={styles.input}
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          type="email"
          style={styles.input}
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          style={styles.input}
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <input
          placeholder="Confirm Password"
          type="password"
          style={styles.input}
          value={form.confirmPassword}
          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
        />

        <button style={styles.button} onClick={handleSignup}>
          Sign Up
        </button>

        <p style={{ marginTop: 15, fontSize: 14, color: "#64748b" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)"
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    width: "380px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "1rem",
    transition: "border-color 0.3s",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
  error: {
    color: "#ef4444",
    marginBottom: "10px",
    fontWeight: 500
  }
};