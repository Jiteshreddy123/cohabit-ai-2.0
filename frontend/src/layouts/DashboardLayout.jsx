import Navbar from "../components/dashboard/Navbar";
import Sidebar from "../components/dashboard/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Page */}
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;