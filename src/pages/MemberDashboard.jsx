import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import Sidebar from "../components/Sidebar";
import { doc, getDoc } from "firebase/firestore";
import {
  listenToMemberSavings,
  getMemberApprovedTotal,
} from "../services/savingsService";
import { listenToMemberLoans } from "../services/loanService";

import "../styles/MemberDashboard.css";

function MemberDashboard() {
  const [loading, setLoading] = useState(true);

  const [member, setMember] = useState({
    fullName: "",
    organizationName: "",
    organizationCode: "",
    email: "",
    phone: "",
  });

  const [approvedTotal, setApprovedTotal] = useState(0);
  const [memberLoans, setMemberLoans] = useState([]);

  useEffect(() => {
    let unsubscribeSavings = null;
    let unsubscribeLoans = null;

    const loadMemberDashboard = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        setMember({
          fullName: userData.fullName || "Member",
          organizationName:
            userData.organizationName || "No Organization",
          organizationCode: userData.organizationCode || "",
          email: userData.email || user.email || "",
          phone: userData.phone || "",
        });

        if (userData.organizationId) {
          const total = await getMemberApprovedTotal({
            organizationId: userData.organizationId,
            memberUid: user.uid,
          });

          setApprovedTotal(total);

          unsubscribeSavings = listenToMemberSavings({
            organizationId: userData.organizationId,
            memberUid: user.uid,
            callback: (items) => {
              const approved = items
                .filter((item) => item.status === "Approved")
                .reduce(
                  (sum, item) => sum + Number(item.amount || 0),
                  0
                );

              setApprovedTotal(approved);
            },
          });

          unsubscribeLoans = listenToMemberLoans({
            organizationId: userData.organizationId,
            memberUid: user.uid,
            callback: setMemberLoans,
          });
        }
      } catch (error) {
        console.error("Member dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMemberDashboard();

    return () => {
      if (typeof unsubscribeSavings === "function") {
        unsubscribeSavings();
      }
      if (typeof unsubscribeLoans === "function") {
        unsubscribeLoans();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="member-dashboard-loading">
        <div className="member-loading-spinner"></div>
        <h3>Loading your dashboard...</h3>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  const activeLoans = memberLoans.filter(
    (loan) => loan.status === "Approved" && Number(loan.remainingBalance || 0) > 0
  );
  const outstandingBalance = activeLoans.reduce(
    (total, loan) => total + Number(loan.remainingBalance || 0),
    0
  );

  return (
    <div className="member-dashboard">
      <Sidebar />

      <main className="member-dashboard-content">
        {/* HEADER */}
        <section className="member-dashboard-header">
          <div>
            <span className="member-section-label">
              MEMBER DASHBOARD
            </span>

            <h1>
              Welcome back,{" "}
              <span>{member.fullName}</span>
            </h1>

            <p>
              Here's an overview of your cooperative activities
              and financial information.
            </p>
          </div>
        </section>

        {/* ORGANIZATION */}
        <section className="member-organization-card">
          <div className="organization-icon">🌾</div>

          <div className="organization-info">
            <span>YOUR COOPERATIVE ORGANIZATION</span>

            <h2>{member.organizationName}</h2>

            {member.organizationCode && (
              <p>
                Cooperative Code:
                <strong>{member.organizationCode}</strong>
              </p>
            )}
          </div>
        </section>

        {/* STATISTICS */}
        <section className="member-statistics">
          <div className="member-stat-card savings-stat">
            <div className="stat-icon">💰</div>

            <div>
              <span>Total Savings</span>

              <h2>
                ₦{Number(approvedTotal).toLocaleString()}
              </h2>

              <p>Verified contributions</p>
            </div>
          </div>

          <div className="member-stat-card loan-stat">
            <div className="stat-icon">🏦</div>

            <div>
              <span>Loan Balance</span>

              <h2>
                ₦{Number(outstandingBalance).toLocaleString()}
              </h2>

              <p>Outstanding loan balance</p>
            </div>
          </div>

          <div className="member-stat-card status-stat">
            <div className="stat-icon">✓</div>

            <div>
              <span>Membership Status</span>

              <h2>Active</h2>

              <p>Member in good standing</p>
            </div>
          </div>
        </section>

        <section className="member-profile-card">
          <div className="card-heading">
            <div>
              <span className="member-section-label">LOAN OVERVIEW</span>
              <h2>My Loan Repayments</h2>
            </div>
          </div>

          {memberLoans.length === 0 ? (
            <p>No loan records yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-borderless mb-0">
                <thead><tr><th>Status</th><th>Original Amount</th><th>Amount Repaid</th><th>Remaining Balance</th><th>Monthly Repayment</th></tr></thead>
                <tbody>
                  {memberLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.status || "Pending"}</td>
                      <td>₦{Number(loan.amount || 0).toLocaleString()}</td>
                      <td>₦{Number(loan.amountRepaid || 0).toLocaleString()}</td>
                      <td>₦{Number(loan.remainingBalance || 0).toLocaleString()}</td>
                      <td>{loan.monthlyRepayment ? `₦${Number(loan.monthlyRepayment).toLocaleString()}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PROFILE */}
        <section className="member-profile-card">
          <div className="card-heading">
            <div>
              <span className="member-section-label">
                ACCOUNT INFORMATION
              </span>

              <h2>My Profile</h2>
            </div>

            <div className="profile-avatar">
              {member.fullName
                ? member.fullName.charAt(0).toUpperCase()
                : "M"}
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-item">
              <span>Full Name</span>
              <strong>{member.fullName}</strong>
            </div>

            <div className="profile-item">
              <span>Email Address</span>
              <strong>{member.email || "Not provided"}</strong>
            </div>

            <div className="profile-item">
              <span>Phone Number</span>
              <strong>{member.phone || "Not provided"}</strong>
            </div>

            <div className="profile-item">
              <span>Cooperative Code</span>
              <strong>
                {member.organizationCode || "Not available"}
              </strong>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="member-actions-card">
          <div className="card-heading">
            <div>
              <span className="member-section-label">
                QUICK ACTIONS
              </span>

              <h2>Manage Your Cooperative Activities</h2>
            </div>
          </div>

          <div className="member-actions-grid">
            <a href="/savings" className="member-action savings-action">
              <span>💰</span>
              <div>
                <strong>Manage Savings</strong>
                <small>Submit and track savings payments</small>
              </div>
            </a>

            <a href="/loans" className="member-action loan-action">
              <span>🏦</span>
              <div>
                <strong>Apply for Loan</strong>
                <small>Request and track cooperative loans</small>
              </div>
            </a>

            <a href="/reports" className="member-action report-action">
              <span>📊</span>
              <div>
                <strong>View Reports</strong>
                <small>Review your financial activity</small>
              </div>
            </a>

            <a href="/settings" className="member-action profile-action">
              <span>⚙️</span>
              <div>
                <strong>Account Settings</strong>
                <small>Update your profile information</small>
              </div>
            </a>
          </div>
        </section>

        {/* FOOTER MESSAGE */}
        <section className="member-dashboard-footer">
          <div>
            <strong>{member.organizationName}</strong>
            <p>
              Thank you for being an active member of your
              cooperative community.
            </p>
          </div>

          <span>🌱</span>
        </section>
      </main>
    </div>
  );
}

export default MemberDashboard;
