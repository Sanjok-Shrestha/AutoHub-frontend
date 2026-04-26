import { useEffect, useState } from "react";
import API from "../../services/api";

function LowStockAlert() {
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await API.get("/notification/low-stock");
    setLowStock(res.data);
  };

  if (lowStock.length === 0) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
      <h3 className="font-bold mb-2">⚠ Low Stock Alert</h3>

      {lowStock.map((p) => (
        <div key={p.id}>
          {p.name} (Remaining: {p.quantity})
        </div>
      ))}
    </div>
  );
}

export default LowStockAlert;