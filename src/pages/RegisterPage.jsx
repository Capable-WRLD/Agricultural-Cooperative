import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendVerificationEmail } from "../services/emailService";
import { toast } from "react-toastify";
import "../styles/RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
const handleSubmit = async (e) => {
  e.preventDefault();
    setLoading(true);

  if (
    password.length < 8 ||
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    toast.warning(
  "Password must be at least 8 characters and contain letters and numbers."
);
    
    setLoading(false);
    return;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP temporarily
  sessionStorage.setItem("verificationOTP", otp);

  // Save registration details temporarily
  sessionStorage.setItem(
    "registrationData",
    JSON.stringify({
      fullName,
      email,
      phone,
      password,
    })
  );

  try {
    const result = await sendVerificationEmail(
      email,
      fullName,
      otp
    );

    if (!result.success) {
  setLoading(false);
  toast.error("Failed to send verification email.");
  return;
}

    toast.success("Verification code has been sent to your email.");
    setLoading(false);
    navigate("/verify-email");

  } catch (error) {
  setLoading(false);
  toast.error(error.message);
}
  
};


  return (
    <div className="register-page">
      <div className="register-container">

        {/* LEFT SIDE */}

        <div className="register-left">

          <div className="register-brand">
            🌾 AgroCoop
          </div>

          <h1 className="register-title">
            Create Your Account
          </h1>

          <p className="register-subtitle">
            Join the Agricultural Cooperative Platform
          </p>

          <form onSubmit={handleSubmit}>

            <input
              className="form-control mb-3"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="form-control mb-3"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
  className="btn btn-success w-100"
  type="submit"
  disabled={loading}
>
  {loading ? (
    <>
      <span
        className="spinner-border spinner-border-sm me-2"
        role="status"
      ></span>
      Sending Verification Code...
    </>
  ) : (
    "Create Account"
  )}
</button>

          </form>

          <p className="mt-4 text-center">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

        </div>

        {/* RIGHT SIDE */}

        <div className="register-right">

          <div className="register-preview">

            <h2>
              Smart Agricultural Management
            </h2>

            <p>
              Manage members, savings, loans, inventory and reports from one
              platform.
            </p>

            <div className="register-stats">

              <div>
                <h3>500+</h3>
                <span>Members</span>
              </div>

              <div>
                <h3>₦10M</h3>
                <span>Savings</span>
              </div>

              <div>
                <h3>300+</h3>
                <span>Loans</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default RegisterPage;