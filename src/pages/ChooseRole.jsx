import { useNavigate } from "react-router-dom";
import "./ChooseRole.css";

function ChooseRole() {
  const navigate = useNavigate();

  return (
    <div className="choose-role-page">

      <div className="overlay"></div>

      <div className="floating-leaf leaf1">🌿</div>
      <div className="floating-leaf leaf2">🍃</div>
      <div className="floating-leaf leaf3">🌾</div>

      <div className="choose-container">

        <div className="welcome-section">

          <span className="verified-badge">
            ✅ Email Verified Successfully
          </span>

          <h1>
            Welcome to <span>AgroCoop</span>
          </h1>

          <p>
            You are now one step away from managing your agricultural
            cooperative digitally.
          </p>

        </div>

        <div className="role-cards">

          <div className="role-card">

            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt=""
            />

            <h2>Register Organization</h2>

            <p>
              Create a new cooperative and become its administrator.
            </p>

            <ul>

              <li>✔ Create Cooperative</li>

              <li>✔ Generate Organization Code</li>

              <li>✔ Approve Members</li>

              <li>✔ Manage Savings</li>

              <li>✔ Manage Loans</li>

            </ul>

            <button
              onClick={() => navigate("/create-organization")}
            >
              Register Organization →
            </button>

          </div>

          <div className="role-card">

            <img
              src="https://cdn-icons-png.flaticon.com/512/4140/4140037.png"
              alt=""
            />

            <h2>Join Organization</h2>

            <p>
              Already have an organization code?
              Send a request to join your cooperative.
            </p>

            <ul>

              <li>✔ Search Organization</li>

              <li>✔ Send Request</li>

              <li>✔ Wait for Approval</li>

              <li>✔ Become Member</li>

            </ul>

            <button
              className="outline"
              onClick={() => navigate("/join-organization")}
            >
              Join Organization →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ChooseRole;