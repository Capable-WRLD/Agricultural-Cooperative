import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Sidebar.css";

function Sidebar({ closeSidebar }) {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [organizationName, setOrganizationName] = useState("AgroCoop");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setLoadingRole(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        setLoadingRole(false);
        return;
      }

      const data = snap.data();

      setRole(data.role || "Member");

      if (data.organizationName) {
        setOrganizationName(data.organizationName);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingRole(false);
    }
  };

  const dashboardLink = !loadingRole
    ? role === "Admin"
      ? "/admin"
      : "/member"
    : null;

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

        <h2>🌾 AgroCoop</h2>

        <h6 className="mt-2">{organizationName}</h6>

        <p>
          {loadingRole
            ? "Loading..."
            : role === "Admin"
            ? "Admin Panel"
            : "Member Panel"}
        </p>

      </div>

      <nav className="sidebar-menu">

        {dashboardLink && (
          <NavLink
            to={dashboardLink}
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            📊 Dashboard
          </NavLink>
        )}

        {role === "Admin" && (
          <NavLink
            to="/members"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            👥 Members
          </NavLink>
        )}

        <NavLink
          to={role === "Admin" ? "/admin/savings" : "/savings"}
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

        {role === "Admin" && (
          <>
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
          </>
        )}

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