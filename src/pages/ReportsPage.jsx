import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getOrganizationReport } from "../services/reportService";
import { toast } from "react-toastify";
import "../styles/ReportsPage.css";

function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatMoney = (value) => {
    return `₦${Number(value || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const loadReport = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          toast.error("Please log in again.");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          toast.error("User profile not found.");
          return;
        }

        const userData = userSnap.data();
        const organizationId = userData.organizationId;

        if (!organizationId) {
          toast.error("You are not connected to an organization.");
          return;
        }

        const reportData =
          await getOrganizationReport(organizationId);

        setReport(reportData);
      } catch (error) {
        console.error("Report loading error:", error);
        toast.error("Unable to load financial reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="reports-spinner"></div>
          <h3>Loading Reports...</h3>
          <p>
            Please wait while we calculate your cooperative reports.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="reports-page">
        <div className="reports-empty">
          <h2>Unable to Load Report</h2>
          <p>
            We could not find the financial information for this
            organization.
          </p>
        </div>
      </div>
    );
  }

  const summary = report.summary;

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">
        <div>
          <span className="reports-label">
            AGRICULTURAL COOPERATIVE
          </span>

          <h1>📊 Financial Reports</h1>

          <p>
            View a summary of your cooperative's financial,
            loan, membership, and inventory activities.
          </p>
        </div>

        <div className="reports-header-badge">
          ADMIN
        </div>
      </div>

      {/* FINANCIAL SUMMARY */}

      <div className="reports-section">

        <div className="reports-section-heading">
          <h2>Financial Summary</h2>
          <p>
            Current financial position of your cooperative.
          </p>
        </div>

        <div className="reports-stat-grid">

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              👥
            </div>

            <div>
              <span>Total Members</span>
              <strong>
                {summary.totalMembers}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              💰
            </div>

            <div>
              <span>Total Savings</span>
              <strong>
                {formatMoney(summary.totalSavings)}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              🏦
            </div>

            <div>
              <span>Total Loans</span>
              <strong>
                {formatMoney(summary.totalLoans)}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              📦
            </div>

            <div>
              <span>Inventory Value</span>
              <strong>
                {formatMoney(summary.inventoryValue)}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* LOAN REPORT */}

      <div className="reports-section">

        <div className="reports-section-heading">
          <h2>Loan Report</h2>
          <p>
            Overview of cooperative loan applications.
          </p>
        </div>

        <div className="reports-stat-grid">

          <div className="reports-stat-card">
            <div className="reports-stat-icon pending">
              ⏳
            </div>

            <div>
              <span>Pending Loans</span>
              <strong>
                {summary.pendingLoans}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon approved">
              ✓
            </div>

            <div>
              <span>Approved Loans</span>
              <strong>
                {summary.approvedLoans}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon rejected">
              ✕
            </div>

            <div>
              <span>Rejected Loans</span>
              <strong>
                {summary.rejectedLoans}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              💵
            </div>

            <div>
              <span>Approved Loan Amount</span>
              <strong>
                {formatMoney(summary.approvedLoanAmount)}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* INVENTORY REPORT */}

      <div className="reports-section">

        <div className="reports-section-heading">
          <h2>Inventory Report</h2>
          <p>
            Overview of cooperative inventory.
          </p>
        </div>

        <div className="reports-stat-grid">

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              📦
            </div>

            <div>
              <span>Inventory Items</span>
              <strong>
                {summary.inventoryItems}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon">
              💰
            </div>

            <div>
              <span>Total Inventory Value</span>
              <strong>
                {formatMoney(summary.inventoryValue)}
              </strong>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon warning">
              ⚠️
            </div>

            <div>
              <span>Low Stock Items</span>
              <strong>
                {summary.lowStockItems}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* REPORT DETAILS */}

      <div className="reports-section">

        <div className="reports-section-heading">
          <h2>Report Details</h2>
          <p>
            Additional information from the organization's
            current records.
          </p>
        </div>

        <div className="reports-details-grid">

          <div className="reports-detail-card">
            <span>Member Records</span>
            <strong>
              {report.members.length}
            </strong>
          </div>

          <div className="reports-detail-card">
            <span>Loan Records</span>
            <strong>
              {report.loans.length}
            </strong>
          </div>

          <div className="reports-detail-card">
            <span>Inventory Records</span>
            <strong>
              {report.inventory.length}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ReportsPage;