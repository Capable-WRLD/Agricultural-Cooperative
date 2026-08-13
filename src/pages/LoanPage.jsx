import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function LoanPage() {
  const [organizationId, setOrganizationId] = useState(null);
  const [userRole, setUserRole] = useState("Member");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanReason, setLoanReason] = useState("");
  const [loans, setLoans] = useState([]);
  const [loanLoading, setLoanLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        setOrganizationId(userData.organizationId || null);
        setUserRole(userData.role || "Member");
      } catch (error) {
        console.error("Unable to load user profile:", error);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setLoanLoading(true);

    const loansRef = collection(db, "organizations", organizationId, "loans");
    const loansQuery =
      userRole === "Admin"
        ? query(loansRef, orderBy("createdAt", "desc"))
        : query(
            loansRef,
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
          );

    const unsubscribe = onSnapshot(
      loansQuery,
      (snapshot) => {
        const loaded = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoans(loaded);
        setLoanLoading(false);
      },
      (error) => {
        console.error("Unable to load loans:", error);
        setLoanLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId, userRole]);

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const amount = Number(loanAmount);
    if (!amount || amount <= 0) {
      setErrorMessage("Enter a valid loan amount.");
      return;
    }

    if (!loanReason.trim()) {
      setErrorMessage("Enter the reason for the loan.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !organizationId) {
      setErrorMessage("Unable to submit loan request. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "organizations", organizationId, "loans"), {
        userId: currentUser.uid,
        userName: currentUser.displayName || "",
        amount,
        reason: loanReason.trim(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      });

      setLoanAmount("");
      setLoanReason("");
      setSuccessMessage("Loan request submitted successfully.");
    } catch (error) {
      console.error("Unable to submit loan request:", error);
      setErrorMessage("Could not submit loan request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto 30px",
          padding: "30px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "#198754",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "30px",
            marginBottom: "18px",
            fontWeight: 700,
          }}
        >
          AgroCoop
        </span>
        <h1 style={{ color: "#fff", marginBottom: "8px" }}>Loan Requests</h1>
        <p style={{ color: "#d6d6d6", lineHeight: 1.8 }}>
          {userRole === "Admin"
            ? "View and manage all loan requests for your cooperative."
            : "Request a loan and see your loan application history here."}
        </p>
      </div>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gap: "30px",
        }}
      >
        <div
          style={{
            padding: "30px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {successMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "16px 20px",
                borderRadius: "14px",
                background: "#0f5132",
                color: "#fff",
              }}
            >
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "16px 20px",
                borderRadius: "14px",
                background: "#842029",
                color: "#fff",
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoanSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="loanAmount"
                style={{ color: "#d6d6d6", display: "block", marginBottom: "10px" }}
              >
                Loan Amount
              </label>
              <input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="loanReason"
                style={{ color: "#d6d6d6", display: "block", marginBottom: "10px" }}
              >
                Reason for Loan
              </label>
              <textarea
                id="loanReason"
                value={loanReason}
                onChange={(e) => setLoanReason(e.target.value)}
                placeholder="Describe why you need the loan"
                rows="5"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: "#28a745",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Loan Request"}
            </button>
          </form>
        </div>

        <div
          style={{
            padding: "30px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 style={{ color: "#fff", marginBottom: "20px" }}>
            {userRole === "Admin" ? "Loan Management" : "My Loan Requests"}
          </h2>

          {loanLoading ? (
            <p style={{ color: "#b7b7b7" }}>Loading loan requests...</p>
          ) : loans.length === 0 ? (
            <p style={{ color: "#b7b7b7" }}>No loan requests found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px", color: "#8ecf84" }}>
                      Applicant
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", color: "#8ecf84" }}>
                      Amount
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", color: "#8ecf84" }}>
                      Status
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", color: "#8ecf84" }}>
                      Reason
                    </th>
                    <th style={{ textAlign: "left", padding: "12px", color: "#8ecf84" }}>
                      Requested
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {loan.userName || "Unknown"}
                      </td>
                      <td style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        ₦{Number(loan.amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {loan.status || "Pending"}
                      </td>
                      <td style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {loan.reason}
                      </td>
                      <td style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoanPage;