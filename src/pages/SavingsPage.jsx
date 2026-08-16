import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

import Sidebar from "../components/Sidebar";

import {
  submitSavingsPayment,
  listenToMemberSavings,
  getMemberApprovedTotal,
} from "../services/savingsService";

import "../styles/SavingsPage.css";

function SavingsPage() {
  const [loadingInit, setLoadingInit] = useState(true);
  const [loading, setLoading] = useState(false);

  const [organizationId, setOrganizationId] = useState(null);
  const [memberFullName, setMemberFullName] = useState("");

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reference, setReference] = useState("");
  const [file, setFile] = useState(null);

  const [history, setHistory] = useState([]);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const [orgPaymentSettings, setOrgPaymentSettings] = useState(null);

  // ============================================
  // Helpers
  // ============================================

  const formatMoney = (value) => {
    return `₦${Number(value || 0).toLocaleString()}`;
  };

  const formatDate = (value, includeTime = false) => {
    if (!value) return "-";

    try {
      let date;

      if (value?.seconds) {
        date = value.toDate();
      } else {
        date = new Date(value);
      }

      if (Number.isNaN(date.getTime())) return "-";

      return includeTime
        ? date.toLocaleString()
        : date.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  // ============================================
  // Load logged-in member
  // ============================================

  useEffect(() => {
    let unsubscribeSavings = null;

    const initForUser = async (user) => {
      if (!user) {
        setOrganizationId(null);
        setMemberFullName("");
        setHistory([]);
        setApprovedTotal(0);
        setLoadingInit(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setLoadingInit(false);
          return;
        }

        const data = userSnap.data();

        const orgId = data.organizationId || null;

        setOrganizationId(orgId);
        setMemberFullName(data.fullName || "");

        if (!orgId) {
          setLoadingInit(false);
          return;
        }

        // ----------------------------------------
        // Approved savings total
        // ----------------------------------------

        const total = await getMemberApprovedTotal({
          organizationId: orgId,
          memberUid: user.uid,
        });

        setApprovedTotal(total);

        // ----------------------------------------
        // Savings history listener
        // ----------------------------------------

        unsubscribeSavings = listenToMemberSavings({
          organizationId: orgId,
          memberUid: user.uid,
          callback: (items) => {
            const list = items || [];

            // update history
            setHistory(list);

            // update approved total reactively so the balance updates after admin approval
            const approvedSum = list
              .filter((it) => it.status === "Approved")
              .reduce((acc, it) => acc + Number(it.amount || 0), 0);

            setApprovedTotal(approvedSum);
          },
        });

        // ----------------------------------------
        // Organization payment settings
        // ----------------------------------------

        try {
          const settingsRef = doc(
            db,
            "organizations",
            orgId,
            "paymentSettings",
            "default"
          );

          const settingsSnap = await getDoc(settingsRef);

          if (settingsSnap.exists()) {
            setOrgPaymentSettings(settingsSnap.data());
          }
        } catch (error) {
          console.error("Payment settings error:", error);
        }
      } catch (error) {
        console.error("Error loading savings page:", error);
        toast.error("Unable to load your savings information.");
      } finally {
        setLoadingInit(false);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoadingInit(true);
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

  // ============================================
  // File selection
  // ============================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a JPG, PNG or PDF file.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // ============================================
  // Submit savings payment
  // ============================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid savings amount.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    if (!organizationId) {
      toast.error("You are not a member of an organization.");
      return;
    }

    if (!file) {
      toast.error("Please upload your payment receipt.");
      return;
    }

    setLoading(true);

    try {
      await submitSavingsPayment({
        organizationId,
        memberUid: user.uid,
        memberFullName,
        amount: Number(amount),
        paymentDate,
        reference,
        file,
      });

      toast.success(
        "Savings payment submitted successfully. It is now pending verification."
      );

      setAmount("");
      setReference("");
      setFile(null);

      const fileInput = document.getElementById("paymentReceipt");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Savings submission error:", error);

      toast.error(
        error?.message || "Failed to submit savings payment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Loading screen
  // ============================================

  if (loadingInit) {
    return (
      <div className="savings-loading">
        <div className="savings-loading-spinner"></div>
        <h4>Loading your savings...</h4>
        <p>Please wait.</p>
      </div>
    );
  }

  // ============================================
  // Latest payment
  // ============================================

  const latest = history.length > 0 ? history[0] : null;

  // ============================================
  // Statistics
  // ============================================

  const totalSubmissions = history.length;

  const pendingPayments = history.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedPayments = history.filter(
    (item) => item.status === "Approved"
  ).length;

  // ============================================
  // Page
  // ============================================

  return (
    <div className="savings-layout">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="savings-sidebar">
        <Sidebar />
      </aside>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="savings-main">

        {/* Header */}

        <div className="savings-page-header">
          <div>
            <span className="savings-eyebrow">
              FINANCIAL MANAGEMENT
            </span>

            <h1>
              <span className="savings-title-icon">💰</span>
              My Payments
            </h1>

            <p>
              View and track your savings payment submissions.
            </p>
          </div>
        </div>

        {/* ========================================
            BALANCE CARD
        ======================================== */}

        <section className="savings-balance-card">

          <div className="balance-icon">
            💰
          </div>

          <div className="balance-content">
            <span>Current Savings Balance</span>

            <strong>
              {formatMoney(approvedTotal)}
            </strong>

            <small>
              Total verified contributions
            </small>
          </div>

        </section>

        {/* ========================================
            STATISTICS
        ======================================== */}

        <section className="savings-stat-grid">

          <div className="savings-stat-card">

            <div className="stat-icon green">
              💰
            </div>

            <div>
              <span>Approved Savings</span>

              <strong>
                {formatMoney(approvedTotal)}
              </strong>

              <small>
                Total verified contributions
              </small>
            </div>

          </div>

          <div className="savings-stat-card">

            <div className="stat-icon blue">
              🧾
            </div>

            <div>
              <span>Total Submissions</span>

              <strong>
                {totalSubmissions}
              </strong>

              <small>
                Payment submissions
              </small>
            </div>

          </div>

          <div className="savings-stat-card">

            <div className="stat-icon yellow">
              ⏳
            </div>

            <div>
              <span>Pending Payments</span>

              <strong>
                {pendingPayments}
              </strong>

              <small>
                Awaiting administrator review
              </small>
            </div>

          </div>

        </section>

        {/* ========================================
            MAIN TWO-COLUMN SECTION
        ======================================== */}

        <section className="savings-content-grid">

          {/* ======================================
              PAYMENT STATUS
          ====================================== */}

          <div className="savings-panel">

            <div className="panel-header">
              <div>
                <h2>Payment Status</h2>

                <p>
                  Track your latest savings payment.
                </p>
              </div>
            </div>

            {!latest ? (

              <div className="empty-payment-state">

                <div className="empty-icon">
                  💳
                </div>

                <h3>
                  No payment submitted yet
                </h3>

                <p>
                  Submit your savings payment below and upload
                  your payment receipt for verification.
                </p>

              </div>

            ) : (

              <div className="payment-status-card">

                <div className="payment-top">

                  <div>
                    <span>Payment ID</span>

                    <strong>
                      PAY-{latest.id.substring(0, 8).toUpperCase()}
                    </strong>
                  </div>

                  <div className={`payment-status-badge ${String(latest.status || "").toLowerCase()}`}>
                    {latest.status}
                  </div>

                </div>

                <div className="payment-info-grid">

                  <div>
                    <span>Amount Paid</span>

                    <strong className="amount-green">
                      {formatMoney(latest.amount)}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Date</span>

                    <strong>
                      {formatDate(latest.paymentDate)}
                    </strong>
                  </div>

                  <div>
                    <span>Transaction Reference</span>

                    <strong>
                      {latest.reference || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Method</span>

                    <strong>
                      Bank Transfer
                    </strong>
                  </div>

                </div>

                {/* Receipt */}

                <div className="receipt-section">

                  <span>Payment Proof</span>

                  {latest.receiptUrl ? (

                    <a
                      href={latest.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="receipt-link"
                    >
                      📄 View uploaded receipt
                    </a>

                  ) : (

                    <span className="no-receipt">
                      No receipt uploaded
                    </span>

                  )}

                </div>

                {/* Status message */}

                {latest.status === "Pending" && (

                  <div className="status-message pending-message">
                    <strong>
                      ⏳ Pending Verification
                    </strong>

                    <p>
                      Your payment has been received and is
                      waiting for an administrator to verify
                      your payment receipt.
                    </p>
                  </div>

                )}

                {latest.status === "Approved" && (

                  <div className="status-message approved-message">

                    <strong>
                      ✓ Payment Verified
                    </strong>

                    <p>
                      Your payment has been verified successfully
                      and your savings balance has been updated.
                    </p>

                    <small>
                      Verified by:{" "}
                      {latest.approvedByName || "Administrator"}
                      {" • "}
                      {formatDate(latest.approvedAt, true)}
                    </small>

                  </div>

                )}

                {latest.status === "Rejected" && (

                  <div className="status-message rejected-message">

                    <strong>
                      ✕ Payment Rejected
                    </strong>

                    <p>
                      This payment submission was rejected by
                      the administrator.
                    </p>

                  </div>

                )}

                {/* Progress */}

                <div className="payment-progress">

                  <div
                    className={`progress-step ${
                      latest.status ? "active" : ""
                    }`}
                  >
                    <span>1</span>
                    <label>Submitted</label>
                  </div>

                  <div
                    className={`progress-line ${
                      latest.status === "Pending" ||
                      latest.status === "Approved"
                        ? "active"
                        : ""
                    }`}
                  ></div>

                  <div
                    className={`progress-step ${
                      latest.status === "Pending" ||
                      latest.status === "Approved"
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>2</span>
                    <label>Under Review</label>
                  </div>

                  <div
                    className={`progress-line ${
                      latest.status === "Approved"
                        ? "active"
                        : ""
                    }`}
                  ></div>

                  <div
                    className={`progress-step ${
                      latest.status === "Approved"
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>3</span>
                    <label>Completed</label>
                  </div>

                </div>

              </div>

            )}

          </div>

          {/* ======================================
              SUBMIT PAYMENT
          ====================================== */}

          <div className="savings-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Submit Savings Payment
                </h2>

                <p>
                  Enter your payment details and upload
                  your payment proof.
                </p>
              </div>

              <div className="panel-icon">
                💰
              </div>

            </div>

            {/* Payment instructions */}

            {orgPaymentSettings && (

              <div className="payment-details-box">

                <h3>
                  Payment Details
                </h3>

                {orgPaymentSettings.bankName && (
                  <div className="payment-detail-row">
                    <span>Bank</span>
                    <strong>
                      {orgPaymentSettings.bankName}
                    </strong>
                  </div>
                )}

                {orgPaymentSettings.accountName && (
                  <div className="payment-detail-row">
                    <span>Account Name</span>
                    <strong>
                      {orgPaymentSettings.accountName}
                    </strong>
                  </div>
                )}

                {orgPaymentSettings.accountNumber && (
                  <div className="payment-detail-row">
                    <span>Account Number</span>
                    <strong>
                      {orgPaymentSettings.accountNumber}
                    </strong>
                  </div>
                )}

                {orgPaymentSettings.paymentInstructions && (
                  <div className="payment-instructions">
                    <span>Instructions</span>

                    <p>
                      {orgPaymentSettings.paymentInstructions}
                    </p>
                  </div>
                )}

              </div>

            )}

            <form
              className="savings-form"
              onSubmit={handleSubmit}
            >

              {/* Amount */}

              <div className="form-group">

                <label htmlFor="amount">
                  Amount Paid
                </label>

                <div className="input-wrapper">

                  <span>₦</span>

                  <input
                    id="amount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    required
                  />

                </div>

              </div>

              {/* Date */}

              <div className="form-group">

                <label htmlFor="paymentDate">
                  Payment Date
                </label>

                <input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(event) =>
                    setPaymentDate(event.target.value)
                  }
                  required
                />

              </div>

              {/* Reference */}

              <div className="form-group">

                <label htmlFor="reference">
                  Transaction Reference
                </label>

                <input
                  id="reference"
                  type="text"
                  placeholder="Enter transaction/reference number"
                  value={reference}
                  onChange={(event) =>
                    setReference(event.target.value)
                  }
                />

              </div>

              {/* Receipt */}

              <div className="form-group">

                <label htmlFor="paymentReceipt">
                  Payment Proof
                </label>

                <label
                  htmlFor="paymentReceipt"
                  className="file-upload-box"
                >

                  <div className="upload-icon">
                    📄
                  </div>

                  <div>
                    <strong>
                      {file
                        ? file.name
                        : "Upload payment receipt"}
                    </strong>

                    <small>
                      JPG, PNG or PDF
                    </small>
                  </div>

                </label>

                <input
                  id="paymentReceipt"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  hidden
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="submit-payment-btn"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    💳 Submit Payment
                  </>
                )}

              </button>

              <div className="form-notice">
                🔒 Your payment will remain pending until
                an administrator verifies your payment receipt.
              </div>

            </form>

          </div>

        </section>

        {/* ========================================
            SAVINGS HISTORY
        ======================================== */}

        <section className="savings-panel history-panel">

          <div className="panel-header">

            <div>
              <h2>
                Savings History
              </h2>

              <p>
                Your previous savings payment submissions.
              </p>
            </div>

            <div className="history-count">
              {history.length} payment
              {history.length === 1 ? "" : "s"}
            </div>

          </div>

          {history.length === 0 ? (

            <div className="history-empty">

              <div className="empty-icon">
                🧾
              </div>

              <h3>
                No savings payments yet
              </h3>

              <p>
                Your submitted savings payments will appear
                here.
              </p>

            </div>

          ) : (

            <div className="history-table-wrapper">

              <table className="savings-history-table">

                <thead>

                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>

                </thead>

                <tbody>

                  {history.map((item) => (

                    <tr key={item.id}>

                      <td>
                        {formatDate(item.paymentDate)}
                      </td>

                      <td className="history-amount">
                        {formatMoney(item.amount)}
                      </td>

                      <td>
                        {item.reference || "-"}
                      </td>

                      <td>

                        <span
                          className={`history-status ${
                            String(
                              item.status || ""
                            ).toLowerCase()
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td>

                        {item.receiptUrl ? (

                          <a
                            href={item.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="view-receipt-btn"
                          >
                            View Receipt
                          </a>

                        ) : (
                          "-"
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default SavingsPage;