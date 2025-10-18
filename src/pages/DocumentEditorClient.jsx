import React, { useState, useRef, useEffect } from 'react'
import { Upload, Download, Move, AlertCircle, CheckCircle, Info } from 'lucide-react'
import Draggable from 'react-draggable'
import storageManager from '../utils/localStorage'
import './DocumentEditor.css'

function DocumentEditor() {
  const [documentImage, setDocumentImage] = useState(null)
  const [overlay, setOverlay] = useState(null)
  const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 })
  const [overlaySize, setOverlaySize] = useState(200)
  const [overlayOpacity, setOverlayOpacity] = useState(1)
  const [blendMode, setBlendMode] = useState('multiply')
  const [removeWhite, setRemoveWhite] = useState(true)
  const [signatures, setSignatures] = useState([])
  const [watermarks, setWatermarks] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const canvasRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    loadLibraries()
  }, [])

  const loadLibraries = () => {
    const sigs = storageManager.getSignatures()
    const wms = storageManager.getWatermarks()
    setSignatures(sigs)
    setWatermarks(wms)
  }

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Only accept images
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG)')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setDocumentImage(reader.result)
      setSuccess('Image uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleSelectOverlay = (id, type) => {
    const item = type === 'signature' 
      ? storageManager.getSignature(id)
      : storageManager.getWatermark(id)
    
    if (item) {
      setOverlay({
        data: item.data,
        type: type,
        name: item.name
      })
      setSuccess(`${type === 'signature' ? 'Signature' : 'Watermark'} selected!`)
    }
  }

  const handleDownload = async () => {
    if (!documentImage || !overlay) {
      setError('Please upload an image and select an overlay')
      return
    }

    try {
      // Create canvas to combine image and overlay
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Load document image
      const docImg = new Image()
      docImg.src = documentImage

      docImg.onload = () => {
        canvas.width = docImg.width
        canvas.height = docImg.height

        // Draw document
        ctx.drawImage(docImg, 0, 0)

        // Load and draw overlay
        const overlayImg = new Image()
        overlayImg.src = overlay.data

        overlayImg.onload = () => {
          // Calculate overlay position and size
          const overlayWidth = overlaySize
          const overlayHeight = (overlayImg.height / overlayImg.width) * overlaySize
          const x = (overlayPosition.x / 100) * canvas.width
          const y = (overlayPosition.y / 100) * canvas.height

          // Create temporary canvas for overlay processing
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = overlayWidth
          tempCanvas.height = overlayHeight
          
          // Draw overlay to temp canvas
          tempCtx.drawImage(overlayImg, 0, 0, overlayWidth, overlayHeight)
          
          // Remove white background using threshold-based alpha mask (like OpenCV)
          if (removeWhite) {
            const imageData = tempCtx.getImageData(0, 0, overlayWidth, overlayHeight)
            const data = imageData.data
            
            // Create alpha mask using threshold approach (similar to cv2.threshold)
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              
              // Calculate grayscale value
              const gray = 0.299 * r + 0.587 * g + 0.114 * b
              
              // Threshold: if pixel is bright (>150), make it transparent
              // This is similar to cv2.threshold(sig_gray, 150, 255, cv2.THRESH_BINARY_INV)
              if (gray > 150) {
                data[i + 3] = 0 // Fully transparent
              } else {
                // Keep the original color but ensure it's visible
                data[i + 3] = 255 - gray // Darker pixels = more opaque
              }
            }
            
            tempCtx.putImageData(imageData, 0, 0)
          }

          // Apply blend mode and opacity
          ctx.globalAlpha = overlayOpacity
          ctx.globalCompositeOperation = blendMode

          // Draw processed overlay
          ctx.drawImage(tempCanvas, x, y)

          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 1

          // Download
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `document-with-${overlay.type}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            setSuccess('Document downloaded successfully!')
          })
        }
      }
    } catch (err) {
      setError('Failed to create document: ' + err.message)
    }
  }

  return (
    <div className="page document-editor">
      <div className="page-header">
        <h1 className="page-title">Document Editor</h1>
        <p className="page-description">
          Add signatures and watermarks to your images
        </p>
      </div>

      {/* Info Banner */}
      <div className="info-banner" style={{
        background: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'start'
      }}>
        <Info size={20} style={{ color: '#2196f3', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#1976d2', display: 'block', marginBottom: '4px' }}>
            Image Editor Only
          </strong>
          <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
            This version supports <strong>images only</strong> (PNG, JPG, JPEG). 
            For PDF and Word document editing, you'll need the full backend version with Python/Flask.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-state fade-in">
          <div className="error-title">
            <AlertCircle size={16} />
            Error
          </div>
          <div className="error-message">{error}</div>
        </div>
      )}

      {success && (
        <div className="success-state fade-in">
          <div className="success-title">
            <CheckCircle size={16} />
            Success
          </div>
          <div className="success-message">{success}</div>
        </div>
      )}

      <div className="editor-layout">
        {/* Left Panel */}
        <div className="editor-sidebar card">
          <div className="editor-section">
            <h3 className="section-title">1. Upload Image</h3>
            <label className="btn btn-primary btn-block" style={{ cursor: 'pointer' }}>
              <Upload size={18} />
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleDocumentUpload}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Supports: PNG, JPG, JPEG
            </p>
          </div>

          <div className="editor-section">
            <h3 className="section-title">2. Select Overlay</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>Signatures</h4>
              {signatures.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999' }}>No signatures saved</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {signatures.map((sig) => (
                    <button
                      key={sig.id}
                      className={`overlay-item ${overlay?.data === sig.data ? 'active' : ''}`}
                      onClick={() => handleSelectOverlay(sig.id, 'signature')}
                      style={{
                        padding: '8px',
                        border: overlay?.data === sig.data ? '2px solid #2563eb' : '1px solid #ddd',
                        borderRadius: '4px',
                        background: overlay?.data === sig.data ? '#f0f7ff' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <img src={sig.data} alt={sig.name} style={{ width: '40px', height: '30px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '12px' }}>{sig.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#666' }}>Watermarks</h4>
              {watermarks.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999' }}>No watermarks saved</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {watermarks.map((wm) => (
                    <button
                      key={wm.id}
                      className={`overlay-item ${overlay?.data === wm.data ? 'active' : ''}`}
                      onClick={() => handleSelectOverlay(wm.id, 'watermark')}
                      style={{
                        padding: '8px',
                        border: overlay?.data === wm.data ? '2px solid #10b981' : '1px solid #ddd',
                        borderRadius: '4px',
                        background: overlay?.data === wm.data ? '#f0fdf4' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <img src={wm.data} alt={wm.name} style={{ width: '40px', height: '30px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '12px' }}>{wm.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {overlay && (
            <div className="editor-section">
              <h3 className="section-title">3. Adjust Overlay</h3>
              
              <label style={{ display: 'block', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Size: {overlaySize}px
                </span>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={overlaySize}
                  onChange={(e) => setOverlaySize(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Opacity: {Math.round(overlayOpacity * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Position X: {overlayPosition.x}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayPosition.x}
                  onChange={(e) => setOverlayPosition({ ...overlayPosition, x: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Position Y: {overlayPosition.y}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayPosition.y}
                  onChange={(e) => setOverlayPosition({ ...overlayPosition, y: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Blend Mode
                </span>
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply (Recommended)</option>
                  <option value="darken">Darken</option>
                  <option value="overlay">Overlay</option>
                  <option value="screen">Screen</option>
                  <option value="soft-light">Soft Light</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={removeWhite}
                  onChange={(e) => setRemoveWhite(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Remove white background
                </span>
              </label>
            </div>
          )}

          <button
            className="btn btn-primary btn-block"
            onClick={handleDownload}
            disabled={!documentImage || !overlay}
          >
            <Download size={18} />
            Download Image
          </button>
        </div>

        {/* Preview Panel */}
        <div className="editor-preview card">
          <h3 className="section-title">Preview</h3>
          
          {documentImage ? (
            <div 
              ref={previewRef}
              style={{ 
                position: 'relative', 
                width: '100%', 
                minHeight: '400px',
                background: '#f5f5f5',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img 
                src={documentImage} 
                alt="Document" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '600px',
                  display: 'block'
                }} 
              />
              
              {overlay && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${overlayPosition.x}%`,
                    top: `${overlayPosition.y}%`,
                    opacity: overlayOpacity,
                    mixBlendMode: blendMode,
                    pointerEvents: 'none'
                  }}
                >
                  <img 
                    src={overlay.data} 
                    alt="Overlay" 
                    style={{ 
                      width: `${overlaySize}px`,
                      height: 'auto'
                    }} 
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <Upload size={64} className="empty-state-icon" />
              <p className="empty-state-title">No image loaded</p>
              <p className="empty-state-description">
                Upload an image to start editing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentEditor
