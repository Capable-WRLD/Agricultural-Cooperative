import React from "react";

function UnderDevelopment({ title }) {
  return (
    <div
      style={{
        padding: "40px 20px",
        minHeight: "100vh",
        background: "#071d11",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          padding: "40px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ color: "#fff", marginBottom: "16px" }}>{title}</h1>
        <p style={{ color: "#d6d6d6", lineHeight: 1.8 }}>
          This section is under development. The feature is not ready yet, but it will be available soon.
        </p>
        <div
          style={{
            marginTop: "24px",
            padding: "18px",
            borderRadius: "16px",
            background: "rgba(40, 167, 69, 0.12)",
            color: "#e9f8ea",
          }}
        >
          Please use the Dashboard and Members pages for now.
        </div>
      </div>
    </div>
  );
}

export default UnderDevelopment;