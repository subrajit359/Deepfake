import React from 'react'

function LoadingSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner-card">
        <div className="spinner-rings">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="ring-dot"></div>
        </div>
        <div className="spinner-text-group">
          <p className="spinner-title">Analyzing media with AI...</p>
          <p className="spinner-sub">XceptionNet is scanning for facial inconsistencies</p>
        </div>
        <div className="spinner-steps">
          <div className="step step-active">
            <div className="step-dot"></div>
            <span>Detecting faces</span>
          </div>
          <div className="step step-active" style={{ animationDelay: '0.4s' }}>
            <div className="step-dot"></div>
            <span>Extracting features</span>
          </div>
          <div className="step step-active" style={{ animationDelay: '0.8s' }}>
            <div className="step-dot"></div>
            <span>Running inference</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
