import React, { useState } from 'react'
import UploadSection from '../components/UploadSection.jsx'
import ResultCard from '../components/ResultCard.jsx'

function Home() {
  const [result, setResult] = useState(null)

  const handleResult = (data) => {
    setResult(data)
    window.scrollTo({ top: document.getElementById('result')?.offsetTop - 80 || 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setResult(null)
    window.scrollTo({ top: document.getElementById('upload')?.offsetTop - 80 || 0, behavior: 'smooth' })
  }

  return (
    <main className="home">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          AI Model Active — DeepFake
        </div>
        <h1 className="hero-title">
          Detect <span className="gradient-text">DeepFakes</span>
          <br />with Neural Precision
        </h1>
        <p className="hero-sub">
          Upload any image or video and our XceptionNet model will analyze facial
          patterns to determine if the media has been artificially generated or manipulated.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">99.3%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <div className="stat-value">&lt;2s</div>
            <div className="stat-label">Analysis time</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <div className="stat-value">Face AI</div>
            <div className="stat-label">Powered by</div>
          </div>
        </div>
      </section>

      {/* ── Upload / Result ──────────────────────────────── */}
      <div className="content-area">
        {!result ? (
          <UploadSection onResult={handleResult} />
        ) : (
          <div id="result">
            <ResultCard result={result} onReset={handleReset} />
          </div>
        )}
      </div>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">
          Three steps from upload to verdict, powered by deep learning
        </p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="3" y="3" width="26" height="26" rx="4" stroke="#06b6d4" strokeWidth="1.5" />
                <circle cx="16" cy="13" r="4" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M8 27C8 23.134 11.134 20 15 20H17C20.866 20 24 23.134 24 27" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="step-title">Face Detection</h3>
            <p className="step-desc">OpenCV Haar cascade locates and crops the primary face region with 20% padding for context.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="3" y="8" width="26" height="16" rx="3" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M8 16H24M12 12H12.01M16 12H16.01M20 12H20.01" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 20H22" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="step-title">Feature Extraction</h3>
            <p className="step-desc">The 299×299 face patch is normalized and fed into XceptionNet's depthwise separable convolutional layers.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M10 16L14 20L22 12" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="step-title">Verdict</h3>
            <p className="step-desc">A binary sigmoid classifier outputs a confidence score. Above 50% is classified as DeepFake.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="footer">
        <p>DeepFake Detector — Powered by XceptionNet, TensorFlow</p>
        <p className="footer-note">Developed by Subrajit Debnath. All rights reserved .</p>
      </footer>
    </main>
  )
}

export default Home
