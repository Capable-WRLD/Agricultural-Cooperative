import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ensureUserProfile } from "../services/userService";
import {
  createOrganization,
  generateOrganizationCode,
  updateUserOrganization,
} from "../services/organizationService";
import "../styles/CreateOrganization.css";
import { toast } from "react-toastify";

function CreateOrganization() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [address, setAddress] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions while the first request is running.
    if (loading) return;

    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error("No logged in user found.");
        return;
      }

      /*
       * Make sure the Firestore user profile exists before anything
       * attempts to update users/{uid}.
       */
      await ensureUserProfile(currentUser);

      const organizationCode =
        generateOrganizationCode(organizationName);

      const organizationData = {
        organizationName: organizationName.trim(),
        organizationCode,
        organizationType,
        phone: phone.trim(),
        email: email.trim(),
        state: state.trim(),
        lga: lga.trim(),
        address: address.trim(),
        interestRate: Number(interestRate),
        adminUID: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      // Create the organization first.
      const organizationId =
        await createOrganization(organizationData);

      /*
       * Link the authenticated user to the newly created organization.
       * This must happen after the organization has been created.
       */
      await updateUserOrganization(currentUser, {
        organizationId,
        organizationName: organizationName.trim(),
        organizationCode,
        role: "Admin",
        status: "Active",
      });

      /*
       * Refresh AuthContext so ProtectedRoute/AdminDashboard sees
       * the new organizationId and role immediately.
       */
      await refreshUser();

      toast.success("Organization created successfully!");

      /*
       * Give the auth/user state a moment to settle before navigating.
       * This prevents ProtectedRoute from reading the old user state.
       */
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 100);

    } catch (error) {
      console.error("Organization creation error:", error);

      toast.error(
        error?.message ||
          "Unable to create organization. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-org-page">
      <div className="create-org-container">
        <div className="org-left">
          <span className="org-badge">🌾 AgroCoop</span>

          <h1>Register Your Organization</h1>

          <p>
            Create your agricultural cooperative and become the
            administrator.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Organization Name"
              value={organizationName}
              onChange={(e) =>
                setOrganizationName(e.target.value)
              }
              required
              disabled={loading}
            />

            <select
              value={organizationType}
              onChange={(e) =>
                setOrganizationType(e.target.value)
              }
              required
              disabled={loading}
            >
              <option value="">
                Select Cooperative Type
              </option>

              <option>Farmers Cooperative</option>
              <option>Livestock Cooperative</option>
              <option>Fishery Cooperative</option>
              <option>Multipurpose Cooperative</option>
            </select>

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="email"
              placeholder="Organization Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="text"
              placeholder="Local Government Area"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              required
              disabled={loading}
            />

            <textarea
              placeholder="Organization Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />

            <input
              type="number"
              placeholder="Loan Interest Rate (%)"
              value={interestRate}
              onChange={(e) =>
                setInterestRate(e.target.value)
              }
              required
              min="0"
              step="0.01"
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Creating..."
                : "Register Organization"}
            </button>
          </form>
        </div>

        <div className="org-right">
          <div className="illustration">
            🌾🏢

            <h2>Grow Together</h2>

            <p>
              Manage your members, savings, loans, inventory and
              reports in one platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrganization;