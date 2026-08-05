import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";
import { saveUserData } from "../services/userService";
import { toast } from "react-toastify";

function VerifyEmail() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const savedOTP = sessionStorage.getItem("verificationOTP");

    // Verify OTP
    if (otp !== savedOTP) {
      toast.error("Invalid verification code.");
      return;
    }

    setLoading(true);

    try {
      // Get registration data
      const registrationData = JSON.parse(
        sessionStorage.getItem("registrationData")
      );

      if (!registrationData) {
        toast.error("Registration data not found.");
        setLoading(false);
        return;
      }

      const { fullName, email, phone, password } = registrationData;

      console.log("STEP 1");

      // Create Firebase Authentication account
      const userCredential = await registerUser(email, password);

      console.log("STEP 2");

      const uid = userCredential.user.uid;

      console.log("STEP 3");

      // Save user in Firestore
      await saveUserData(uid, {
        fullName,
        email,
        phone,
        role: null,
        status: "New",
        organizationId: null,
        organizationName: null,
        createdAt: new Date().toISOString(),
      });

      console.log("STEP 4");

      // Clear temporary session data
      sessionStorage.removeItem("verificationOTP");
      sessionStorage.removeItem("registrationData");

      toast.success("Email verified successfully!");

      navigate("/choose-role");

    } catch (error) {
      setLoading(false);

      console.error("FAILED HERE");
      console.error(error);

      toast.error(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <div
        className="card shadow p-4 mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <h2 className="text-center text-success">
          Verify Your Email
        </h2>

        <p className="text-center">
          Enter the 6-digit verification code sent to your email.
        </p>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter Verification Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn btn-success w-100"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;