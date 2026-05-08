import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import jsPDF from "jspdf";

const API_URL = "http://localhost:5274/api/reports/financial";

function ReportsPage({ setPage }) {
  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [vendorSpend, setVendorSpend] = useState({});
  const [stock, setStock] = useState({});

  const [totalPurchaseSpend, setTotalPurchaseSpend] = useState(0);
  const [averageInvoiceValue, setAverageInvoiceValue] = useState(0);
  const [highestPurchaseInvoice, setHighestPurchaseInvoice] = useState(0);
  const [topVendorBySpend, setTopVendorBySpend] = useState(["-", 0]);
  const [totalQuantityPurchased, setTotalQuantityPurchased] = useState(0);
  const [stockValue, setStockValue] = useState(0);

  const today = new Date();

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toISOString().split("T")[0];
  };

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const getReportRange = () => {
    if (startDate && endDate) {
      return { from: startDate, to: endDate };
    }

    const now = new Date();
    let from = new Date();

    if (period === "daily") {
      from = now;
    } else if (period === "weekly") {
      from.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "yearly") {
      from = new Date(now.getFullYear(), 0, 1);
    }

    return {
      from: formatDate(from),
      to: formatDate(now),
    };
  };

  const reportRange = getReportRange();

  const fetchReports = async () => {
    try {
      let url = `${API_URL}?period=${period}`;

      if (startDate && endDate) {
        url = `${API_URL}?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        alert("Backend Error: " + errorText);
        return;
      }

      const data = await response.json();

      setFilteredInvoices(data.invoices || []);
      setTotalPurchaseSpend(data.totalPurchaseSpend || 0);
      setAverageInvoiceValue(data.averageInvoiceValue || 0);
      setHighestPurchaseInvoice(data.highestPurchaseInvoice || 0);
      setTopVendorBySpend([
        data.topVendorName || "-",
        data.topVendorSpend || 0,
      ]);
      setTotalQuantityPurchased(data.totalQuantityPurchased || 0);
      setStockValue(data.stockValue || 0);

      const vendorObject = {};
      data.vendorSpendBreakdown?.forEach((vendor) => {
        vendorObject[vendor.vendorName] = vendor.amount;
      });
      setVendorSpend(vendorObject);

      const stockObject = {};
      data.invoices?.forEach((invoice) => {
        stockObject[invoice.partName] =
          (stockObject[invoice.partName] || 0) + invoice.quantity;
      });
      setStock(stockObject);
    } catch (error) {
      console.error(error);
      alert("Cannot connect to backend.");
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startDate, endDate]);

  const addSectionTitle = (pdf, title, y) => {
    pdf.setFillColor(245, 245, 245);
    pdf.rect(14, y - 6, 182, 10, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(20, 20, 20);
    pdf.text(title, 18, y);
  };

  const addKeyValue = (pdf, label, value, x, y) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(label, x, y);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(20, 20, 20);
    pdf.text(String(value), x, y + 6);
  };

  const checkPageBreak = (pdf, y) => {
    if (y > 270) {
      pdf.addPage();
      return 20;
    }
    return y;
  };

  const downloadReportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    let y = 18;

    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, 32, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("AutoHub Financial Report", 14, 14);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Purchase, inventory investment, and vendor performance analysis", 14, 22);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`Generated: ${formatDate(today)}`, 150, 14);
    pdf.text(`Records: ${filteredInvoices.length}`, 150, 22);

    y = 45;

    addSectionTitle(pdf, "Report Information", y);
    y += 10;

    addKeyValue(pdf, "Report Type", period.toUpperCase(), 18, y);
    addKeyValue(pdf, "From Date", reportRange.from, 65, y);
    addKeyValue(pdf, "To Date", reportRange.to, 110, y);
    addKeyValue(pdf, "Prepared By", "AutoHub Admin", 150, y);

    y += 22;

    addSectionTitle(pdf, "Executive Summary", y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);

    const summaryText =
      "This report provides a financial overview of purchase activity for the selected period. It includes total purchase spending, invoice performance, vendor spend analysis, quantity purchased, and inventory investment. The figures are generated from purchase invoice records stored in the AutoHub system database.";

    const summaryLines = pdf.splitTextToSize(summaryText, 178);
    pdf.text(summaryLines, 18, y);
    y += summaryLines.length * 5 + 8;

    addSectionTitle(pdf, "Key Financial Indicators", y);
    y += 11;

    pdf.setDrawColor(220, 220, 220);
    pdf.setFillColor(250, 250, 250);
    pdf.rect(14, y - 6, 86, 22, "F");
    pdf.rect(110, y - 6, 86, 22, "F");
    addKeyValue(pdf, "Total Purchase Spend", formatMoney(totalPurchaseSpend), 18, y);
    addKeyValue(pdf, "Average Invoice Value", formatMoney(averageInvoiceValue), 114, y);

    y += 28;

    pdf.setFillColor(250, 250, 250);
    pdf.rect(14, y - 6, 86, 22, "F");
    pdf.rect(110, y - 6, 86, 22, "F");
    addKeyValue(pdf, "Highest Purchase", formatMoney(highestPurchaseInvoice), 18, y);
    addKeyValue(pdf, "Top Vendor by Spend", `${topVendorBySpend[0]} (${formatMoney(topVendorBySpend[1])})`, 114, y);

    y += 30;

    addSectionTitle(pdf, "Inventory and Purchase Performance", y);
    y += 11;

    pdf.setFillColor(250, 250, 250);
    pdf.rect(14, y - 6, 56, 22, "F");
    pdf.rect(77, y - 6, 56, 22, "F");
    pdf.rect(140, y - 6, 56, 22, "F");

    addKeyValue(pdf, "Quantity Purchased", totalQuantityPurchased, 18, y);
    addKeyValue(pdf, "Inventory Investment", formatMoney(stockValue), 81, y);
    addKeyValue(pdf, "Stock Items Tracked", Object.keys(stock).length, 144, y);

    y += 30;

    addSectionTitle(pdf, "Vendor Spend Analysis", y);
    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(0, 0, 0);
    pdf.rect(14, y - 6, 182, 9, "F");
    pdf.text("Vendor Name", 18, y);
    pdf.text("Total Spend", 150, y);

    y += 8;

    pdf.setTextColor(30, 30, 30);
    pdf.setFont("helvetica", "normal");

    if (Object.keys(vendorSpend).length === 0) {
      pdf.text("No vendor spending data available.", 18, y);
      y += 8;
    } else {
      Object.entries(vendorSpend).forEach(([vendor, amount]) => {
        y = checkPageBreak(pdf, y);
        pdf.setDrawColor(230, 230, 230);
        pdf.line(14, y + 2, 196, y + 2);
        pdf.text(String(vendor), 18, y);
        pdf.text(formatMoney(amount), 150, y);
        y += 8;
      });
    }

    y += 8;
    y = checkPageBreak(pdf, y);

    addSectionTitle(pdf, "Detailed Purchase Records", y);
    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(0, 0, 0);
    pdf.rect(14, y - 6, 182, 9, "F");

    pdf.text("Invoice", 17, y);
    pdf.text("Vendor", 42, y);
    pdf.text("Part", 86, y);
    pdf.text("Qty", 123, y);
    pdf.text("Total", 140, y);
    pdf.text("Date", 170, y);

    y += 8;

    pdf.setTextColor(40, 40, 40);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    if (filteredInvoices.length === 0) {
      pdf.text("No invoice records available for this period.", 18, y);
      y += 8;
    } else {
      filteredInvoices.forEach((invoice) => {
        y = checkPageBreak(pdf, y);

        const vendorName =
          invoice.vendorName.length > 20
            ? invoice.vendorName.substring(0, 20) + "..."
            : invoice.vendorName;

        const partName =
          invoice.partName.length > 18
            ? invoice.partName.substring(0, 18) + "..."
            : invoice.partName;

        pdf.setDrawColor(230, 230, 230);
        pdf.line(14, y + 2, 196, y + 2);

        pdf.text(String(invoice.invoiceNo), 17, y);
        pdf.text(vendorName, 42, y);
        pdf.text(partName, 86, y);
        pdf.text(String(invoice.quantity), 123, y);
        pdf.text(formatMoney(invoice.totalAmount), 140, y);
        pdf.text(formatDate(invoice.purchaseDate), 170, y);

        y += 8;
      });
    }

    y += 10;
    y = checkPageBreak(pdf, y);

    addSectionTitle(pdf, "Business Recommendation", y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);

    const recommendation =
      totalPurchaseSpend > 0
        ? `The system shows active purchase spending during this period. The highest vendor spend is from ${topVendorBySpend[0]}. Management should review vendor pricing, compare supplier costs, and monitor high-value purchases to improve cost control.`
        : "No purchase spending was recorded for this period. Management should ensure purchase invoices are entered regularly for accurate reporting.";

    const recommendationLines = pdf.splitTextToSize(recommendation, 178);
    pdf.text(recommendationLines, 18, y);

    y += recommendationLines.length * 5 + 12;

    pdf.setDrawColor(200, 200, 200);
    pdf.line(14, 282, 196, 282);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Generated by AutoHub Vehicle Parts Management System", 14, 288);
    pdf.text("Prepared for internal administrative review", 132, 288);

    pdf.save(`AutoHub-${period}-Financial-Report.pdf`);
  };

  return (
    <AdminLayout
      setPage={setPage}
      activePage="reports"
      title="Financial Reports"
      subtitle="Generate, view, filter, and export financial reports"
    >
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-7 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Generate Financial Report</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Select a report period to generate purchase, stock, and vendor performance insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500">
                Report Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none"
              />
            </div>

            <button
              onClick={downloadReportPDF}
              className="bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div id="financial-report-area" className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-black text-white px-8 py-7 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">AutoHub Financial Report</h2>
            <p className="text-sm text-neutral-300 mt-2">
              Purchase, inventory investment, and vendor performance analysis
            </p>
          </div>

          <div className="text-right text-sm">
            <p className="text-neutral-300">Generated On</p>
            <p className="font-bold">{formatDate(today)}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-neutral-50 border border-neutral-200 rounded-3xl p-5">
            <div>
              <p className="text-xs text-neutral-500 uppercase font-semibold">Report Type</p>
              <p className="font-bold mt-1">{period.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-semibold">From Date</p>
              <p className="font-bold mt-1">{reportRange.from}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-semibold">To Date</p>
              <p className="font-bold mt-1">{reportRange.to}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-semibold">Total Records</p>
              <p className="font-bold mt-1">{filteredInvoices.length}</p>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-3xl p-6">
            <h3 className="text-xl font-bold">Executive Summary</h3>
            <p className="text-sm text-neutral-600 mt-3 leading-6">
              This report summarizes AutoHub&apos;s purchase activity for the selected period.
              It highlights purchase spending, vendor-wise performance, stock quantity,
              and inventory investment based on purchase invoice records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200">
              <p className="text-sm text-neutral-500">Total Purchase Spend</p>
              <h3 className="text-3xl font-bold mt-3">Rs. {totalPurchaseSpend}</h3>
              <p className="text-xs text-neutral-500 mt-2">Total cost of purchased parts</p>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200">
              <p className="text-sm text-neutral-500">Average Invoice Value</p>
              <h3 className="text-3xl font-bold mt-3">Rs. {averageInvoiceValue}</h3>
              <p className="text-xs text-neutral-500 mt-2">Average cost per invoice</p>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200">
              <p className="text-sm text-neutral-500">Highest Purchase</p>
              <h3 className="text-3xl font-bold mt-3">Rs. {highestPurchaseInvoice}</h3>
              <p className="text-xs text-neutral-500 mt-2">Largest invoice amount</p>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200">
              <p className="text-sm text-neutral-500">Top Vendor</p>
              <h3 className="text-2xl font-bold mt-3 truncate">{topVendorBySpend[0]}</h3>
              <p className="text-xs text-neutral-500 mt-2">
                Rs. {topVendorBySpend[1]} total spend
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 border border-neutral-200 rounded-3xl p-7">
              <h3 className="text-xl font-bold">Purchase Performance Summary</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-neutral-50 rounded-2xl p-5">
                  <p className="text-sm text-neutral-500">Quantity Purchased</p>
                  <h4 className="text-2xl font-bold mt-2">{totalQuantityPurchased}</h4>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-5">
                  <p className="text-sm text-neutral-500">Inventory Investment</p>
                  <h4 className="text-2xl font-bold mt-2">Rs. {stockValue}</h4>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-5">
                  <p className="text-sm text-neutral-500">Stock Items Tracked</p>
                  <h4 className="text-2xl font-bold mt-2">{Object.keys(stock).length}</h4>
                </div>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-3xl p-7">
              <h3 className="text-xl font-bold mb-4">Business Insights</h3>

              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-2xl p-4">
                  <p className="text-sm text-neutral-500">Financial Status</p>
                  <p className="font-semibold mt-1">
                    {totalPurchaseSpend > 0
                      ? "Purchase activity recorded"
                      : "No spending recorded"}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4">
                  <p className="text-sm text-neutral-500">Vendor Insight</p>
                  <p className="font-semibold mt-1">
                    {topVendorBySpend[0] !== "-"
                      ? `${topVendorBySpend[0]} has the highest spend`
                      : "No vendor data available"}
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4">
                  <p className="text-sm text-neutral-500">Recommendation</p>
                  <p className="font-semibold mt-1">
                    Review high-value purchases and compare vendor pricing regularly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="border border-neutral-200 rounded-3xl p-7">
              <h3 className="text-xl font-bold mb-4">Vendor Spend Analysis</h3>

              {Object.keys(vendorSpend).length === 0 ? (
                <p className="text-sm text-neutral-500">No vendor spending data available.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(vendorSpend).map(([vendor, amount]) => (
                    <div
                      key={vendor}
                      className="flex justify-between items-center bg-neutral-50 rounded-2xl px-4 py-3"
                    >
                      <span className="text-sm font-medium truncate">{vendor}</span>
                      <span className="text-sm font-bold">Rs. {amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="xl:col-span-2 border border-neutral-200 rounded-3xl p-7">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Detailed Purchase Records</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Invoice-level purchase records used for this financial report.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="w-[16%] px-5 py-4 text-left">Invoice</th>
                      <th className="w-[20%] px-5 py-4 text-left">Vendor</th>
                      <th className="w-[20%] px-5 py-4 text-left">Part</th>
                      <th className="w-[10%] px-5 py-4 text-left">Qty</th>
                      <th className="w-[16%] px-5 py-4 text-left">Total</th>
                      <th className="w-[18%] px-5 py-4 text-left">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-5 py-14 text-center">
                          <p className="font-semibold text-neutral-700">
                            No financial report data found
                          </p>
                          <p className="text-neutral-500 text-sm mt-1">
                            Create purchase invoices or adjust the report period.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-neutral-50">
                          <td className="px-5 py-4 font-semibold truncate">
                            {invoice.invoiceNo}
                          </td>
                          <td className="px-5 py-4 truncate">{invoice.vendorName}</td>
                          <td className="px-5 py-4 truncate">{invoice.partName}</td>
                          <td className="px-5 py-4">{invoice.quantity}</td>
                          <td className="px-5 py-4 font-semibold">
                            Rs. {invoice.totalAmount}
                          </td>
                          <td className="px-5 py-4">
                            {invoice.purchaseDate?.split("T")[0] || invoice.purchaseDate}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-5 text-xs text-neutral-500 flex justify-between">
            <p>Generated by AutoHub Vehicle Parts Management System</p>
            <p>Prepared for internal administrative review</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ReportsPage;