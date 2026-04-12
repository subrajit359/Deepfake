import React from 'react'

function ResultCard({ result, onReset }) {
  const isFake = result.result === 'FAKE'
  const confidence = result.confidence || 0
  const isDemo = result.mode === 'demo'

  const formatTimestamp = (iso) => {
    if (!iso) return 'N/A'
    const d = new Date(iso)
    return d.toLocaleString()
  }

  return (
    <div className={`result-card ${isFake ? 'result-fake' : 'result-real'}`}>
      {isDemo && (
        <div className="demo-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L1 14H15L8 1Z" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <path d="M8 6V9" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#f59e0b" />
          </svg>
          Demo Mode — No trained model loaded. Results are simulated.
        </div>
      )}

      <div className="result-verdict">
        <div className={`verdict-icon ${isFake ? 'verdict-icon-fake' : 'verdict-icon-real'}`}>
          {isFake ? (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" />
              <path d="M13 13L27 27M27 13L13 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" />
              <path d="M12 20L17.5 26L28 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="verdict-text">
          <div className={`verdict-result ${isFake ? 'verdict-fake' : 'verdict-real'}`}>
            {result.result}
          </div>
          <div className="verdict-label">{result.label}</div>
        </div>
      </div>

      <div className="result-confidence">
        <div className="confidence-header">
          <span className="confidence-label">Confidence Score</span>
          <span className={`confidence-value ${isFake ? 'text-fake' : 'text-real'}`}>
            {confidence.toFixed(1)}%
          </span>
        </div>
        <div className="confidence-bar-track">
          <div
            className={`confidence-bar-fill ${isFake ? 'bar-fake' : 'bar-real'}`}
            style={{ width: `${Math.min(confidence, 100)}%` }}
          ></div>
        </div>
        <div className="confidence-scale">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="result-details">
        <div className="detail-row">
          <span className="detail-label">Face Detection</span>
          <span className={`detail-value ${result.face_detected ? 'detail-yes' : 'detail-no'}`}>
            {result.face_detected ? 'Face found & analyzed' : 'No face — used full image'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Analysis Mode</span>
          <span className="detail-value">
            {result.mode === 'model' ? 'XceptionNet Model' : 'Demo Simulation'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Timestamp</span>
          <span className="detail-value">{formatTimestamp(result.timestamp)}</span>
        </div>
        {result.filename && (
          <div className="detail-row">
            <span className="detail-label">File ID</span>
            <span className="detail-value detail-file">{result.filename}</span>
          </div>
        )}
      </div>

      <button className="analyze-another-btn" onClick={onReset}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 9C3 5.686 5.686 3 9 3C12.314 3 15 5.686 15 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M15 9C15 12.314 12.314 15 9 15C5.686 15 3 12.314 3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M1 7L3 9L5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Analyze Another File
      </button>
    </div>
  )
}

export default ResultCard
