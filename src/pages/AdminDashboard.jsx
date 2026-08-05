import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import { getDashboardData } from "../services/dashboardService";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardData();
      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  };

  const notifications = [
    "New member registration",
    "Loan request pending approval",
    "Inventory stock running low",
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          <Sidebar />
        </div>

        <div className="col-md-10 page-container">

          {/* Organization Information */}

          <div className="glass-card p-4 mb-4">

            <h2 className="fw-bold text-success">
              {dashboard?.organization?.organizationName || "Loading..."}
            </h2>

            <hr />

            <div className="row">

              <div className="col-md-6">

                <p>
                  <strong>Organization Code:</strong>{" "}
                  {dashboard?.organization?.organizationCode || "-"}
                </p>

                <p>
                  <strong>Administrator:</strong>{" "}
                  {dashboard?.user?.fullName || "-"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {dashboard?.user?.email || "-"}
                </p>

              </div>

              <div className="col-md-6">

                <p>
                  <strong>State:</strong>{" "}
                  {dashboard?.organization?.state || "-"}
                </p>

                <p>
                  <strong>LGA:</strong>{" "}
                  {dashboard?.organization?.lga || "-"}
                </p>

                <p>
                  <strong>Interest Rate:</strong>{" "}
                  {dashboard?.organization?.interestRate || 0}%
                </p>

              </div>

            </div>

          </div>

          {/* Statistics */}

          <div className="row g-4">

            <div className="col-md-3">
              <StatsCard
                title="Members"
                value="1"
                icon="bi-people-fill"
              />
            </div>

            <div className="col-md-3">
              <StatsCard
                title="Savings"
                value="₦0"
                icon="bi-wallet2"
              />
            </div>

            <div className="col-md-3">
              <StatsCard
                title="Loans"
                value="0"
                icon="bi-cash-stack"
              />
            </div>

            <div className="col-md-3">
              <StatsCard
                title="Inventory"
                value="0"
                icon="bi-box-seam"
              />
            </div>

          </div>

          {/* Recent Transactions */}

          <div className="glass-card p-4 mt-5">

            <h4 className="mb-3">
              Recent Transactions
            </h4>

            <p className="text-muted">
              No transactions yet.
            </p>

          </div>

          {/* Notifications */}

          <div className="glass-card p-4 mt-4">

            <h4 className="mb-3">
              Notifications
            </h4>

            {notifications.map((item, index) => (
              <div
                key={index}
                className="alert alert-success"
              >
                {item}
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;