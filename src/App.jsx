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
import LoansPage from "./pages/LoansPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Email Verification */}
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* After Verification */}
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route
          path="/create-organization"
          element={<CreateOrganization />}
        />
        <Route
          path="/join-organization"
          element={<JoinOrganization />}
        />

        {/* Dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member" element={<MemberDashboard />} />

        {/* Admin Pages */}
        <Route path="/members" element={<MembersPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

    </BrowserRouter>
  );
}

export default App;