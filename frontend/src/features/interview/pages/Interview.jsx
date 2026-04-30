import React, { useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate, useParams } from "react-router";
import {
  FiArrowLeft,
  FiAward,
  FiBookmark,
  FiCalendar,
  FiDownload,
  FiList,
  FiMessageSquare,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import AppLoader from "../../../components/common/AppLoader";

const TAB_META = {
  technical: {
    num: "01",
    title: "Technical assessment",
    subtitle:
      "Role-aligned prompts with interviewer intent and structured answer guidance.",
  },
  behavioral: {
    num: "02",
    title: "Behavioral assessment",
    subtitle:
      "STAR-ready themes, collaboration signals, and communication expectations.",
  },
  roadmap: {
    num: "03",
    title: "Preparation roadmap",
    subtitle:
      "A focused day-by-day plan to reach interview readiness with clarity.",
  },
};

function InterviewQuestionList({ items, emptyMessage, listKey }) {
  return (
    <div className="report-prose-list">
      {items.length ? (
        items.map((item, index) => (
          <article
            className="report-item"
            key={`${listKey}-${item.question}-${index}`}
          >
            <span className="report-item-index">
              Item {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="report-item-question">{item.question}</h3>
            <div className="report-item-block">
              <span className="report-item-label">Interviewer intent</span>
              <p>{item.intention}</p>
            </div>
            <div className="report-item-block">
              <span className="report-item-label">Recommended response</span>
              <p>{item.answer}</p>
            </div>
          </article>
        ))
      ) : (
        <p className="empty-state">{emptyMessage}</p>
      )}
    </div>
  );
}

function Interview() {
  const [activeTab, setActiveTab] = useState("technical");
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const { report, fetchReportById, loading, getResumePdf } = useInterview();
  const technicalQuestions = report?.technicalQuestions || [];
  const behavioralQuestions = report?.behavioralQuestions || [];
  const preparationPlan = report?.preparationPlan || [];
  const skillGaps = report?.skillGaps || [];
  const score = Number(report?.matchScore) || 0;

  const reportRef = String(report?._id || interviewId || "").slice(-8);
  const verdict =
    score >= 85
      ? { label: "Strong fit", className: "is-strong" }
      : score >= 65
        ? { label: "Competitive", className: "is-mid" }
        : { label: "Build readiness", className: "is-build" };
  const generatedLabel = report?.createdAt
    ? new Date(report.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  useEffect(() => {
    if (!interviewId) {
      return;
    }

    if (report?._id === interviewId) {
      return;
    }

    fetchReportById(interviewId);
  }, [fetchReportById, interviewId, report?._id]);

  if (loading && !report?._id) {
    return (
      <main className="interview-page">
        <div className="interview-shell">
          <header className="interview-back-header">
            <button
              type="button"
              className="interview-back-btn"
              onClick={() => navigate("/workspace")}
            >
              <FiArrowLeft className="ri" aria-hidden />
              Back to workspace
            </button>
          </header>
        </div>
        <AppLoader
          title="Loading interview report"
          subtitle="Collecting AI questions, score insights, and your prep roadmap..."
        />
      </main>
    );
  }

  const section = TAB_META[activeTab];

  return (
    <main className="interview-page">
      <div className="interview-shell">
        <header className="interview-back-header">
          <button
            type="button"
            className="interview-back-btn"
            onClick={() => navigate("/workspace")}
          >
            <FiArrowLeft className="ri" aria-hidden />
            Back to workspace
          </button>
        </header>

        <section className="report-cover" aria-labelledby="report-doc-title">
          <div className="report-cover-top">
            <div className="report-cover-brand">
              <p className="report-doc-eyebrow">
                Interview readiness · AI report
              </p>
              <h1 id="report-doc-title" className="report-doc-title">
                Role preparation report
              </h1>
              <div className="report-doc-meta">
                <span className="report-meta-pill">
                  Ref <strong>#{reportRef || "—"}</strong>
                </span>
                {generatedLabel ? (
                  <span className="report-meta-pill">
                    <FiCalendar className="ri meta-icon" aria-hidden />
                    {generatedLabel}
                  </span>
                ) : null}
                <span className="report-meta-pill report-meta-muted">
                  Confidential
                </span>
              </div>
            </div>
            <button
              className="report-download-btn"
              type="button"
              disabled={pdfDownloading}
              onClick={async () => {
                if (!interviewId || pdfDownloading) return;
                setPdfDownloading(true);
                try {
                  await getResumePdf(interviewId);
                } catch {
                  /* error logged in hook */
                } finally {
                  setPdfDownloading(false);
                }
              }}
            >
              {pdfDownloading ? (
                <span className="download-btn-spinner" aria-hidden />
              ) : (
                <FiDownload className="ri" aria-hidden />
              )}
              {pdfDownloading ? "Preparing PDF…" : "Export AI resume (PDF)"}
            </button>
          </div>
        </section>

        <section
          className="report-executive-band"
          aria-labelledby="exec-summary-title"
        >
          <div className="report-executive-panel">
            <header className="report-executive-head">
              <div className="report-executive-icon" aria-hidden>
                <FiBookmark className="ri" />
              </div>
              <p id="exec-summary-title" className="report-executive-eyebrow">
                Executive summary
              </p>
            </header>

            <div className="report-executive-grid">
              <div className="report-exec-score">
                <div className="report-score-card report-score-card--band">
                  <div className="report-score-card-head">
                    <p className="report-score-label">Role match score</p>
                    <span className={`report-verdict ${verdict.className}`}>
                      {verdict.label}
                    </span>
                  </div>
                  <div className="score-ring" style={{ "--score": score }}>
                    <div className="score-ring-inner">
                      <FiAward className="ri score-icon" aria-hidden />
                      <strong>{score}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-exec-gaps">
                <div className="report-aside-block report-aside-block-gaps">
                  <div className="report-aside-block-head">
                    <h3 className="report-aside-heading">
                      Priority skill gaps
                    </h3>
                    <span className="report-aside-count">
                      {skillGaps.length} flagged
                    </span>
                  </div>
                  {skillGaps.length ? (
                    <div className="report-exec-gaps-scroll">
                      <ul className="report-gap-list">
                        {skillGaps.map((item, index) => (
                          <li
                            className="report-gap-row"
                            key={`${item.skill}-${index}`}
                          >
                            <span className="report-gap-idx">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="report-gap-name">
                              {item.skill}
                            </span>
                            <FiTrendingUp
                              className="ri report-gap-icon"
                              aria-hidden
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="report-aside-empty">
                      No gaps surfaced — still review questions for edge cases.
                    </p>
                  )}
                </div>
              </div>

              <div className="report-exec-inventory">
                <div className="report-aside-block report-aside-block-inventory">
                  <div className="report-aside-block-head">
                    <h3 className="report-aside-heading">Report inventory</h3>
                  </div>
                  <dl className="report-dl report-dl-fine">
                    <div>
                      <dt>
                        <span className="report-dl-dot" aria-hidden />
                        Technical prompts
                      </dt>
                      <dd>{technicalQuestions.length}</dd>
                    </div>
                    <div>
                      <dt>
                        <span className="report-dl-dot" aria-hidden />
                        Behavioral prompts
                      </dt>
                      <dd>{behavioralQuestions.length}</dd>
                    </div>
                    <div>
                      <dt>
                        <span className="report-dl-dot" aria-hidden />
                        Roadmap days
                      </dt>
                      <dd>{preparationPlan.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="report-layout">
          <div className="report-main">
            <nav className="report-tabs" aria-label="Report sections">
              <button
                type="button"
                className={`report-tab ${activeTab === "technical" ? "is-active" : ""}`}
                onClick={() => setActiveTab("technical")}
              >
                <span className="report-tab-num">01</span>
                <span className="report-tab-text">
                  <span className="report-tab-title">Technical</span>
                  <span className="report-tab-hint">Stack & depth</span>
                </span>
                <FiTarget className="ri report-tab-icon" aria-hidden />
              </button>
              <button
                type="button"
                className={`report-tab ${activeTab === "behavioral" ? "is-active" : ""}`}
                onClick={() => setActiveTab("behavioral")}
              >
                <span className="report-tab-num">02</span>
                <span className="report-tab-text">
                  <span className="report-tab-title">Behavioral</span>
                  <span className="report-tab-hint">Stories & signals</span>
                </span>
                <FiMessageSquare className="ri report-tab-icon" aria-hidden />
              </button>
              <button
                type="button"
                className={`report-tab ${activeTab === "roadmap" ? "is-active" : ""}`}
                onClick={() => setActiveTab("roadmap")}
              >
                <span className="report-tab-num">03</span>
                <span className="report-tab-text">
                  <span className="report-tab-title">Roadmap</span>
                  <span className="report-tab-hint">Daily prep plan</span>
                </span>
                <FiList className="ri report-tab-icon" aria-hidden />
              </button>
            </nav>

            <article className="report-sheet">
              <header className="report-section-head">
                <span className="report-section-kicker">
                  Section {section.num}
                </span>
                <h2 className="report-section-title">{section.title}</h2>
                <p className="report-section-lead">{section.subtitle}</p>
              </header>

              <div className="report-body-scroll" key={activeTab}>
                {activeTab === "technical" && (
                  <InterviewQuestionList
                    items={technicalQuestions}
                    emptyMessage="No technical questions in this report."
                    listKey="technical"
                  />
                )}

                {activeTab === "behavioral" && (
                  <InterviewQuestionList
                    items={behavioralQuestions}
                    emptyMessage="No behavioral questions in this report."
                    listKey="behavioral"
                  />
                )}

                {activeTab === "roadmap" && (
                  <div className="report-prose-list report-prose-list-roadmap">
                    {preparationPlan.length ? (
                      preparationPlan.map((item, index) => (
                        <article
                          className="report-item report-item-roadmap"
                          key={`${item.day}-${index}`}
                        >
                          <div className="report-roadmap-day">
                            Day {item.day}
                          </div>
                          <h3 className="report-roadmap-focus-label">Focus</h3>
                          <p className="report-roadmap-focus">{item.focus}</p>
                        </article>
                      ))
                    ) : (
                      <p className="empty-state">No roadmap in this report.</p>
                    )}
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Interview;
