import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">

      <div className="container">

        <Link className="navbar-brand fw-bold text-success" to="/">
          🌾 AgroCoop
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >

          <ul className="navbar-nav mx-auto">

            <li className="nav-item">
              <a className="nav-link" href="#home">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#about">
                About
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#features">
                Features
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#contact">
                Contact
              </a>
            </li>

          </ul>

          <div>

            <Link
              to="/login"
              className="btn btn-outline-success me-2"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn btn-success"
            >
              Register
            </Link>

          </div>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;