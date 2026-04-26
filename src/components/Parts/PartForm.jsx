function PartForm({ form, handleChange, addOrUpdate, editId }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editId ? "Update Part" : "Add New Part"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Part Name"
          className="border p-2 rounded-lg"
        />

        <input
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          type="number"
          className="border p-2 rounded-lg"
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          type="number"
          className="border p-2 rounded-lg"
        />
      </div>

      <button
        onClick={addOrUpdate}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        {editId ? "Update" : "Add"}
      </button>
    </div>
  );
}

export default PartForm;