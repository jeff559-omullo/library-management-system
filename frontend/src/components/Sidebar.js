import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Sidebar() {
  return (
    <>
      <div className="sidebar">
        <div className="sidebar-top">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h3 className="sidebar-title">Library Panel</h3>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link">
            Dashboard
          </NavLink>
          <NavLink to="/books" className="sidebar-link">
            Books
          </NavLink>
          <NavLink to="/members" className="sidebar-link">
            Members
          </NavLink>
          <NavLink to="/transactions" className="sidebar-link">
            Transactions
          </NavLink>
        </nav>
      </div>

      <style>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: linear-gradient(180deg, #0f172a, #1e293b);
          color: white;
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          position: fixed;
          left: 0;
          top: 0;
          box-shadow: 4px 0 20px rgba(0,0,0,0.15);
        }

        .sidebar-top {
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
          letter-spacing: 1px;
          color: #e2e8f0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
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

        /* Make main content move right */
        body {
          margin-left: 250px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }
          body {
            margin-left: 200px;
          }
        }
      `}</style>
    </>
  );
}