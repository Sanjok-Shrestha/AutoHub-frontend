function SalesResult({ result }) {
  if (!result) return null;

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-xl">
      <p className="text-lg">
        Original: <span className="font-semibold">Rs. {result.original}</span>
      </p>

      <p className="text-xl font-bold text-green-600 mt-2">
        Final: Rs. {result.final}
      </p>

      {result.original !== result.final && (
        <p className="text-sm text-blue-600 mt-2">
          🎉 10% Loyalty Discount Applied!
        </p>
      )}
    </div>
  );
}

export default SalesResult;