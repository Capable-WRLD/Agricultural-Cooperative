import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import ChooseRole from "./pages/ChooseRole";
import CreateOrganization from "./pages/CreateOrganization";
import JoinOrganization from "./pages/JoinOrganization";

import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import MembersPage from "./pages/MembersPage";
import SavingsPage from "./pages/SavingsPage";
import AdminSavings from "./pages/AdminSavings";
import LoansPage from "./pages/LoansPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";

import SettingsRouter from "./components/SettingsRouter";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              PUBLIC
          ========================= */}

          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          {/* =========================
              ACCOUNT SETUP
          ========================= */}

          <Route
            path="/choose-role"
            element={
              <ProtectedRoute>
                <ChooseRole />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-organization"
            element={
              <ProtectedRoute>
                <CreateOrganization />
              </ProtectedRoute>
            }
          />

          <Route
            path="/join-organization"
            element={
              <ProtectedRoute>
                <JoinOrganization />
              </ProtectedRoute>
            }
          />

          {/* =========================
              ADMIN DASHBOARD
          ========================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* =========================
              MEMBER DASHBOARD
          ========================= */}

          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={["Member"]}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================
              ADMIN MEMBERS
          ========================= */}

          <Route
            path="/members"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout>
                  <MembersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* =========================
              MEMBER SAVINGS
          ========================= */}

          <Route
            path="/savings"
            element={
              <ProtectedRoute allowedRoles={["Member"]}>
                <SavingsPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              ADMIN SAVINGS
          ========================= */}

          <Route
            path="/admin/savings"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout>
                  <AdminSavings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* =========================
              LOANS
              ADMIN + MEMBER
          ========================= */}

          <Route
            path="/loans"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Member"]}>
                <LoansPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              INVENTORY
              ADMIN ONLY
          ========================= */}

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout>
                  <InventoryPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* =========================
              REPORTS
              ADMIN ONLY
          ========================= */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout>
                  <ReportsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* =========================
              SETTINGS
              ADMIN + MEMBER
          ========================= */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Member"]}>
                <SettingsRouter />
              </ProtectedRoute>
            }
          />

          {/* =========================
              FALLBACK
          ========================= */}

          <Route
            path="*"
            element={<LandingPage />}
          />

        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;