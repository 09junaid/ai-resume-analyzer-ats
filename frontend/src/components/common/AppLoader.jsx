import React from "react";
import "./app-loader.scss";

function AppLoader({
  title = "Preparing your workspace",
  subtitle = "Syncing your session and loading smart content...",
}) {
  return (
    <main className="app-loader-page" aria-live="polite" aria-busy="true">
      <section className="app-loader-card">
        <div className="app-loader-ring" aria-hidden>
          <span className="loader-core" />
        </div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className="loader-bars" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}

export default AppLoader;
