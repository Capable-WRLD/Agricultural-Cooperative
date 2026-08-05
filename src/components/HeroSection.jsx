import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">

      <div className="container">

        <div className="hero-wrapper">

          <div className="hero-left">

            <div className="hero-badge">
              🌾 Smart Agricultural Technology
            </div>

            <h1 className="hero-title">
              Transforming
              <span className="text-success"> Agricultural </span>
              Cooperatives Through
              <span className="text-success"> Smart Technology</span>
            </h1>

            <p className="hero-description">
              Welcome to the modern ecosystem built for Nigerian
              farmers and cooperative administrators. Manage
              savings, loans, inventory and financial records
              through one secure platform.
            </p>

            <div className="hero-buttons">

              <Link
                to="/register"
                className="btn btn-success btn-lg"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                className="btn btn-outline-success btn-lg"
              >
                Login
              </Link>

            </div>

            <div className="hero-stats">

              <div>
                <h2>250+</h2>
                <p>Members</p>
              </div>

              <div>
                <h2>₦5M</h2>
                <p>Savings</p>
              </div>

              <div>
                <h2>120</h2>
                <p>Loans</p>
              </div>

            </div>

          </div>

          <div className="hero-right">

            <div className="dashboard-card">

              <h3 className="text-success mb-4">
                Cooperative Overview
              </h3>

              <div className="dashboard-grid">

                <div className="dashboard-box">
                  <h2>250</h2>
                  <span>Members</span>
                </div>

                <div className="dashboard-box">
                  <h2>₦5M</h2>
                  <span>Savings</span>
                </div>

                <div className="dashboard-box">
                  <h2>120</h2>
                  <span>Loans</span>
                </div>

                <div className="dashboard-box">
                  <h2>85</h2>
                  <span>Inventory</span>
                </div>

              </div>

              <div className="activity-box">
                <h5>Recent Activity</h5>

                <p>✅ New Member Registered</p>

                <p>💰 Loan Approved</p>

                <p>🌾 Inventory Updated</p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default HeroSection;