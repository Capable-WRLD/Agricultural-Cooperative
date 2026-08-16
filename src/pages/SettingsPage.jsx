import { useState, useEffect } from "react";
import "../styles/SettingsPage.css";

import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

function SettingsPage() {
  const [organizationId, setOrganizationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loanPolicy, setLoanPolicy] = useState({
    interestRate: 10,
    loanMultiplier: 2,
    minimumSavings: 50000,
    minimumLoanAmount: 10000,
    maximumLoanAmount: 500000,
    maximumDuration: 12,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    paymentInstructions: "",
  });

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const orgId = userData.organizationId;
        setOrganizationId(orgId || null);
        setIsAdmin(userData.role === "Admin");

        if (!orgId) return;

        // Load loan policy
        const policyRef = doc(
          db,
          "organizations",
          orgId,
          "loanPolicy",
          "currentPolicy"
        );

        const policySnap = await getDoc(policyRef);

        if (policySnap.exists()) {
          const data = policySnap.data();

          setLoanPolicy({
            interestRate: data.interestRate ?? 10,
            loanMultiplier: data.loanMultiplier ?? 2,
            minimumSavings: data.minimumSavings ?? 50000,
            minimumLoanAmount: data.minimumLoanAmount ?? 10000,
            maximumLoanAmount: data.maximumLoanAmount ?? 500000,
            maximumDuration: data.maximumDuration ?? 12,
          });
        }

        // Load payment settings
        const payRef = doc(
          db,
          "organizations",
          orgId,
          "paymentSettings",
          "default"
        );

        const paySnap = await getDoc(payRef);

        if (paySnap.exists()) {
          setPaymentSettings({
            bankName: paySnap.data().bankName || "",
            accountName: paySnap.data().accountName || "",
            accountNumber: paySnap.data().accountNumber || "",
            paymentInstructions:
              paySnap.data().paymentInstructions || "",
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Unable to load settings.");
      }
    };

    // Call init on mount
    init();
  }, []);

  const updateLoanPolicy = (field, value) => {
    setLoanPolicy((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    if (!organizationId) {
      toast.error("No organization selected.");
      return;
    }

    if (!isAdmin) {
      toast.error("You do not have permission to edit organization settings.");
      return;
    }

    // Basic validation
    if (loanPolicy.interestRate < 0) {
      toast.error("Interest rate cannot be negative.");
      return;
    }

    if (loanPolicy.loanMultiplier <= 0) {
      toast.error("Loan multiplier must be greater than 0.");
      return;
    }

    if (loanPolicy.minimumSavings < 0) {
      toast.error("Minimum savings cannot be negative.");
      return;
    }

    if (loanPolicy.minimumLoanAmount <= 0) {
      toast.error("Minimum loan amount must be greater than 0.");
      return;
    }

    if (
      loanPolicy.maximumLoanAmount <
      loanPolicy.minimumLoanAmount
    ) {
      toast.error(
        "Maximum loan amount cannot be lower than minimum loan amount."
      );
      return;
    }

    if (loanPolicy.maximumDuration <= 0) {
      toast.error("Loan duration must be greater than 0.");
      return;
    }

    setSaving(true);

    try {
      // Save loan policy
      const policyRef = doc(
        db,
        "organizations",
        organizationId,
        "loanPolicy",
        "currentPolicy"
      );

      await setDoc(policyRef, {
        interestRate: Number(loanPolicy.interestRate),
        loanMultiplier: Number(loanPolicy.loanMultiplier),
        minimumSavings: Number(loanPolicy.minimumSavings),
        minimumLoanAmount: Number(
          loanPolicy.minimumLoanAmount
        ),
        maximumLoanAmount: Number(
          loanPolicy.maximumLoanAmount
        ),
        maximumDuration: Number(
          loanPolicy.maximumDuration
        ),
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || null,
      });

      // Save payment settings
      const paymentRef = doc(
        db,
        "organizations",
        organizationId,
        "paymentSettings",
        "default"
      );

      await setDoc(paymentRef, {
        bankName: paymentSettings.bankName.trim(),
        accountName: paymentSettings.accountName.trim(),
        accountNumber: paymentSettings.accountNumber.trim(),
        paymentInstructions:
          paymentSettings.paymentInstructions.trim(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Loan and payment settings saved successfully.");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">

      <div className="settings-header">
        <div>
          <h2>⚙ Settings</h2>

          <p>
            Configure your cooperative's loan policies and
            payment information.
          </p>
        </div>
      </div>

      {/* LOAN POLICY */}

      <div className="glass-card settings-card">

        <h3 className="mb-4">
          🌾 Loan Policy Configuration
        </h3>

        <div className="row">

          {/* Loan Multiplier */}

          <div className="col-md-6 mb-4">

            <label className="form-label">
              Loan Multiplier
            </label>

            <input
              type="number"
              min="0.1"
              step="0.1"
              className="form-control"
              value={loanPolicy.loanMultiplier}
              onChange={(e) =>
                updateLoanPolicy(
                  "loanMultiplier",
                  Number(e.target.value)
                )
              }
              disabled={!isAdmin}
            />

            <small>
              Maximum eligible loan is based on approved
              savings × this multiplier.
            </small>

          </div>

          {/* Interest */}

          <div className="col-md-6 mb-4">

            <label className="form-label">
              Interest Rate (%)
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              className="form-control"
              value={loanPolicy.interestRate}
              onChange={(e) =>
                updateLoanPolicy(
                  "interestRate",
                  Number(e.target.value)
                )
              }
              disabled={!isAdmin}
            />

            <small>
              Interest that will be applied to approved loans.
            </small>

          </div>

          {/* Minimum Savings */}

          <div className="col-md-6 mb-4">

            <label className="form-label">
              Minimum Savings Required (₦)
            </label>

            <input
              type="number"
              min="0"
              className="form-control"
              value={loanPolicy.minimumSavings}
              onChange={(e) =>
                updateLoanPolicy(
                  "minimumSavings",
                  Number(e.target.value)
                )
              }
              disabled={!isAdmin}
            />

            <small>
              Member must have at least this amount in
              approved savings before applying.
            </small>

          </div>

          {/* Minimum Loan */}

          <div className="col-md-6 mb-4">

            <label className="form-label">
              Minimum Loan Amount (₦)
            </label>

            <input
              type="number"
              min="1"
              className="form-control"
              value={loanPolicy.minimumLoanAmount}
              onChange={(e) =>
                updateLoanPolicy(
                  "minimumLoanAmount",
                  Number(e.target.value)
                )
              }
              disabled={!isAdmin}
            />

            <small>
              Smallest loan amount a member can request.
            </small>

          </div>

          {/* Maximum Loan */}

          <div className="col-md-6 mb-4">

            <label className="form-label">
              Maximum Loan Amount (₦)
            </label>

            <input
              type="number"
              min="1"
              className="form-control"
              value={loanPolicy.maximumLoanAmount}
              onChange={(e) =>
                updateLoanPolicy(
                  "maximumLoanAmount",
                  Number(e.target.value)
                )
              }
              disabled={!isAdmin}
            />

            <small>
              Absolute maximum loan allowed by the
              cooperative.
            </small>

          </div>

          {/* Duration */}

          <div className="col-md-6 mb-4">

            <label className="form-label">
              Maximum Loan Duration (Months)
            </label>

            <input
              type="number"
              min="1"
              className="form-control"
              value={loanPolicy.maximumDuration}
              onChange={(e) =>
                updateLoanPolicy(
                  "maximumDuration",
                  Number(e.target.value)
                )
              }
              disabled={!isAdmin}
            />

            <small>
              Maximum repayment period members can select.
            </small>

          </div>

        </div>

        {/* PAYMENT DETAILS */}

        <h3 className="mb-4 mt-4">
          🏦 Payment Account Details
        </h3>

        <div className="row">

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Bank Name
            </label>

            <input
              className="form-control"
              value={paymentSettings.bankName}
              onChange={(e) =>
                setPaymentSettings({
                  ...paymentSettings,
                  bankName: e.target.value,
                })
              }
              disabled={!isAdmin}
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Account Name
            </label>

            <input
              className="form-control"
              value={paymentSettings.accountName}
              onChange={(e) =>
                setPaymentSettings({
                  ...paymentSettings,
                  accountName: e.target.value,
                })
              }
              disabled={!isAdmin}
            />

          </div>

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Account Number
            </label>

            <input
              className="form-control"
              value={paymentSettings.accountNumber}
              onChange={(e) =>
                setPaymentSettings({
                  ...paymentSettings,
                  accountNumber: e.target.value,
                })
              }
              disabled={!isAdmin}
            />

          </div>

          <div className="col-md-12 mb-3">

            <label className="form-label">
              Payment Instructions
            </label>

            <textarea
              className="form-control"
              rows={4}
              value={paymentSettings.paymentInstructions}
              onChange={(e) =>
                setPaymentSettings({
                  ...paymentSettings,
                  paymentInstructions: e.target.value,
                })
              }
              disabled={!isAdmin}
            />

          </div>

        </div>

        <button
          className="btn btn-success save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "💾 Save Settings"}
        </button>

          {!isAdmin && (
            <p className="mt-3 text-muted">
              You have view-only access to organization settings. Contact an Admin to make changes.
            </p>
          )}
      </div>

    </div>
  );
}

export default SettingsPage;