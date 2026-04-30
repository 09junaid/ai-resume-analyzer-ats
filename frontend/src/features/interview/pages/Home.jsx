import React, { useEffect, useRef, useState } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import {
  FiActivity,
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiCpu,
  FiFileText,
  FiLayers,
  FiTarget,
  FiUpload,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";
function Home() {
  const { generateReport, reports, getReports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeInputRef = useRef(null);
  const hasFetchedReportsRef = useRef(false);
  const navigate = useNavigate();

  const isFormComplete =
    jobDescription.trim() &&
    selfDescription.trim() &&
    resumeFile;

  useEffect(() => {
    if (hasFetchedReportsRef.current) return;
    hasFetchedReportsRef.current = true;
    getReports();
  }, [getReports]);

  const handleGenerateReport = async () => {
    if (!isFormComplete) return;

    setIsGenerating(true);
    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      if (data?._id) navigate(`/interview/${data._id}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const handleChooseResume = () => {
    resumeInputRef.current?.click();
  };

  return (
    <main className="home-page">
      {isGenerating && (
        <div className="ai-loading-overlay">
          <div className="ai-loading-panel">
            <div className="ai-core" />
            <h2>AI is crafting your interview report</h2>
            <p>Analyzing resume, role alignment, and preparation strategy...</p>
            <div className="loading-bars">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      )}

      <section className="home-shell">
        <header className="home-back-header">
          <button
            type="button"
            className="home-back-btn"
            onClick={() => navigate("/")}
          >
            <FiArrowLeft className="ri" aria-hidden />
            Back to home
          </button>
        </header>

        <section className="home-topbar">
          <div className="brand-chip">
            <span className="dot" />
            <p>Resume Interview Copilot</p>
          </div>
          <div className="quick-stats">
            <div>
              <FiActivity className="ri" />
              <strong>AI</strong>
              <span>Smart Analysis</span>
            </div>
            <div>
              <FiTarget className="ri" />
              <strong>1:1</strong>
              <span>Role Mapping</span>
            </div>
            <div>
              <FiCalendar className="ri" />
              <strong>5D</strong>
              <span>Prep Plan</span>
            </div>
          </div>
        </section>

        <section className="home-layout">
          <section className="left-stack">
            <article className="hero-panel">
              <p className="home-eyebrow">AI Interview Planner</p>
              <h1>Design your interview strategy before the interview starts.</h1>
              <p className="home-copy">
                Feed the role details and your profile once. Get technical and
                behavioral question sets, match score insights, and a practical
                roadmap to prepare with clarity.
              </p>

              <div className="feature-row">
                <div className="feature-pill">
                  <FiCpu className="ri" />
                  <span>01</span>
                  <p>Question Intelligence</p>
                </div>
                <div className="feature-pill">
                  <FiBarChart2 className="ri" />
                  <span>02</span>
                  <p>Skill Gap Detection</p>
                </div>
                <div className="feature-pill">
                  <FiClock className="ri" />
                  <span>03</span>
                  <p>Execution Roadmap</p>
                </div>
              </div>

            </article>
          </section>

          <section className="right-stack">
            <section className="compose-card">
              <header className="compose-head">
                <h2>Compose Input</h2>
                <p>Upload your resume first, then complete both text sections below.</p>
              </header>

              <div className="compose-stack">
                <label className="field-group upload-field compose-upload" htmlFor="resume">
                  <span>
                    <FiUpload className="ri" />
                    Resume PDF
                  </span>
                  <input
                    className="resume-file-input"
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf"
                    ref={resumeInputRef}
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    className="resume-upload-surface"
                    onClick={handleChooseResume}
                  >
                    <div className="resume-upload-icon">
                      <FiUpload aria-hidden />
                    </div>
                    <div className="resume-upload-text">
                      <strong>
                        {resumeFile ? "Resume selected" : "Upload your resume PDF"}
                      </strong>
                      <span>
                        {resumeFile
                          ? "Choose a different file if you want to replace it."
                          : "Tap to browse and attach a PDF from your device."}
                      </span>
                    </div>
                  </button>
                  <small>Upload clean PDF under 5MB.</small>
                  {resumeFile ? (
                    <div className="resume-chip">
                      <div className="resume-chip-meta">
                        <span className="resume-chip-name">{resumeFile.name}</span>
                        <span className="resume-chip-size">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={handleRemoveResume}
                        aria-label="Remove uploaded PDF"
                      >
                        <FiX aria-hidden />
                      </button>
                    </div>
                  ) : null}
                </label>

                <div className="compose-grid">
                  <label className="field-group" htmlFor="selfDescription">
                    <span>
                      <FiUser className="ri" />
                      Self Description
                    </span>
                    <textarea
                      onChange={(e) => setSelfDescription(e.target.value)}
                      id="selfDescription"
                      name="selfDescription"
                      placeholder="Highlight your strengths, project impact, and target role orientation..."
                    />
                  </label>

                  <label className="field-group field-group-large" htmlFor="jobDescription">
                    <span>
                      <FiFileText className="ri" />
                      Job Description
                    </span>
                    <textarea
                      onChange={(e) => setJobDescription(e.target.value)}
                      name="jobDescription"
                      id="jobDescription"
                      placeholder="Paste role responsibilities, required skills, domain context, and expectations..."
                    />
                  </label>
                </div>

                <button
                  className="generate-btn"
                  onClick={handleGenerateReport}
                  disabled={!isFormComplete || isGenerating}
                >
                  <FiZap className="ri" />
                  Generate With AI
                </button>
              </div>
            </section>
          </section>
        </section>

        <section className="recent-reports" aria-labelledby="recent-reports-heading">
          <div className="recent-head">
            <div className="recent-head-text">
              <h2 id="recent-reports-heading">Recent Reports</h2>
              <p>Open any report to continue prep or download your AI resume.</p>
            </div>
            {reports?.length ? (
              <span className="recent-count">
                <FiLayers className="ri" aria-hidden />
                {reports.length} saved
              </span>
            ) : null}
          </div>
          {reports?.length ? (
            <div className="recent-grid">
              {reports.map((item) => {
                const score = Number(item.matchScore) || 0;
                return (
                  <button
                    className="recent-card"
                    key={item._id}
                    type="button"
                    onClick={() => navigate(`/interview/${item._id}`)}
                  >
                    <div className="recent-card-top">
                      <span className="recent-id">Report · {String(item._id).slice(-6)}</span>
                      <FiChevronRight className="recent-chevron" aria-hidden />
                    </div>
                    <div className="recent-card-mid">
                      <span className="recent-score-label">Match score</span>
                      <div className="recent-score-wrap">
                        <span className="recent-score-value">{score}</span>
                        <span className="recent-score-track" aria-hidden>
                          <span
                            className="recent-score-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, score))}%`,
                            }}
                          />
                        </span>
                      </div>
                    </div>
                    <p className="recent-date">
                      <FiClock className="ri" aria-hidden />
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="recent-empty-wrap">
              <p className="recent-empty">No reports yet. Generate your first one above.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Home;
