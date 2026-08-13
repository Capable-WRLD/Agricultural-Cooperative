import { useState, useEffect } from "react";
// AdminLayout is applied by routes in App.jsx; avoid double-wrapping here
import "../styles/SettingsPage.css";

import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

function SettingsPage() {
  const [organizationId, setOrganizationId] = useState(null);

  const [loanPolicy, setLoanPolicy] = useState({
    interestRate: 10,
    loanMultiplier: 2,
    minimumSavings: 50000,
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
        const data = userSnap.data();
        const orgId = data.organizationId;
        setOrganizationId(orgId || null);

        if (orgId) {
          // loan policy
          const policyRef = doc(db, "organizations", orgId, "loanPolicy", "currentPolicy");
          const policySnap = await getDoc(policyRef);
          if (policySnap.exists()) setLoanPolicy(policySnap.data());

          // payment settings
          const payRef = doc(db, "organizations", orgId, "paymentSettings", "default");
          const paySnap = await getDoc(payRef);
          if (paySnap.exists()) setPaymentSettings(paySnap.data());
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const saveSettings = async () => {
    if (!organizationId) {
      toast.error("No organization selected");
      return;
    }

    try {
      const policyRef = doc(db, "organizations", organizationId, "loanPolicy", "currentPolicy");
      await setDoc(policyRef, {
        interestRate: Number(loanPolicy.interestRate),
        loanMultiplier: Number(loanPolicy.loanMultiplier),
        minimumSavings: Number(loanPolicy.minimumSavings),
        maximumDuration: Number(loanPolicy.maximumDuration),
      });

      const payRef = doc(db, "organizations", organizationId, "paymentSettings", "default");
      await setDoc(payRef, paymentSettings);

      toast.success("Settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="settings-page">

      {/* Header */}

      <div className="settings-header">

        <div>

          <h2>⚙ Settings</h2>

          <p>
            Configure cooperative loan policies and payment details.
          </p>

        </div>

      </div>

      {/* Loan Policy Card */}

      <div className="glass-card settings-card">

        <h3 className="mb-4">🌾 Loan Policy Configuration</h3>

        <div className="row">

          <div className="col-md-6 mb-4">

            <label className="form-label">Loan Multiplier</label>

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

            <small>Maximum Loan = Savings × Loan Multiplier</small>

          </div>

          <div className="col-md-6 mb-4">

            <label className="form-label">Interest Rate (%)</label>

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

            <label className="form-label">Minimum Savings Required (₦)</label>

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

            <label className="form-label">Maximum Loan Duration (Months)</label>

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

        <h3 className="mb-4 mt-4">🏦 Payment Account Details</h3>

        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Bank Name</label>
            <input className="form-control" value={paymentSettings.bankName} onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Account Name</label>
            <input className="form-control" value={paymentSettings.accountName} onChange={(e) => setPaymentSettings({ ...paymentSettings, accountName: e.target.value })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Account Number</label>
            <input className="form-control" value={paymentSettings.accountNumber} onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })} />
          </div>
          <div className="col-md-12 mb-3">
            <label className="form-label">Payment Instructions</label>
            <textarea className="form-control" rows={4} value={paymentSettings.paymentInstructions} onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentInstructions: e.target.value })} />
          </div>
        </div>

        <button className="btn btn-success save-btn" onClick={saveSettings}>💾 Save Settings</button>

      </div>

    </div>
  );
}

export default SettingsPage;