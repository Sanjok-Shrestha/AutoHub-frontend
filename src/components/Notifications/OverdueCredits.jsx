import { useEffect, useState } from "react";
import API from "../../services/api";

function OverdueCredits() {
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await API.get("/notification/overdue");
    setCredits(res.data);
  };

  if (credits.length === 0) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg mb-6">
      <h3 className="font-bold mb-2">⏰ Overdue Payments</h3>

      {credits.map(c => (
        <div key={c.id}>
          {c.customerName} - Rs. {c.amount}
        </div>
      ))}
    </div>
  );
}

export default OverdueCredits;