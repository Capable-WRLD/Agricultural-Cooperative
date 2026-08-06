import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/SettingsPage.css";

import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function SettingsPage() {
  // Replace this later with the logged-in admin's organization ID
  const organizationId = "8xyLG24WL3jz2m0NtcJr";

  const [loanPolicy, setLoanPolicy] = useState({
    interestRate: 10,
    loanMultiplier: 2,
    minimumSavings: 50000,
    maximumDuration: 12,
  });

  useEffect(() => {
    loadLoanPolicy();
  }, []);

  const loadLoanPolicy = async () => {
    try {
      const policyRef = doc(
        db,
        "organizations",
        organizationId,
        "loanPolicy",
        "currentPolicy"
      );

      const policySnap = await getDoc(policyRef);

      if (policySnap.exists()) {
        setLoanPolicy(policySnap.data());
      }
    } catch (error) {
      console.error("Error loading loan policy:", error);
    }
  };

  const saveSettings = async () => {
    try {
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
        maximumDuration: Number(loanPolicy.maximumDuration),
      });

      alert("Loan Policy Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save loan policy.");
    }
  };

  return (
    <AdminLayout>
      <div className="settings-page">

        {/* Header */}

        <div className="settings-header">

          <div>

            <h2>⚙ Settings</h2>

            <p>
              Configure cooperative loan policies and system preferences.
            </p>

          </div>

        </div>

        {/* Loan Policy Card */}

        <div className="glass-card settings-card">

          <h3 className="mb-4">
            🌾 Loan Policy Configuration
          </h3>

          <div className="row">

            <div className="col-md-6 mb-4">

              <label className="form-label">
                Loan Multiplier
              </label>

              <input
                type="number"
                className="form-control"
                value={loanPolicy.loanMultiplier}
                onChange={(e) =>
                  setLoanPolicy({
                    ...loanPolicy,
                    loanMultiplier: Number(e.target.value),
                  })
                }
              />

              <small>
                Maximum Loan = Savings × Loan Multiplier
              </small>

            </div>

            <div className="col-md-6 mb-4">

              <label className="form-label">
                Interest Rate (%)
              </label>

              <input
                type="number"
                className="form-control"
                value={loanPolicy.interestRate}
                onChange={(e) =>
                  setLoanPolicy({
                    ...loanPolicy,
                    interestRate: Number(e.target.value),
                  })
                }
              />

            </div>

            <div className="col-md-6 mb-4">

              <label className="form-label">
                Minimum Savings Required (₦)
              </label>

              <input
                type="number"
                className="form-control"
                value={loanPolicy.minimumSavings}
                onChange={(e) =>
                  setLoanPolicy({
                    ...loanPolicy,
                    minimumSavings: Number(e.target.value),
                  })
                }
              />

            </div>

            <div className="col-md-6 mb-4">

              <label className="form-label">
                Maximum Loan Duration (Months)
              </label>

              <input
                type="number"
                className="form-control"
                value={loanPolicy.maximumDuration}
                onChange={(e) =>
                  setLoanPolicy({
                    ...loanPolicy,
                    maximumDuration: Number(e.target.value),
                  })
                }
              />

            </div>

          </div>

          <button
            className="btn btn-success save-btn"
            onClick={saveSettings}
          >
            💾 Save Loan Policy
          </button>

        </div>

      </div>
    </AdminLayout>
  );
}

export default SettingsPage;