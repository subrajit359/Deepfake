import React from 'react'

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="13" stroke="#06b6d4" strokeWidth="2" />
              <path d="M8 14 C8 10.686 10.686 8 14 8 C17.314 8 20 10.686 20 14" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="14" r="3" fill="#06b6d4" />
              <path d="M4 14 H8 M20 14 H24" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">DeepFake<span className="logo-accent">Detector</span></span>
        </div>

        <nav className="header-nav">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#upload" className="nav-link">Analyze</a>
          <span className="nav-badge">AI Powered</span>
        </nav>
      </div>
    </header>
  )
}

export default Header
