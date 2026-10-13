import React from 'react';

export default function Header({ apiHealth, onReset }) {
  return (
    <header className="app-header fade-in">
      <div className="brand-badge">
        <span className="pulse-dot" />
        College Internship Edition
      </div>

      <h1 className="brand-title" onClick={onReset} style={{ cursor: 'pointer' }} title="Click to restart quiz generator">
        <span>🧠</span> AI Quiz Generator
      </h1>

      <p className="brand-subtitle">
        Generate customized 5-question multiple choice assessments with instant scoring, comprehensive explanations, and personalized revision roadmaps.
      </p>

      <div className="header-status-bar">
        {apiHealth.checking ? (
          <span className="status-indicator">
            <span className="dot" style={{ background: '#94a3b8' }} /> Checking Backend...
          </span>
        ) : apiHealth.connected ? (
          <span className={`status-indicator ${apiHealth.hasApiKey ? 'connected' : 'warning'}`}>
            <span className="dot" />
            {apiHealth.hasApiKey ? 'Gemini AI Engine Active' : 'Offline Educational Engine (Demo Mode)'}
          </span>
        ) : (
          <span className="status-indicator warning">
            <span className="dot" /> Backend Disconnected (Ensure server is running on port 5000)
          </span>
        )}

        <span className="status-indicator">
          <span>⚡</span> 5 Questions • 4 Choices • Instant Feedback
        </span>
      </div>
    </header>
  );
}
