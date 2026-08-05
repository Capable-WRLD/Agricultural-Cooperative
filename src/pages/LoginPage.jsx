import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, signInWithGoogle } from "../services/authService";
import { toast } from "react-toastify";

import { getUserData } from "../services/userService";
import "../styles/LoginPage.css";

function LoginPage() {
const navigate = useNavigate();

const [showPassword, setShowPassword] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
e.preventDefault();
setLoading(true);

try {
  const userCredential = await loginUser(email, password);

  const uid = userCredential.user.uid;

  const userData = await getUserData(uid);
  

  toast.success("Login Successful");

  if (userData.role === "Admin") {
    navigate("/admin");
  } else {
    navigate("/member");
  }

} catch (error) {
  setLoading(false);
  if (error.code === "auth/wrong-password") {
    toast.error("Incorrect password");
  } else if (error.code === "auth/user-not-found") {
    toast.error("No account found with this email");
  } else if (error.code === "auth/invalid-credential") {
    toast.error("Invalid email or password");
  } else {
    toast.error(error.message);
  }
}


};

const handleGoogleLogin = async () => {
try {
await signInWithGoogle();
toast.success("Google Login Successful");
navigate("/member");
} catch (error) {
  if (error.code === "auth/wrong-password") {
    toast.error("Incorrect password");
  } else if (error.code === "auth/user-not-found") {
    toast.error("No account found with this email");
  } else if (error.code === "auth/invalid-credential") {
    toast.error("Invalid email or password");
  } else {
    toast.error(error.message);
  }
}
};

return ( <div className="login-page"> <div className="login-container">

```
    <div className="login-left">

      <div className="login-brand">
        🌾 AgroCoop
      </div>

      <h1 className="login-title">
        Log in to your Account
      </h1>

      <p className="login-subtitle">
        Welcome back. Access your cooperative dashboard.
      </p>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-wrapper">

          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="show-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>

        </div>

        <button
  type="submit"
  className="btn btn-success w-100 mt-4"
  disabled={loading}
>
  {loading ? (
    <>
      <span
        className="spinner-border spinner-border-sm me-2"
        role="status"
      ></span>
      Logging In...
    </>
  ) : (
    "Login"
  )}
</button>

      </form>

      <button
        type="button"
        className="btn btn-light w-100 mt-3"
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </button>

      <p className="register-link mt-4">
        Don't have an account?

        <Link to="/register">
          {" "}Create Account
        </Link>

      </p>

    </div>

    <div className="login-right">

      <div className="dashboard-preview">

        <h2>
          Agricultural Cooperative Platform
        </h2>

        <p>
          Manage savings, loans, inventory and
          members from one intelligent system.
        </p>

        <div className="preview-stats">

          <div>
            <h3>250+</h3>
            <span>Members</span>
          </div>

          <div>
            <h3>₦5M</h3>
            <span>Savings</span>
          </div>

          <div>
            <h3>120</h3>
            <span>Loans</span>
          </div>

        </div>

      </div>

    </div>

  </div>
</div>


);
}

export default LoginPage;
