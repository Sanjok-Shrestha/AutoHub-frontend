function AdminLayout({ children, setPage, activePage, title, subtitle }) {
  const menuItems = [
    { id: "vendor", label: "Vendor Management" },
    { id: "staff", label: "Staff & Roles" },
    { id: "invoice", label: "Purchase Invoices" },
    { id: "reports", label: "Financial Reports" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 bg-black text-white p-6 flex-col">
          <div className="mb-10">
            <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl mb-4">
              VMS
            </div>

            <h1 className="text-2xl font-bold">VMS</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Admin System
            </p>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl cursor-pointer transition ${
                  activePage === item.id
                    ? "bg-white text-black font-semibold"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
            <p className="text-xs text-neutral-400">Logged in as</p>
            <p className="font-semibold mt-1">Admin Sadiksha</p>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-neutral-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
            <div>
              <p className="text-sm text-neutral-500">Admin / {title}</p>
              <h2 className="text-2xl font-bold mt-1">{title}</h2>
              {subtitle && (
                <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-semibold">Sadiksha</p>
                <p className="text-sm text-neutral-500">System Admin</p>
              </div>

              <div className="h-11 w-11 rounded-full bg-black text-white flex items-center justify-center font-bold">
                S
              </div>
            </div>
          </header>

          <section className="flex-1 p-8">{children}</section>

          <footer className="bg-white border-t border-neutral-200 px-8 py-4 text-sm text-neutral-500">
            © 2026 VMS Admin System
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;