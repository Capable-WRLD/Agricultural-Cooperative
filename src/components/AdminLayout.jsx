import { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/AdminLayout.css";

function AdminLayout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (

    <div className="admin-layout">

      {/* Mobile Header */}

      <header className="mobile-header">

        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <h3>🌾 AgroCoop</h3>

      </header>

      {/* Overlay */}

      {sidebarOpen && (

        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />

      )}

      {/* Sidebar */}

      <div
        className={`sidebar-container ${
          sidebarOpen ? "open" : ""
        }`}
      >

        <Sidebar closeSidebar={() => setSidebarOpen(false)} />

      </div>

      {/* Main Content */}

      <main className="admin-content">

        {children}

      </main>

    </div>

  );
}

export default AdminLayout;