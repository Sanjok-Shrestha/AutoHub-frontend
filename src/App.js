import { useState } from "react";
import VendorPage from "./pages/VendorPage";
import StaffPage from "./pages/StaffPage";
import PurchaseInvoicePage from "./pages/PurchaseInvoicePage";

function App() {
  const [page, setPage] = useState("vendor");

  return (
    <>
      {page === "vendor" && <VendorPage setPage={setPage} />}
      {page === "staff" && <StaffPage setPage={setPage} />}
      {page === "invoice" && <PurchaseInvoicePage setPage={setPage} />}
    </>
  );
}

export default App;