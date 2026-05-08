import { useState } from "react";
import VendorPage from "./pages/VendorPage";
import StaffPage from "./pages/StaffPage";
import PurchaseInvoicePage from "./pages/PurchaseInvoicePage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  const [page, setPage] = useState("vendor");

  return (
    <>
      {page === "vendor" && <VendorPage setPage={setPage} />}
      {page === "staff" && <StaffPage setPage={setPage} />}
      {page === "invoice" && <PurchaseInvoicePage setPage={setPage} />}
      {page === "reports" && <ReportsPage setPage={setPage} />}
    </>
  );
}

export default App;