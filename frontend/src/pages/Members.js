import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    API.get("/members").then(res => setMembers(res.data));
  }, []);

  return (
    <Layout title="Members">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member._id}>
                <td>{member.name}</td>
                <td>{member.regNo}</td>
                <td>{member.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}