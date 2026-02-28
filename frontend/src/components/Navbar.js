import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2>Library System</h2>
      <div>
        <Link to="/">Dashboard</Link>
        <Link to="/books">Books</Link>
        <Link to="/members">Members</Link>
        <Link to="/transactions">Transactions</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#1e293b",
    color: "white"
  }
};