function PartList({ parts, deletePart, editPart }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Parts List</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {parts.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td>{p.name}</td>
              <td>{p.quantity}</td>
              <td>Rs. {p.price}</td>

              <td>
                {p.quantity < 10 ? (
                  <span className="text-red-600 font-semibold">
                    Low Stock
                  </span>
                ) : (
                  <span className="text-green-600">In Stock</span>
                )}
              </td>

              <td className="space-x-2">
                <button
                  onClick={() => editPart(p)}
                  className="bg-yellow-400 px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deletePart(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PartList;