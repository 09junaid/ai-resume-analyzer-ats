import React, { useState } from "react";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import AppLoader from "../../../components/common/AppLoader";
function Login() {
  const { loading, handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
    navigate("/workspace");
  };
  if (loading)
    return (
      <AppLoader
        title="Signing you in"
        subtitle="Securing your session and loading workspace context..."
      />
    );
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-intro">
          <p className="auth-eyebrow">Secure access</p>
          <h1>Welcome back</h1>
          <p className="auth-copy">
            Sign in to continue managing your resume workflow with a clean,
            reliable workspace.
          </p>
          <div className="auth-highlights">
            <div className="auth-highlight">
              <span className="highlight-title">Focused dashboard</span>
              <span className="highlight-copy">
                Keep your documents, edits, and progress in one place.
              </span>
            </div>
            <div className="auth-highlight">
              <span className="highlight-title">Protected account</span>
              <span className="highlight-copy">
                Your sign-in flow is designed for clarity and confidence.
              </span>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="form-heading">
            <h2>Login</h2>
            <p>Use your email and password to access your account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="primary-button">
              Sign in
            </button>

            <p className="form-footer">
              New here? <a href="/register">Create an account</a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;
