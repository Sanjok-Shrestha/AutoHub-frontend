import { useState } from "react";
import API from "../services/api";

function SalesPage() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);

  const calculate = async () => {
    const res = await API.post("/sales", {
      amount: Number(amount),
    });

    setResult(res.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Sales & Discount
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md max-w-md">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded-lg mb-4"
        />

        <button
          onClick={calculate}
          className="bg-green-600 text-white w-full py-2 rounded-lg"
        >
          Calculate Discount
        </button>

        {result && (
          <div className="mt-4">
            <p>Original: Rs. {result.original}</p>
            <p className="font-bold text-green-600">
              Final: Rs. {result.final}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesPage;