import { useEffect, useState } from "react";
import {
  listenToOrganizationSavings,
  approveSavings,
  rejectSavings,
  getOrganizationApprovedTotal,
} from "../services/savingsService";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

import "../styles/AdminSavings.css";

function AdminSavings() {
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalApproved, setTotalApproved] = useState(0);

  useEffect(() => {
    let unsubscribeSavings = null;

    const initForUser = async (user) => {
      if (!user) {
        setOrganizationId(null);
        setTransactions([]);
        setTotalApproved(0);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const orgId = userData.organizationId || null;

        setOrganizationId(orgId);

        if (!orgId) {
          setLoading(false);
          return;
        }

        // Listen for savings transactions
        unsubscribeSavings = listenToOrganizationSavings({
          organizationId: orgId,

          callback: (items) => {
            const list = items || [];

            console.log("Savings transactions:", list);

            // update transactions list
            setTransactions(list);

            // compute approved total reactively so admin summary updates in real-time
            const approvedTotal = list
              .filter((t) => t.status === "Approved")
              .reduce((acc, t) => acc + Number(t.amount || 0), 0);

            setTotalApproved(approvedTotal);
          },
        });

        // Get approved total
        const total = await getOrganizationApprovedTotal({
          organizationId: orgId,
        });

        setTotalApproved(total);
      } catch (error) {
        console.error("Admin savings error:", error);
        toast.error("Unable to load savings transactions.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      initForUser(user);
    });

    return () => {
      if (typeof unsubscribeSavings === "function") {
        unsubscribeSavings();
      }

      if (typeof unsubscribeAuth === "function") {
        unsubscribeAuth();
      }
    };
  }, []);

  // ===============================
  // APPROVE
  // ===============================

  const handleApprove = async (transactionId) => {
    if (!organizationId) return;

    try {
      const result = await approveSavings({
        organizationId,
        savingsId: transactionId,
        approverUid: auth.currentUser?.uid,
      });

      if (result?.alreadyApproved) {
        toast.info("This payment has already been approved.");
      } else {
        toast.success("Savings payment approved successfully.");

        const total = await getOrganizationApprovedTotal({
          organizationId,
        });

        setTotalApproved(total);
      }
    } catch (error) {
      console.error("Approve savings error:", error);
      toast.error("Failed to approve savings payment.");
    }
  };

  // ===============================
  // REJECT
  // ===============================

  const handleReject = async (transactionId) => {
    if (!organizationId) return;

    try {
      const result = await rejectSavings({
        organizationId,
        savingsId: transactionId,
        approverUid: auth.currentUser?.uid,
      });

      if (result?.alreadyFinalized) {
        toast.info("This payment has already been finalized.");
      } else {
        toast.success("Savings payment rejected.");
      }
    } catch (error) {
      console.error("Reject savings error:", error);
      toast.error("Failed to reject savings payment.");
    }
  };

  // ===============================
  // DATE FORMAT
  // ===============================

  const formatDate = (value) => {
    if (!value) return "-";

    try {
      if (value?.seconds) {
        return value.toDate().toLocaleString();
      }

      return new Date(value).toLocaleString();
    } catch {
      return "-";
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="admin-savings-layout">
        <main className="admin-savings-page">
          <div className="savings-loading">
            <div className="loading-spinner"></div>
            <h4>Loading savings transactions...</h4>
            <p>Please wait...</p>
          </div>
        </main>
      </div>
    );
  }

  // ===============================
  // PAGE
  // ===============================

  return (
    <div className="admin-savings-layout">
      <main className="admin-savings-page">

        {/* HEADER */}

        <div className="admin-savings-header">
          <div>
            <span className="savings-page-label">
              FINANCIAL MANAGEMENT
            </span>

            <h1>💰 Savings Transactions</h1>

            <p>
              Review and verify member savings payments.
            </p>
          </div>
        </div>

        {/* TOTAL APPROVED */}

        <div className="approved-summary-card">

          <div className="approved-summary-icon">
            💰
          </div>

          <div>
            <p>Total Approved Savings</p>

            <h2>
              ₦{Number(totalApproved).toLocaleString()}
            </h2>

            <span>
              Verified member contributions
            </span>
          </div>

        </div>

        {/* TRANSACTIONS */}

        <div className="admin-savings-card">

          <div className="savings-card-header">

            <div>
              <h3>Payment Submissions</h3>

              <p>
                Review member payment receipts and approve
                or reject submitted savings.
              </p>
            </div>

            <div className="transaction-count">
              {transactions.length}{" "}
              {transactions.length === 1
                ? "Transaction"
                : "Transactions"}
            </div>

          </div>

          {/* EMPTY */}

          {transactions.length === 0 ? (

            <div className="admin-savings-empty">

              <div className="empty-savings-icon">
                💳
              </div>

              <h3>No Savings Transactions Yet</h3>

              <p>
                Member savings payments will appear here
                after they submit their payment.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="admin-savings-table">

                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Reference</th>
                    <th>Receipt</th>
                    <th>Status</th>
                    <th>Verified By</th>
                    <th>Verification Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {transactions.map((transaction) => (

                    <tr key={transaction.id}>

                      {/* MEMBER */}

                      <td>
                        <div className="member-cell">

                          <div className="member-avatar">
                            👤
                          </div>

                          <div>
                            <strong>
                              {transaction.memberFullName ||
                                "Unknown Member"}
                            </strong>

                            <small>
                              {transaction.memberUid}
                            </small>
                          </div>

                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td>
                        <span className="amount-cell">
                          ₦
                          {Number(
                            transaction.amount || 0
                          ).toLocaleString()}
                        </span>
                      </td>

                      {/* PAYMENT DATE */}

                      <td>
                        {formatDate(
                          transaction.paymentDate
                        )}
                      </td>

                      {/* REFERENCE */}

                      <td>
                        {transaction.reference || "-"}
                      </td>

                      {/* RECEIPT */}

                      <td>

                        {transaction.receiptUrl ? (

                          <a
                            href={transaction.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="receipt-button"
                          >
                            📄 View Receipt
                          </a>

                        ) : (

                          <span className="no-receipt">
                            No Receipt
                          </span>

                        )}

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${
                            transaction.status === "Pending"
                              ? "pending"
                              : transaction.status === "Approved"
                              ? "approved"
                              : "rejected"
                          }`}
                        >

                          {transaction.status ===
                            "Pending" && "⏳"}

                          {transaction.status ===
                            "Approved" && "✓"}

                          {transaction.status ===
                            "Rejected" && "✕"}

                          {" "}

                          {transaction.status}

                        </span>

                      </td>

                      {/* VERIFIED BY */}

                      <td>
                        {transaction.approvedByName ||
                          transaction.rejectedByName ||
                          "-"}
                      </td>

                      {/* VERIFICATION DATE */}

                      <td>

                        {formatDate(
                          transaction.approvedAt ||
                            transaction.rejectedAt
                        )}

                      </td>

                      {/* ACTION */}

                      <td>

                        {transaction.status ===
                        "Pending" ? (

                          <div className="savings-actions">

                            <button
                              className="approve-button"
                              onClick={() =>
                                handleApprove(
                                  transaction.id
                                )
                              }
                            >
                              ✓ Approve
                            </button>

                            <button
                              className="reject-button"
                              onClick={() =>
                                handleReject(
                                  transaction.id
                                )
                              }
                            >
                              ✕ Reject
                            </button>

                          </div>

                        ) : (

                          <span className="completed-action">
                            Completed
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminSavings;