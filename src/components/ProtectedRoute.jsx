import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // -----------------------------------------
  // Loading authentication/user information
  // -----------------------------------------

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "#0a192f",
          color: "#ffffff",
        }}
      >
        <div
          className="spinner-border text-success mb-3"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mb-0">
          Checking your account...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // User is not logged in
  // -----------------------------------------

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // -----------------------------------------
  // No role restriction
  // -----------------------------------------

  if (allowedRoles.length === 0) {
    return children;
  }

  // -----------------------------------------
  // Get user's role
  // -----------------------------------------

  const userRole = user.role;

  // -----------------------------------------
  // User has no role yet
  // -----------------------------------------

  if (!userRole) {
    return <Navigate to="/choose-role" replace />;
  }

  // -----------------------------------------
  // Check permission
  // -----------------------------------------

  if (!allowedRoles.includes(userRole)) {
    // Admin trying to access Member page
    if (userRole === "Admin") {
      return <Navigate to="/admin" replace />;
    }

    // Member trying to access Admin page
    if (userRole === "Member") {
      return <Navigate to="/member" replace />;
    }

    // Unknown role
    return <Navigate to="/choose-role" replace />;
  }

  // -----------------------------------------
  // Authorized
  // -----------------------------------------

  return children;
}

export default ProtectedRoute;