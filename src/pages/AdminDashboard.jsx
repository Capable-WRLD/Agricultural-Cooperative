import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import StatsCard from "../components/StatsCard";
import { getDashboardData } from "../services/dashboardService";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);

  // Organization total approved savings
  const [savings, setSavings] = useState(null);

  const [loanCount, setLoanCount] = useState(0);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // LISTEN TO ORGANIZATION MEMBERS
  // ============================================================

  useEffect(() => {
    if (!dashboard) return;

    const orgId =
      dashboard?.organization?.id ||
      dashboard?.organizationId ||
      dashboard?.organization?.organizationId;

    if (!orgId) return;

    const membersRef = collection(
      db,
      "organizations",
      orgId,
      "members"
    );

    const unsubscribe = onSnapshot(
      membersRef,
      (snapshot) => {
        const membersData = snapshot.docs.map((memberDoc) => ({
          id: memberDoc.id,
          ...memberDoc.data(),
        }));

        setApprovedMembers(membersData);

        setTotalMembers(membersData.length);

        setActiveMembers(
          membersData.filter(
            (member) => member.status === "Active"
          ).length
        );
      },
      (error) => {
        console.error(
          "Error listening for member updates:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [dashboard]);

  // ============================================================
  // LISTEN TO ORGANIZATION SAVINGS
  // ============================================================

  useEffect(() => {
    if (!dashboard) return;

    const orgId =
      dashboard?.organization?.id ||
      dashboard?.organizationId ||
      dashboard?.organization?.organizationId;

    if (!orgId) return;

    const savingsRef = collection(
      db,
      "organizations",
      orgId,
      "savings"
    );

    const unsubscribe = onSnapshot(
      savingsRef,
      (snapshot) => {
        let totalApproved = 0;

        snapshot.forEach((savingsDoc) => {
          const savingsData = savingsDoc.data();

          // ONLY approved payments count toward
          // organization total savings.
          if (savingsData.status === "Approved") {
            totalApproved += Number(
              savingsData.amount || 0
            );
          }
        });

        setSavings(totalApproved);
      },
      (error) => {
        console.error(
          "Error listening to organization savings:",
          error
        );

        setSavings(0);
      }
    );

    return () => unsubscribe();
  }, [dashboard]);

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  const loadDashboard = async () => {
    try {
      const data = await getDashboardData();

      setDashboard(data);

      setLoanCount(
        Array.isArray(data.loans)
          ? data.loans.length
          : 0
      );
    } catch (error) {
      console.error(
        "Error loading dashboard:",
        error
      );
    }
  };

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const notifications = [
    "New member registration",
    "Loan request pending approval",
    "Inventory stock running low",
  ];

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 page-container">

          {/* =====================================================
              ORGANIZATION INFORMATION
          ===================================================== */}

          <div className="glass-card p-4 mb-4">

            <h2 className="fw-bold text-success">
              {dashboard?.organization?.organizationName ||
                "Loading..."}
            </h2>

            <hr />

            <div className="row">

              <div className="col-md-6">

                <p>
                  <strong>Organization Code:</strong>{" "}
                  {dashboard?.organization?.organizationCode ||
                    "-"}
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
                  {dashboard?.organization?.interestRate ||
                    0}
                  %
                </p>

              </div>

            </div>

          </div>

          {/* =====================================================
              STATISTICS
          ===================================================== */}

          <div className="row g-4">

            {/* MEMBERS */}

            <div className="col-md-3">
              <StatsCard
                title="Members"
                value={totalMembers}
                icon="bi-people-fill"
              />
            </div>

            {/* TOTAL ORGANIZATION SAVINGS */}

            <div className="col-md-3">
              <StatsCard
                title="Savings"
                value={
                  savings !== null
                    ? `₦${Number(
                        savings
                      ).toLocaleString()}`
                    : "Loading..."
                }
                icon="bi-wallet2"
              />
            </div>

            {/* LOANS */}

            <div className="col-md-3">
              <StatsCard
                title="Loans"
                value={loanCount}
                icon="bi-cash-stack"
              />
            </div>

            {/* INVENTORY */}

            <div className="col-md-3">
              <StatsCard
                title="Inventory"
                value="0"
                icon="bi-box-seam"
              />
            </div>

          </div>

          {/* =====================================================
              RECENT TRANSACTIONS
          ===================================================== */}

          <div className="glass-card p-4 mt-5">

            <h4 className="mb-3">
              Recent Transactions
            </h4>

            <p className="text-muted">
              No transactions yet.
            </p>

          </div>

          {/* =====================================================
              NOTIFICATIONS
          ===================================================== */}

          <div className="glass-card p-4 mt-4">

            <h4 className="mb-3">
              Notifications
            </h4>

            {notifications.map((item, index) => (
              <div
                key={index}
                className="alert alert-success text-white"
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