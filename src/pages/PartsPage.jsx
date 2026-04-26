import { useEffect, useState } from "react";
import API from "../services/api";
import PartForm from "../components/Parts/PartForm";
import PartList from "../components/Parts/PartList";
import LowStockAlert from "../components/Notifications/LowStockAlert";
import OverdueCredits from "../components/Notifications/OverdueCredits";

function PartsPage() {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", price: "" });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const res = await API.get("/parts");
    setParts(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addOrUpdate = async () => {
    if (editId) {
      await API.put(`/parts/${editId}`, {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
      });
      setEditId(null);
    } else {
      await API.post("/parts", {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
      });
    }

    setForm({ name: "", quantity: "", price: "" });
    load();
  };

  const deletePart = async (id) => {
    await API.delete(`/parts/${id}`);
    load();
  };

  const editPart = (part) => {
    setForm(part);
    setEditId(part.id);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Vehicle Parts Management
      </h1>

      <LowStockAlert />
      <OverdueCredits />

      <PartForm
        form={form}
        handleChange={handleChange}
        addOrUpdate={addOrUpdate}
        editId={editId}
      />

      <PartList
        parts={parts}
        deletePart={deletePart}
        editPart={editPart}
      />
    </div>
  );
}

export default PartsPage;