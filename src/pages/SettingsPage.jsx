import { useState } from "react";

function SettingsPage() {
  const [interestRate, setInterestRate] = useState("10");

  const saveSettings = () => {
    alert("Settings Saved");
  };

  return (
    <div className="container mt-4">
      <h2>Settings</h2>

      <div className="glass-card p-4 mt-3">

        <label className="form-label">
          Loan Interest Rate (%)
        </label>

        <input
          type="number"
          className="form-control mb-3"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />

        <button
          className="btn btn-success"
          onClick={saveSettings}
        >
          Save Settings
        </button>

      </div>
    </div>
  );
}

export default SettingsPage;