import { Link, useNavigate } from "react-router";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../features/auth/hooks/useAuth";
import "./site-header.scss";

export default function SiteHeader() {
  const navigate = useNavigate();
  const { user, loading: authLoading, handleLogout } = useAuth();

  const onLogout = async () => {
    await handleLogout();
    navigate("/");
  };

  return (
    <div className="site-header-outer">
      <header className="landing-nav">
        <Link to="/" className="landing-brand-link">
          <div className="landing-brand">
            <span className="brand-dot" />
            <p>ResumeAI Studio</p>
          </div>
        </Link>
        <nav>
          <Link to="/#how-it-works" className="nav-link ghost nav-link-how">
            How it works
          </Link>
          {authLoading ? (
            <span className="nav-auth-loading" aria-hidden />
          ) : user ? (
            <>
              <Link to="/workspace" className="nav-link primary">
                Workspace
              </Link>
              <button
                type="button"
                className="nav-link logout"
                onClick={onLogout}
              >
                <FiLogOut className="ri nav-icon" aria-hidden />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link ghost">
                Register
              </Link>
              <Link to="/workspace" className="nav-link primary">
                Start Now
              </Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}
