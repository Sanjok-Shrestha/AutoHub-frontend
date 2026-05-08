import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

const API_URL = "https://localhost:7249/api/staff";

function StaffPage({ setPage }) {
  const [staff, setStaff] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    status: "Active",
    photo: "",
  });

  const [photoPreview, setPhotoPreview] = useState("");

  const fetchStaff = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setStaff(data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setForm({ ...form, photo: reader.result });
      };

      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      status: "Active",
      photo: "",
    });
    setPhotoPreview("");
    setEditingId(null);
  };

  const saveStaff = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      alert("Please fill Name, Email, and Phone.");
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
      fetchStaff();
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
    fetchStaff();
  };

  const editStaff = (s) => {
    setEditingId(s.id);
    setForm({ ...s });
    setPhotoPreview(s.photo);
  };

  const deleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    fetchStaff();
  };

  const totalStaff = staff.length;
  const adminUsers = staff.filter((s) => s.role === "Admin").length;
  const staffUsers = staff.filter((s) => s.role === "Staff").length;

  return (
    <AdminLayout
      setPage={setPage}
      activePage="staff"
      title="Staff Management"
      subtitle="Manage staff registration and system roles"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Total Staff</p>
          <h3 className="text-4xl font-bold mt-3">{totalStaff}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Registered staff accounts
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Admin Users</p>
          <h3 className="text-4xl font-bold mt-3">{adminUsers}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Users with admin access
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Staff Users</p>
          <h3 className="text-4xl font-bold mt-3">{staffUsers}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Users with staff access
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        <form
          onSubmit={saveStaff}
          className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-7"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              {editingId ? "Update Staff" : "Add New Staff"}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Register staff and assign system roles.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-100 border border-neutral-300 overflow-hidden flex items-center justify-center text-neutral-400 font-semibold">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Staff preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Photo"
                )}
              </div>

              <label className="cursor-pointer rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-semibold hover:bg-neutral-100">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name *"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address *"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
            />

            <div className="relative">
              <input
                name="phone"
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setForm({ ...form, phone: value });
                  }
                }}
                placeholder="Enter Phone Number"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 pr-20 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600">
                {form.phone.length}/10
              </span>
            </div>

            <div className="relative">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 pr-12 outline-none focus:ring-4 focus:ring-neutral-200 focus:border-black appearance-none bg-white"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
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
              {editingId ? "Update Staff" : "Add Staff"}
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
            <h3 className="text-xl font-bold">Staff Records</h3>
            <p className="text-sm text-neutral-500 mt-1">
              View staff details and manage assigned roles.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="w-[35%] px-5 py-4 text-left">Staff</th>
                  <th className="w-[18%] px-5 py-4 text-left">Phone</th>
                  <th className="w-[15%] px-5 py-4 text-left">Role</th>
                  <th className="w-[15%] px-5 py-4 text-left">Status</th>
                  <th className="w-[17%] px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-14 text-center">
                      <p className="font-semibold text-neutral-700">
                        No staff records found
                      </p>
                      <p className="text-neutral-500 text-sm mt-1">
                        Add staff members and assign roles to begin.
                      </p>
                    </td>
                  </tr>
                ) : (
                  staff.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 border overflow-hidden flex items-center justify-center text-xs text-neutral-500">
                            {s.photo ? (
                              <img
                                src={s.photo}
                                alt={s.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "N/A"
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold truncate">{s.name}</p>
                            <p className="text-xs text-neutral-500 truncate">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">{s.phone}</td>

                      <td className="px-5 py-4 align-middle">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                          {s.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            s.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editStaff(s)}
                            className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStaff(s.id)}
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

export default StaffPage;