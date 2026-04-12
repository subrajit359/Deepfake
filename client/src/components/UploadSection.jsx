import React, { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner.jsx'
import API_BASE from '../config.js'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/bmp', 'video/mp4', 'video/quicktime', 'video/avi']
const ACCEPTED_EXT = '.jpg,.jpeg,.png,.bmp,.mp4,.mov,.avi'

function UploadSection({ onResult }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewType, setPreviewType] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = useCallback((f) => {
    if (!f) return
    setError(null)

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError(`Unsupported file type: ${f.type || 'unknown'}. Please use JPEG, PNG, BMP, or MP4.`)
      return
    }

    setFile(f)

    const isVideo = f.type.startsWith('video/')
    setPreviewType(isVideo ? 'video' : 'image')

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const handleInputChange = (e) => {
    const selected = e.target.files[0]
    if (selected) handleFile(selected)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_BASE}/api/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      onResult(response.data)
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || `Server error: ${err.response.status}`)
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The server may be starting up — try again in a few seconds.')
      } else {
        setError('Cannot reach the backend. The server may be starting up — please try again in a few seconds.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setPreviewType(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) return <LoadingSpinner />

  return (
    <section className="upload-section" id="upload">
      {!file ? (
        <div
          className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXT}
            onChange={handleInputChange}
            className="file-input-hidden"
          />
          <div className="drop-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="4" width="56" height="56" rx="12" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 4" />
              <path d="M32 44V24" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 34L32 24L42 34" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="20" y="47" width="24" height="4" rx="2" fill="#06b6d4" opacity="0.3" />
            </svg>
          </div>
          <h3 className="drop-title">Drop your media here</h3>
          <p className="drop-sub">or <span className="drop-browse">click to browse files</span></p>
          <div className="drop-types">
            <span className="type-badge">JPEG</span>
            <span className="type-badge">PNG</span>
            <span className="type-badge">BMP</span>
            <span className="type-badge">MP4</span>
          </div>
          <p className="drop-limit">Maximum file size: 50 MB</p>
        </div>
      ) : (
        <div className="preview-container">
          <div className="preview-media-wrap">
            {previewType === 'image' ? (
              <img src={preview} alt="Preview" className="preview-img" />
            ) : (
              <video src={preview} className="preview-video" controls muted />
            )}
            <button className="preview-remove-btn" onClick={handleReset} title="Remove file">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="preview-info">
            <div className="preview-filename">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="9" height="14" rx="1.5" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M11 1L14 4V15H5" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {file.name}
            </div>
            <span className="preview-filesize">{(file.size / 1024).toFixed(1)} KB</span>
          </div>

          {error && (
            <div className="error-box">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M8 5V8.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.75" fill="#ef4444" />
              </svg>
              {error}
            </div>
          )}

          <button className="analyze-btn" onClick={handleAnalyze}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
              <path d="M10 2V5M10 15V18M2 10H5M15 10H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4.22 4.22L6.34 6.34M13.66 13.66L15.78 15.78M4.22 15.78L6.34 13.66M13.66 6.34L15.78 4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Analyze with AI
          </button>
        </div>
      )}

      {error && !file && (
        <div className="error-box error-box-standalone">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M8 5V8.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.75" fill="#ef4444" />
          </svg>
          {error}
        </div>
      )}
    </section>
  )
}

export default UploadSection
