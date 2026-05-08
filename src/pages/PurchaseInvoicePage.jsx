import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_URL = "http://localhost:5274/api/PurchaseInvoice";

function PurchaseInvoicePage({ setPage }) {
  const [invoices, setInvoices] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    invoiceNo: "",
    vendorName: "",
    partName: "",
    quantity: "",
    unitPrice: "",
    purchaseDate: "",
    status: "Received",
  });

  const fetchInvoices = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        const errorText = await response.text();
        alert("Backend Error: " + errorText);
        return;
      }

      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      invoiceNo: "",
      vendorName: "",
      partName: "",
      quantity: "",
      unitPrice: "",
      purchaseDate: "",
      status: "Received",
    });
    setEditingId(null);
  };

  const saveInvoice = async (e) => {
    e.preventDefault();

    if (
      !form.invoiceNo ||
      !form.vendorName ||
      !form.partName ||
      !form.quantity ||
      !form.unitPrice ||
      !form.purchaseDate
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      invoiceNo: form.invoiceNo,
      vendorName: form.vendorName,
      partName: form.partName,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      purchaseDate: new Date(form.purchaseDate + "T00:00:00Z").toISOString(),
      status: form.status,
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        alert("Backend Error: " + errorText);
        return;
      }

      await fetchInvoices();
      resetForm();

      alert(
        editingId
          ? "Invoice updated successfully!"
          : "Invoice created successfully!"
      );
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }
  };

  const editInvoice = (invoice) => {
    setEditingId(invoice.id);
    setForm({
      invoiceNo: invoice.invoiceNo,
      vendorName: invoice.vendorName,
      partName: invoice.partName,
      quantity: invoice.quantity.toString(),
      unitPrice: invoice.unitPrice.toString(),
      purchaseDate: invoice.purchaseDate?.split("T")[0] || invoice.purchaseDate,
      status: invoice.status,
    });
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Backend Error: " + errorText);
        return;
      }

      fetchInvoices();
      alert("Invoice deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("invoice-pdf-area");

    if (!element) {
      alert("Invoice preview not found.");
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 190;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imageData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${form.invoiceNo || "AutoHub"}.pdf`);
  };

  const totalPreview =
    Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const stock = invoices.reduce((stockData, invoice) => {
    stockData[invoice.partName] =
      (stockData[invoice.partName] || 0) + Number(invoice.quantity);
    return stockData;
  }, {});

  const totalInvoices = invoices.length;

  const totalStock = Object.values(stock).reduce(
    (sum, quantity) => sum + quantity,
    0
  );

  const totalPurchaseValue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount),
    0
  );

  return (
    <AdminLayout
      setPage={setPage}
      activePage="invoice"
      title="Purchase Invoices"
      subtitle="Create purchase invoices, update stock, and export invoice PDFs"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Total Invoices</p>
          <h3 className="text-4xl font-bold mt-3">{totalInvoices}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Purchase invoices created
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Total Stock</p>
          <h3 className="text-4xl font-bold mt-3">{totalStock}</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Current stock from purchases
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm text-neutral-500">Purchase Value</p>
          <h3 className="text-4xl font-bold mt-3">
            Rs. {totalPurchaseValue}
          </h3>
          <p className="text-xs text-neutral-500 mt-2">
            Total spending on purchases
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mt-8">
        <form
          onSubmit={saveInvoice}
          className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 space-y-8"
        >
          <div>
            <h3 className="text-2xl font-bold">
              {editingId ? "Update Purchase Invoice" : "Create Purchase Invoice"}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Record purchased parts and automatically update stock quantities.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wide">
              Invoice Details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="invoiceNo"
                value={form.invoiceNo}
                onChange={handleChange}
                placeholder="Invoice Number *"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black"
              />

              <input
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wide">
              Vendor Information
            </p>

            <input
              name="vendorName"
              value={form.vendorName}
              onChange={handleChange}
              placeholder="Vendor Name *"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wide">
              Stock Item Details
            </p>

            <input
              name="partName"
              value={form.partName}
              onChange={handleChange}
              placeholder="Part Name *"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="quantity"
                value={form.quantity}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, quantity: value });
                }}
                placeholder="Quantity *"
                className="rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black"
              />

              <input
                name="unitPrice"
                value={form.unitPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  setForm({ ...form, unitPrice: value });
                }}
                placeholder="Unit Price (Rs) *"
                className="rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black"
              />
            </div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-neutral-500">Calculated Total</p>
              <p className="text-2xl font-bold">Rs. {totalPreview}</p>
            </div>

            <p className="text-right text-xs text-neutral-500">
              Quantity × Unit Price
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wide">
              Invoice Status
            </p>

            <div className="relative">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-black appearance-none bg-white"
              >
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
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
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition"
            >
              {editingId ? "Update Invoice" : "Create Invoice"}
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

        <div className="xl:col-span-2 space-y-8">
          <div
            id="invoice-pdf-area"
            className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden"
          >
            <div className="bg-black text-white px-8 py-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">AutoHub</h3>
                <p className="text-sm text-neutral-300 mt-1">
                  Purchase Invoice
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-neutral-300">Invoice No</p>
                <p className="text-xl font-bold">{form.invoiceNo || "INV-000"}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400 font-semibold">
                    Vendor
                  </p>
                  <p className="font-bold mt-1">{form.vendorName || "-"}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-neutral-400 font-semibold">
                    Date
                  </p>
                  <p className="font-bold mt-1">{form.purchaseDate || "-"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 text-neutral-700">
                    <tr>
                      <th className="px-5 py-4 text-left">Part</th>
                      <th className="px-5 py-4 text-left">Quantity</th>
                      <th className="px-5 py-4 text-left">Unit Price</th>
                      <th className="px-5 py-4 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="px-5 py-5 font-semibold">
                        {form.partName || "-"}
                      </td>
                      <td className="px-5 py-5">{form.quantity || 0}</td>
                      <td className="px-5 py-5">Rs. {form.unitPrice || 0}</td>
                      <td className="px-5 py-5 text-right font-bold">
                        Rs. {totalPreview}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-8">
                <div className="w-64 bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-500">Subtotal</span>
                    <span>Rs. {totalPreview}</span>
                  </div>

                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-neutral-500">Tax</span>
                    <span>Rs. 0</span>
                  </div>

                  <div className="border-t border-neutral-200 pt-4 flex justify-between">
                    <span className="font-bold">Grand Total</span>
                    <span className="font-bold">Rs. {totalPreview}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-end">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400 font-semibold">
                    Status
                  </p>
                  <span
                    className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      form.status === "Received"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {form.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">Authorized By</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    AutoHub Admin
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadPDF}
            className="w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition"
          >
            Download Invoice PDF
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-xl font-bold mb-4">Stock Overview</h3>

          {Object.keys(stock).length === 0 ? (
            <p className="text-sm text-neutral-500">
              No stock records available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stock).map(([partName, quantity]) => (
                <div
                  key={partName}
                  className="flex justify-between items-center bg-neutral-50 rounded-2xl px-4 py-3"
                >
                  <span className="text-sm font-medium truncate">
                    {partName}
                  </span>
                  <span className="text-sm font-bold">{quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 bg-white rounded-3xl shadow-sm border border-neutral-200 p-7">
        <div className="mb-6">
          <h3 className="text-xl font-bold">Purchase Invoice Records</h3>
          <p className="text-sm text-neutral-500 mt-1">
            View invoice history and stock quantities added.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="w-[16%] px-5 py-4 text-left">Invoice</th>
                <th className="w-[18%] px-5 py-4 text-left">Vendor</th>
                <th className="w-[20%] px-5 py-4 text-left">Part</th>
                <th className="w-[10%] px-5 py-4 text-left">Qty</th>
                <th className="w-[14%] px-5 py-4 text-left">Total</th>
                <th className="w-[12%] px-5 py-4 text-left">Status</th>
                <th className="w-[10%] px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-14 text-center">
                    <p className="font-semibold text-neutral-700">
                      No invoices found
                    </p>
                    <p className="text-neutral-500 text-sm mt-1">
                      Create an invoice to track purchases and update stock.
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-4 align-middle">
                      <p className="font-semibold truncate">
                        {invoice.invoiceNo}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {invoice.purchaseDate?.split("T")[0] ||
                          invoice.purchaseDate}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle truncate">
                      {invoice.vendorName}
                    </td>

                    <td className="px-5 py-4 align-middle truncate">
                      {invoice.partName}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      {invoice.quantity}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      Rs. {invoice.totalAmount}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "Received"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => editInvoice(invoice)}
                          className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteInvoice(invoice.id)}
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
    </AdminLayout>
  );
}

export default PurchaseInvoicePage;