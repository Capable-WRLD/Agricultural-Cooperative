import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createOrganization,
  generateOrganizationCode,
  updateUserOrganization,
} from "../services/organizationService";
import "../styles/CreateOrganization.css";
import { toast } from "react-toastify";

function CreateOrganization() {
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error("No logged in user found.");
        setLoading(false);
        return;
      }

      const organizationCode = generateOrganizationCode(organizationName);

      const organizationData = {
        organizationName,
        organizationCode,
        organizationType,
        phone,
        email,
        state,
        lga,
        address,
        interestRate: Number(interestRate),
        adminUID: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      const organizationId = await createOrganization(organizationData);

      await updateUserOrganization(currentUser.uid, {
        organizationId,
        organizationName,
        organizationCode,
        role: "Admin",
        status: "Active",
      });

      toast.success("Organization created successfully!");
      navigate("/admin");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
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
          <p>Create your agricultural cooperative and become the administrator.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
            />
            <select
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
              required
            >
              <option value="">Select Cooperative Type</option>
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
            />
            <input
              type="email"
              placeholder="Organization Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Local Government Area"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              required
            />
            <textarea
              placeholder="Organization Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Loan Interest Rate (%)"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register Organization"}
            </button>
          </form>
        </div>
        <div className="org-right">
          <div className="illustration">
            🌾🏢
            <h2>Grow Together</h2>
            <p>Manage your members, savings, loans, inventory and reports in one platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrganization;