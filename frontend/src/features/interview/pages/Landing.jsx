import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import "../style/landing.scss";
import {
  FiBarChart2,
  FiFileText,
  FiLayers,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import resumePreview from "../../../assests/resume-pic.jpg";

function Landing() {
  const howRef = useRef(null);
  const [howHighlight, setHowHighlight] = useState(false);
  const location = useLocation();

  const scrollToHowItWorks = useCallback(() => {
    howRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHowHighlight(true);
    window.setTimeout(() => setHowHighlight(false), 2200);
  }, []);

  useEffect(() => {
    if (location.hash === "#how-it-works") {
      const t = window.setTimeout(() => scrollToHowItWorks(), 80);
      return () => window.clearTimeout(t);
    }
  }, [location.hash, location.pathname, scrollToHowItWorks]);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="hero-content">
          <p className="eyebrow">Public Home</p>
          <h1>Build ATS-ready resumes and AI interview strategy in one flow.</h1>
          <p>
            Create role-focused resumes, identify skill gaps, and prepare with
            actionable technical + behavioral plans. Designed for fast,
            professional outcomes.
          </p>
          <div className="hero-actions">
            <Link to="/workspace" className="cta primary">
              Go To Workspace
            </Link>
            <button
              type="button"
              className="cta cta-how"
              onClick={scrollToHowItWorks}
            >
              How it works
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="resume-card">
            <FiFileText className="ri" />
            <h3>CV Snapshot</h3>
            <div className="resume-preview-media">
              <img src={resumePreview} alt="Resume design preview" />
            </div>
          </div>
          <div className="chart-card">
            <FiBarChart2 className="ri" />
            <h3>Interview Readiness</h3>
            <p className="readiness-lead">
              Model-style view of fit, depth, and how much prep is left before
              you walk in.
            </p>
            <div className="readiness-body">
              <div className="readiness-donut-wrap">
                <div className="donut" style={{ "--readiness": 72 }} aria-hidden />
                <span className="readiness-donut-label">
                  <strong>72%</strong>
                  <small>overall</small>
                </span>
              </div>
              <ul className="readiness-tracks" aria-label="Readiness breakdown">
                <li>
                  <span className="readiness-track-name">Role alignment</span>
                  <div className="readiness-track-bar">
                    <span style={{ width: "82%" }} />
                  </div>
                  <span className="readiness-track-pct">82%</span>
                </li>
                <li>
                  <span className="readiness-track-name">Question depth</span>
                  <div className="readiness-track-bar">
                    <span style={{ width: "68%" }} />
                  </div>
                  <span className="readiness-track-pct">68%</span>
                </li>
                <li>
                  <span className="readiness-track-name">Prep momentum</span>
                  <div className="readiness-track-bar">
                    <span style={{ width: "74%" }} />
                  </div>
                  <span className="readiness-track-pct">74%</span>
                </li>
              </ul>
            </div>
            <p className="readiness-foot">
              After you generate a report, your real scores and roadmap replace
              this preview.
            </p>
          </div>
        </div>
      </section>

      <section
        ref={howRef}
        id="how-it-works"
        className={`landing-how-wrap ${howHighlight ? "landing-how-wrap--pulse" : ""}`}
        aria-labelledby="how-it-works-title"
      >
        <div className="landing-how-intro">
          <h2 id="how-it-works-title" className="landing-how-title">
            How it works
          </h2>
          <p className="landing-how-lead">
            From upload to interview-ready: a clear path. Scroll here anytime
            from the button above to see the full flow.
          </p>
        </div>

        <div className="landing-info landing-info-grid">
          <article>
            <FiLayers className="ri" />
            <h4>Infographic Workflow</h4>
            <p>
              Upload resume {"->"} map role {"->"} generate report {"->"} prepare
              smartly.
            </p>
          </article>
          <article>
            <FiTarget className="ri" />
            <h4>AI-Powered Insights</h4>
            <p>Match score, question bank, and roadmap with practical guidance.</p>
          </article>
          <article>
            <FiBarChart2 className="ri" />
            <h4>Clean Professional UX</h4>
            <p>Minimal interface with strong typography and focused actions.</p>
          </article>
        </div>

        <div className="landing-how-steps">
          <h3 className="landing-how-steps-heading">
            <FiZap className="ri" aria-hidden />
            Your flow, step by step
          </h3>
          <ol className="landing-how-step-list">
            <li>
              <span className="step-num">1</span>
              <div>
                <strong>Sign in or register</strong>
                <p>
                  Create a free account so your reports and downloads stay tied
                  to you.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Open the workspace</strong>
                <p>
                  Paste the job description, upload your resume PDF, and add a
                  short self-summary.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Generate with AI</strong>
                <p>
                  The app builds technical & behavioral questions, a match
                  score, skill gaps, and a prep roadmap.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">4</span>
              <div>
                <strong>Study & export</strong>
                <p>
                  Use the report tabs to prepare, then download your AI-shaped
                  resume as PDF when you are ready.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

export default Landing;
