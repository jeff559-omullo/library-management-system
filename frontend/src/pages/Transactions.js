import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ bookId: "", memberId: "" });

  const fetchAll = async () => {
    const tx = await API.get("/transactions");
    const bk = await API.get("/books");
    const mb = await API.get("/members");

    setTransactions(tx.data);
    setBooks(bk.data);
    setMembers(mb.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleIssue = async () => {
    await API.post("/transactions/issue", form);
    fetchAll();
  };

  const handleReturn = async (id) => {
    await API.put(`/transactions/return/${id}`);
    fetchAll();
  };

  return (
    <Layout title="Transactions">

      <h3>Issue Book</h3>
      <select onChange={e => setForm({...form, bookId: e.target.value})}>
        <option>Select Book</option>
        {books.map(book => (
          <option key={book._id} value={book._id}>
            {book.title}
          </option>
        ))}
      </select>

      <select onChange={e => setForm({...form, memberId: e.target.value})}>
        <option>Select Member</option>
        {members.map(member => (
          <option key={member._id} value={member._id}>
            {member.name}
          </option>
        ))}
      </select>

      <button className="btn-primary" onClick={handleIssue}>
        Issue
      </button>

      <div className="table-container" style={{ marginTop: "20px" }}>
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td>{tx.book?.title}</td>
                <td>{tx.member?.name}</td>
                <td>{tx.status}</td>
                <td>{tx.fine || 0}</td>
                <td>
                  {tx.status !== "Returned" && (
                    <button
                      className="btn-success"
                      onClick={() => handleReturn(tx._id)}
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Layout>
  );
}