import { useEffect, useState } from "react";
import API from "../services/api";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    API.get("/reservations").then(res => setReservations(res.data));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Reservations</h2>
      {reservations.map(res => (
        <div key={res._id}>
          {res.book?.title} - {res.student?.name} ({res.status})
        </div>
      ))}
    </div>
  );
}