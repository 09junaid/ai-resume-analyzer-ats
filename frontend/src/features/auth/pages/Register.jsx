import React, { useState } from "react";
import "../auth.form.scss";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import AppLoader from "../../../components/common/AppLoader";

function Register() {
  const { loading, handleRegister } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({ username, email, password });
    navigate("/workspace");
  };
  if (loading)
    return (
      <AppLoader
        title="Creating your account"
        subtitle="Setting up your profile and preparing secure access..."
      />
    );
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-intro">
          <p className="auth-eyebrow">Create account</p>
          <h1>Start strong</h1>
          <p className="auth-copy">
            Build your account to organize resume drafts, track progress, and
            keep your work ready for the next opportunity.
          </p>
          <div className="auth-highlights">
            <div className="auth-highlight">
              <span className="highlight-title">Structured setup</span>
              <span className="highlight-copy">
                Create a workspace designed to keep your profile and documents
                organized from day one.
              </span>
            </div>
            <div className="auth-highlight">
              <span className="highlight-title">Ready for growth</span>
              <span className="highlight-copy">
                Set up once, then keep refining your resume flow with clarity.
              </span>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="form-heading">
            <h2>Register</h2>
            <p>Create your account to begin managing your resume workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="fullName">Full name</label>
              <input
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="primary-button">
              Create account
            </button>

            <p className="form-footer">
              Already have an account? <a href="/login">Sign in</a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Register;
