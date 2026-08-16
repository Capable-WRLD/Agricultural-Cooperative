import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import "../styles/LoansPage.css";
import Sidebar from "../components/Sidebar";

function LoansPage() {
  const [organizationId, setOrganizationId] = useState(null);
  const [userRole, setUserRole] = useState("Member");
  const [memberName, setMemberName] = useState("");
  const [loans, setLoans] = useState([]);

  const [loanAmount, setLoanAmount] = useState("");
  const [loanReason, setLoanReason] = useState("");
  const [loanDuration, setLoanDuration] = useState(12);

  const [loanPolicy, setLoanPolicy] = useState({
    interestRate: 10,
    loanMultiplier: 2,
    minimumSavings: 50000,
    maximumDuration: 12,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {
    const loadUser = async () => {
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

        const orgId = userData.organizationId || null;

        setOrganizationId(orgId);
        setUserRole(userData.role || "Member");

        setMemberName(
          userData.fullName ||
            user.displayName ||
            "Member"
        );

        // Load organization loan policy
        if (orgId) {
          const policyRef = doc(
            db,
            "organizations",
            orgId,
            "loanPolicy",
            "currentPolicy"
          );

          const policySnap = await getDoc(policyRef);

          if (policySnap.exists()) {
            const policy = policySnap.data();

            setLoanPolicy({
              interestRate: Number(
                policy.interestRate ?? 10
              ),
              loanMultiplier: Number(
                policy.loanMultiplier ?? 2
              ),
              minimumSavings: Number(
                policy.minimumSavings ?? 50000
              ),
              maximumDuration: Number(
                policy.maximumDuration ?? 12
              ),
            });

            setLoanDuration(
              Number(policy.maximumDuration ?? 12)
            );
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ============================================================
  // LISTEN TO LOANS
  // ============================================================

  useEffect(() => {
    if (!organizationId) return;

    const user = auth.currentUser;

    if (!user) return;

    const loansRef = collection(
      db,
      "organizations",
      organizationId,
      "loans"
    );

    let loansQuery;

    if (userRole === "Admin") {
      loansQuery = query(loansRef);
    } else {
      loansQuery = query(
        loansRef,
        where("userId", "==", user.uid)
      );
    }

    const unsubscribe = onSnapshot(
      loansQuery,
      (snapshot) => {
        const data = snapshot.docs.map((loanDoc) => ({
          id: loanDoc.id,
          ...loanDoc.data(),
        }));

        data.sort((a, b) => {
          const aDate = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : new Date(a.createdAt || 0).getTime();

          const bDate = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : new Date(b.createdAt || 0).getTime();

          return bDate - aDate;
        });

        setLoans(data);
      },
      (error) => {
        console.error("Loan listener error:", error);
        toast.error("Unable to load loan requests.");
      }
    );

    return () => unsubscribe();
  }, [organizationId, userRole]);

  // ============================================================
  // SUBMIT LOAN
  // ============================================================

  const handleSubmitLoan = async (event) => {
    event.preventDefault();

    if (!organizationId) {
      toast.error(
        "You are not connected to an organization."
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      toast.error("Please log in again.");
      return;
    }

    const amount = Number(loanAmount);
    const duration = Number(loanDuration);

    if (!amount || amount <= 0) {
      toast.error(
        "Please enter a valid loan amount."
      );
      return;
    }

    if (!loanReason.trim()) {
      toast.error(
        "Please enter the reason for the loan."
      );
      return;
    }

    if (
      !duration ||
      duration < 1 ||
      duration > loanPolicy.maximumDuration
    ) {
      toast.error(
        `Loan duration cannot exceed ${loanPolicy.maximumDuration} months.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const loansRef = collection(
        db,
        "organizations",
        organizationId,
        "loans"
      );

      await addDoc(loansRef, {
        organizationId,

        userId: user.uid,

        userName:
          memberName ||
          user.displayName ||
          "Member",

        amount,

        reason: loanReason.trim(),

        duration,

        status: "Pending",

        createdAt: serverTimestamp(),

        approvedAt: null,
        approvedBy: null,
        approvedByName: null,

        interestRate: null,
        interestAmount: null,
        totalRepayment: null,
        monthlyRepayment: null,

        amountDisbursed: 0,
        amountRepaid: 0,
        remainingBalance: 0,

        rejectedAt: null,
        rejectedBy: null,
        rejectedByName: null,
      });

      setLoanAmount("");
      setLoanReason("");
      setLoanDuration(
        loanPolicy.maximumDuration
      );

      toast.success(
        "Loan request submitted successfully."
      );
    } catch (error) {
      console.error(
        "Loan submission error:",
        error
      );

      toast.error(
        "Failed to submit loan request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // APPROVE LOAN
  // ============================================================

  const approveLoan = async (loan) => {
    const admin = auth.currentUser;

    if (!admin) {
      toast.error("Administrator session expired.");
      return;
    }

    if (loan.status !== "Pending") {
      toast.error(
        "Only pending loans can be approved."
      );
      return;
    }

    const confirmed = window.confirm(
      `Approve ₦${Number(
        loan.amount
      ).toLocaleString()} loan for ${
        loan.userName || "this member"
      }?`
    );

    if (!confirmed) return;

    setActionLoading(loan.id);

    try {
      const loanRef = doc(
        db,
        "organizations",
        organizationId,
        "loans",
        loan.id
      );

      await runTransaction(
        db,
        async (transaction) => {
          const loanSnap =
            await transaction.get(loanRef);

          if (!loanSnap.exists()) {
            throw new Error(
              "Loan request no longer exists."
            );
          }

          const loanData = loanSnap.data();

          if (loanData.status !== "Pending") {
            throw new Error(
              "This loan has already been processed."
            );
          }

          const amount = Number(
            loanData.amount || 0
          );

          const duration = Number(
            loanData.duration ||
              loanPolicy.maximumDuration
          );

          const interestRate = Number(
            loanData.interestRate ??
              loanPolicy.interestRate
          );

          if (!amount || amount <= 0) {
            throw new Error(
              "Invalid loan amount."
            );
          }

          // Simple interest calculation
          const interestAmount =
            amount *
            (interestRate / 100);

          const totalRepayment =
            amount + interestAmount;

          const monthlyRepayment =
            totalRepayment / duration;

          transaction.update(loanRef, {
            status: "Approved",

            approvedAt:
              serverTimestamp(),

            approvedBy: admin.uid,

            approvedByName:
              admin.displayName ||
              "Administrator",

            interestRate,

            interestAmount,

            totalRepayment,

            monthlyRepayment,

            amountDisbursed: 0,

            amountRepaid: 0,

            remainingBalance:
              totalRepayment,
          });
        }
      );

      toast.success(
        "Loan approved successfully."
      );
    } catch (error) {
      console.error(
        "Approve loan error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to approve loan."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // REJECT LOAN
  // ============================================================

  const rejectLoan = async (loan) => {
    const admin = auth.currentUser;

    if (!admin) {
      toast.error("Administrator session expired.");
      return;
    }

    if (loan.status !== "Pending") {
      toast.error(
        "Only pending loans can be rejected."
      );
      return;
    }

    const confirmed = window.confirm(
      `Reject the loan request from ${
        loan.userName || "this member"
      }?`
    );

    if (!confirmed) return;

    setActionLoading(loan.id);

    try {
      const loanRef = doc(
        db,
        "organizations",
        organizationId,
        "loans",
        loan.id
      );

      await runTransaction(
        db,
        async (transaction) => {
          const loanSnap =
            await transaction.get(loanRef);

          if (!loanSnap.exists()) {
            throw new Error(
              "Loan request no longer exists."
            );
          }

          const loanData = loanSnap.data();

          if (loanData.status !== "Pending") {
            throw new Error(
              "This loan has already been processed."
            );
          }

          transaction.update(loanRef, {
            status: "Rejected",

            rejectedAt:
              serverTimestamp(),

            rejectedBy: admin.uid,

            rejectedByName:
              admin.displayName ||
              "Administrator",
          });
        }
      );

      toast.success(
        "Loan request rejected."
      );
    } catch (error) {
      console.error(
        "Reject loan error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to reject loan."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "-";

    try {
      if (value?.toDate) {
        return value.toDate().toLocaleString();
      }

      return new Date(value).toLocaleString();
    } catch {
      return "-";
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="loans-page">
        <div className="loans-loading">
          <div className="loan-spinner"></div>

          <h3>Loading Loans...</h3>

          <p>
            Please wait while we load your loan
            information.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="loans-layout">

      <aside className="loans-sidebar">
        <Sidebar />
      </aside>

      <main className="loans-page">

      {/* HEADER */}

      <div className="loans-header">

        <div>
          <span className="loans-label">
            FINANCIAL MANAGEMENT
          </span>

          <h1>🏦 Loan Management</h1>

          <p>
            {userRole === "Admin"
              ? "Review and manage loan requests from cooperative members."
              : "Apply for a loan and monitor your loan requests."}
          </p>
        </div>

        <div className="loan-header-badge">
          {userRole === "Admin"
            ? "Administrator"
            : "Member"}
        </div>

      </div>

      {/* MEMBER APPLICATION */}

      {userRole !== "Admin" && (
        <div className="loan-application-card">

          <div className="loan-card-title">

            <div className="loan-title-icon">
              💰
            </div>

            <div>
              <h2>Apply for a Loan</h2>

              <p>
                Submit your request for
                administrator approval.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmitLoan}>

            <div className="loan-form-grid">

              <div className="loan-form-group">

                <label htmlFor="loanAmount">
                  Loan Amount
                </label>

                <div className="loan-input-wrapper">

                  <span>₦</span>

                  <input
                    id="loanAmount"
                    type="number"
                    min="1"
                    value={loanAmount}
                    onChange={(event) =>
                      setLoanAmount(
                        event.target.value
                      )
                    }
                    placeholder="Enter amount"
                  />

                </div>

              </div>

              <div className="loan-form-group">

                <label htmlFor="loanDuration">
                  Repayment Duration
                </label>

                <select
                  id="loanDuration"
                  value={loanDuration}
                  onChange={(event) =>
                    setLoanDuration(
                      Number(event.target.value)
                    )
                  }
                >
                  {Array.from(
                    {
                      length:
                        loanPolicy.maximumDuration,
                    },
                    (_, index) => index + 1
                  ).map((month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}{" "}
                      {month === 1
                        ? "Month"
                        : "Months"}
                    </option>
                  ))}
                </select>

              </div>

              <div className="loan-form-group">

                <label htmlFor="loanReason">
                  Reason for Loan
                </label>

                <textarea
                  id="loanReason"
                  value={loanReason}
                  onChange={(event) =>
                    setLoanReason(
                      event.target.value
                    )
                  }
                  placeholder="Explain why you need the loan..."
                  rows="4"
                />

              </div>

            </div>

            <button
              type="submit"
              className="loan-submit-button"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Loan Request"}
            </button>

          </form>

        </div>
      )}

      {/* LOAN STATISTICS */}

      <div className="loan-stat-grid">

        <div className="loan-stat-card">
          <div className="loan-stat-icon">
            📋
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{loans.length}</strong>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon pending-icon">
            ⏳
          </div>

          <div>
            <span>Pending</span>

            <strong>
              {
                loans.filter(
                  (loan) =>
                    loan.status ===
                    "Pending"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon approved-icon">
            ✓
          </div>

          <div>
            <span>Approved</span>

            <strong>
              {
                loans.filter(
                  (loan) =>
                    loan.status ===
                    "Approved"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon rejected-icon">
            ✕
          </div>

          <div>
            <span>Rejected</span>

            <strong>
              {
                loans.filter(
                  (loan) =>
                    loan.status ===
                    "Rejected"
                ).length
              }
            </strong>
          </div>
        </div>

      </div>

      {/* LOAN REQUESTS */}

      <div className="loan-list-card">

        <div className="loan-list-header">

          <div>
            <h2>
              {userRole === "Admin"
                ? "Member Loan Requests"
                : "My Loan Requests"}
            </h2>

            <p>
              {userRole === "Admin"
                ? "Review loan applications submitted by cooperative members."
                : "Track the progress of your loan applications."}
            </p>
          </div>

          <span className="loan-count">
            {loans.length}{" "}
            {loans.length === 1
              ? "Request"
              : "Requests"}
          </span>

        </div>

        {loans.length === 0 ? (

          <div className="loan-empty">

            <div className="loan-empty-icon">
              🏦
            </div>

            <h3>
              No Loan Requests Yet
            </h3>

            <p>
              {userRole === "Admin"
                ? "Member loan applications will appear here."
                : "Your loan applications will appear here after you submit one."}
            </p>

          </div>

        ) : (

          <div className="loan-table-wrapper">

            <table className="loan-table">

              <thead>

                <tr>

                  {userRole === "Admin" && (
                    <th>Applicant</th>
                  )}

                  <th>Amount</th>

                  <th>Reason</th>

                  <th>Status</th>

                  <th>Date</th>

                  {userRole === "Admin" && (
                    <th>Actions</th>
                  )}

                </tr>

              </thead>

              <tbody>

                {loans.map((loan) => (

                  <tr key={loan.id}>

                    {userRole === "Admin" && (
                      <td>

                        <div className="loan-member">

                          <div className="loan-member-avatar">
                            👤
                          </div>

                          <div>

                            <strong>
                              {loan.userName ||
                                "Unknown Member"}
                            </strong>

                            <small>
                              {loan.userId}
                            </small>

                          </div>

                        </div>

                      </td>
                    )}

                    <td>

                      <strong className="loan-amount">
                        ₦
                        {Number(
                          loan.amount || 0
                        ).toLocaleString()}
                      </strong>

                      {loan.status ===
                        "Approved" && (
                        <small
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px",
                            opacity: 0.7,
                          }}
                        >
                          Repayment: ₦
                          {Number(
                            loan.totalRepayment ||
                              0
                          ).toLocaleString()}
                        </small>
                      )}

                    </td>

                    <td>
                      <span className="loan-reason">
                        {loan.reason || "-"}
                      </span>
                    </td>

                    <td>

                      <span
                        className={`loan-status ${
                          loan.status ===
                          "Approved"
                            ? "approved"
                            : loan.status ===
                              "Rejected"
                            ? "rejected"
                            : "pending"
                        }`}
                      >

                        {loan.status ===
                          "Approved" &&
                          "✓ "}

                        {loan.status ===
                          "Rejected" &&
                          "✕ "}

                        {loan.status ===
                          "Pending" &&
                          "⏳ "}

                        {loan.status ||
                          "Pending"}

                      </span>

                    </td>

                    <td>
                      {formatDate(
                        loan.createdAt
                      )}
                    </td>

                    {userRole === "Admin" && (
                      <td>

                        {loan.status ===
                        "Pending" ? (
                          <div
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            <button
                              type="button"
                              className="btn btn-success"
                              disabled={
                                actionLoading ===
                                loan.id
                              }
                              onClick={() =>
                                approveLoan(
                                  loan
                                )
                              }
                            >
                              {actionLoading ===
                              loan.id
                                ? "Processing..."
                                : "✓ Approve"}
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger"
                              disabled={
                                actionLoading ===
                                loan.id
                              }
                              onClick={() =>
                                rejectLoan(
                                  loan
                                )
                              }
                            >
                              {actionLoading ===
                              loan.id
                                ? "Processing..."
                                : "✕ Reject"}
                            </button>

                          </div>
                        ) : (
                          <span
                            style={{
                              opacity: 0.6,
                              fontSize:
                                "13px",
                            }}
                          >
                            Processed
                          </span>
                        )}

                      </td>
                    )}

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

export default LoansPage;