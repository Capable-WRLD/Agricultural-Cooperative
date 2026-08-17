import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/LoginPage.css";

import { loginUser } from "../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // Attempt Firebase email/password sign-in
      const userCredential = await loginUser(email.trim(), password);

      const uid = userCredential.user?.uid;

      // Try load user profile from Firestore to determine role
      if (uid) {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          const role = data.role;

          if (role === "Admin") {
            navigate("/admin", { replace: true });
            return;
          }

          if (role === "Member") {
            navigate("/member", { replace: true });
            return;
          }

          // No role yet — go to choose role
          navigate("/choose-role", { replace: true });
          return;
        }
      }

      // Fallback: if no Firestore profile, navigate to choose-role
      navigate("/choose-role", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">🌾 AgroCoop</div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access your dashboard.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mb-3"
              required
            />

            <div className="password-wrapper">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control mb-3"
                required
              />
            </div>

            <button className="btn btn-success w-100" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="register-link">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>

        <div className="login-right">
          <div className="dashboard-preview">
            <h2>AgroCoop Dashboard</h2>
            <p>Manage your cooperative — members, savings and loans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
