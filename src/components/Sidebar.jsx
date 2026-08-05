import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar({ closeSidebar }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

        <h2>🌾 AgroCoop</h2>

        <p>Admin Panel</p>

      </div>

      <nav className="sidebar-menu">

        <NavLink
          to="/admin"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/members"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👥 Members
        </NavLink>

        <NavLink
          to="/savings"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          💰 Savings
        </NavLink>

        <NavLink
          to="/loans"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          🏦 Loans
        </NavLink>

        <NavLink
          to="/inventory"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📦 Inventory
        </NavLink>

        <NavLink
          to="/reports"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📈 Reports
        </NavLink>

        <NavLink
          to="/settings"
          onClick={closeSidebar}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          ⚙ Settings
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;