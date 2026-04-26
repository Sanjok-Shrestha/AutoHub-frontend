function SalesForm({ amount, setAmount, calculate }) {
  return (
    <div>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-3 w-full rounded-lg mb-4"
      />

      <button
        onClick={calculate}
        className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700"
      >
        Calculate Discount
      </button>
    </div>
  );
}

export default SalesForm;