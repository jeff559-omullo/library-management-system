import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Books from "./pages/Books";
import Reservations from "./pages/Reservations";
import Signup from "./pages/Signup";
function App() {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const getDashboard = () => {
    if (!token) return "/login";
    if (role === "admin") return "/admin";
    if (role === "librarian") return "/librarian";
    if (role === "student") return "/student";
    return "/login";
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* SMART ROOT */}
          <Route path="/" element={<Navigate to={getDashboard()} />} />

          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/librarian" element={
            <ProtectedRoute roles={["librarian"]}>
              <LibrarianDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/books" element={
            <ProtectedRoute roles={["student","admin","librarian"]}>
              <Books />
            </ProtectedRoute>
          } />

          <Route path="/reservations" element={
            <ProtectedRoute roles={["admin","librarian"]}>
              <Reservations />
            </ProtectedRoute>
          } />
<Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;