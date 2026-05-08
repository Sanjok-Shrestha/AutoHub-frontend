import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL = "https://localhost:7249/api/vendors";

function VendorPage({ setPage }) {
  const [vendors, setVendors] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    vendorName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    status: "Active",
  });

  const fetchVendors = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setVendors(data);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      vendorName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      status: "Active",
    });
    setEditingId(null);
  };

  const saveVendor = async (e) => {
    e.preventDefault();

    if (!form.vendorName || !form.phone || !form.email) {
      alert("Please fill Vendor Name, Phone, and Email.");
      return;
    }

    if (form.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      resetForm();
      fetchVendors();
      return;
    }

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    resetForm();
    fetchVendors();
  };

  const editVendor = (vendor) => {
    setEditingId(vendor.id);
    setForm({
      vendorName: vendor.vendorName,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      status: vendor.status,
    });
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    fetchVendors();
  };

  const activeVendors = vendors.filter((v) => v.status === "Active").length;
  const inactiveVendors = vendors.filter((v) => v.status === "Inactive").length;

  return (
    <AdminLayout
      setPage={setPage}
      activePage="vendor"
      title="Vendor Management"
      subtitle="Manage supplier details and availability"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Total Vendors</p>
          <h3 className="text-4xl font-bold mt-3">{vendors.length}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Registered supplier records
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Active Vendors</p>
          <h3 className="text-4xl font-bold mt-3">{activeVendors}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Available for purchase operations
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Inactive Vendors</p>
          <h3 className="text-4xl font-bold mt-3">{inactiveVendors}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Currently not in use
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        <form
          onSubmit={saveVendor}
          className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-7"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              {editingId ? "Update Vendor" : "Add New Vendor"}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Store supplier details used for purchasing stock.
            </p>
          </div>

          <div className="space-y-4">
            <input
              name="vendorName"
              value={form.vendorName}
              onChange={handleChange}
              placeholder="Vendor Name *"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
            />

            <input
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              placeholder="Contact Person"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
            />

            <div className="relative">
              <input
                name="phone"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    setForm({ ...form, phone: val });
                  }
                }}
                placeholder="Enter Phone Number"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 pr-20 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600">
                {form.phone.length}/10
              </span>
            </div>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address *"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
            />

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Vendor Address"
              rows="4"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 resize-none outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
            />

            <div className="relative">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 pr-12 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black appearance-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition"
            >
              {editingId ? "Update Vendor" : "Add Vendor"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-neutral-100 text-neutral-800 py-3 rounded-2xl font-semibold hover:bg-neutral-200 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-200 p-7">
          <div className="mb-6">
            <h3 className="text-xl font-bold">Vendor Records</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Manage vendor information used in purchase invoice processing.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="w-[35%] px-5 py-4 text-left">Vendor</th>
                  <th className="w-[18%] px-5 py-4 text-left">Phone</th>
                  <th className="w-[17%] px-5 py-4 text-left">Status</th>
                  <th className="w-[30%] px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-14 text-center">
                      <p className="font-semibold text-neutral-700">
                        No vendor records found
                      </p>
                      <p className="text-neutral-500 text-sm mt-1">
                        Add your first supplier to start managing purchases.
                      </p>
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 align-middle">
                        <p className="font-semibold truncate">
                          {vendor.vendorName}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {vendor.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        {vendor.phone}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            vendor.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {vendor.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editVendor(vendor)}
                            className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-200"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteVendor(vendor.id)}
                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default VendorPage;