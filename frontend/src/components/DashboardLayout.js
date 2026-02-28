import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function DashboardLayout({ role, children }) {
  return (
    <>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Library Logo" className="sidebar-logo" />
            <h3 className="sidebar-title">{role} Panel</h3>
          </div>

          <nav className="sidebar-nav">
            {role === "student" && (
              <>
                <NavLink to="/student" className="sidebar-link">
                  Dashboard
                </NavLink>
                <NavLink to="/student/books" className="sidebar-link">
                  Books
                </NavLink>
                <NavLink to="/student/history" className="sidebar-link">
                  History
                </NavLink>
              </>
            )}

            {role === "librarian" && (
              <>
                <NavLink to="/librarian" className="sidebar-link">
                  Dashboard
                </NavLink>
                <NavLink to="/librarian/books" className="sidebar-link">
                  Manage Books
                </NavLink>
                <NavLink to="/librarian/transactions" className="sidebar-link">
                  Transactions
                </NavLink>
              </>
            )}
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f1f5f9;
        }

        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0f172a, #1e293b);
          color: white;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0,0,0,0.15);
        }

        .sidebar-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .sidebar-logo {
          width: 100px;
          margin-bottom: 15px;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 600;
          text-transform: capitalize;
          color: #e2e8f0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sidebar-link {
          text-decoration: none;
          color: #cbd5e1;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          transform: translateX(5px);
        }

        .sidebar-link.active {
          background: #2563eb;
          color: white;
          box-shadow: 0 6px 15px rgba(37,99,235,0.4);
        }

        .main-content {
          flex: 1;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }
          .main-content {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}