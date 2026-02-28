import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    transactions: 0
  });

  useEffect(() => {
    async function fetchStats() {
      const books = await API.get("/books");
      const members = await API.get("/members");
      const transactions = await API.get("/transactions");

      setStats({
        books: books.data.length,
        members: members.data.length,
        transactions: transactions.data.length
      });
    }

    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="cards">
        <div className="card">
          <h3>{stats.books}</h3>
          <p>Total Books</p>
        </div>
        <div className="card">
          <h3>{stats.members}</h3>
          <p>Total Members</p>
        </div>
        <div className="card">
          <h3>{stats.transactions}</h3>
          <p>Total Transactions</p>
        </div>
      </div>
    </Layout>
  );
}