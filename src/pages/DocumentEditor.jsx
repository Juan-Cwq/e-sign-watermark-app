import React, { useState, useRef } from 'react'
import { Upload, Download, Move, AlertCircle, CheckCircle } from 'lucide-react'
import Draggable from 'react-draggable'
import axios from 'axios'
import './DocumentEditor.css'

function DocumentEditor() {
  const [document, setDocument] = useState(null)
  const [documentId, setDocumentId] = useState(null)
  const [overlay, setOverlay] = useState(null)
  const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 })
  const [overlaySize, setOverlaySize] = useState({ width: 200, height: 100 })
  const [signatures, setSignatures] = useState([])
  const [watermarks, setWatermarks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const canvasRef = useRef(null)

  React.useEffect(() => {
    loadLibraries()
  }, [])

  const loadLibraries = async () => {
    try {
      const [sigResponse, waterResponse] = await Promise.all([
        axios.get('/api/signature/list'),
        axios.get('/api/watermark/list')
      ])
      setSignatures(sigResponse.data.signatures || [])
      setWatermarks(waterResponse.data.watermarks || [])
    } catch (err) {
      console.error('Failed to load libraries:', err)
    }
  }

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/document/upload', formData)
      setDocumentId(response.data.document_id)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocument({
          url: reader.result,
          name: file.name,
          info: response.data.info
        })
      }
      reader.readAsDataURL(file)

      setSuccess('Document uploaded successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOverlay = async (id, type) => {
    try {
      const endpoint = type === 'signature' ? `/api/signature/${id}` : `/api/watermark/${id}`
      const response = await axios.get(endpoint, { responseType: 'blob' })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setOverlay({
          data: reader.result,
          type: type
        })
      }
      reader.readAsDataURL(response.data)
    } catch (err) {
      setError('Failed to load overlay')
    }
  }

  const handleApplyToDocument = async () => {
    if (!document || !overlay || !documentId) {
      setError('Please upload a document and select an overlay')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/document/apply', {
        document_id: documentId,
        overlay: overlay.data,
        position: overlayPosition,
        size: overlaySize,
        pages: 'all',
        filename: document.name
      }, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `signed_${document.name}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      setSuccess('Document processed and downloaded successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply overlay')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page document-editor">
      <div className="page-header">
        <h1 className="page-title">Document Editor</h1>
        <p className="page-description">
          Apply signatures and watermarks to your documents with precise placement
        </p>
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

      <div className="editor-content">
        <div className="editor-sidebar card">
          <h2 className="section-title">1. Upload Document</h2>
          <div className="upload-section">
            <label className="upload-button btn btn-primary">
              <Upload size={18} />
              Choose Document
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleDocumentUpload}
                style={{ display: 'none' }}
              />
            </label>
            {document && (
              <div className="document-info">
                <p className="document-name">{document.name}</p>
                <p className="document-details">
                  {document.info.type.toUpperCase()} • {document.info.pages} page(s)
                </p>
              </div>
            )}
          </div>

          <h2 className="section-title">2. Select Overlay</h2>
          
          <div className="overlay-section">
            <h3 className="subsection-title">Signatures</h3>
            <div className="overlay-grid">
              {signatures.length > 0 ? (
                signatures.map((sig) => (
                  <div
                    key={sig.id}
                    className={`overlay-item ${overlay?.type === 'signature' ? 'selected' : ''}`}
                    onClick={() => handleSelectOverlay(sig.id, 'signature')}
                  >
                    <img
                      src={`/api/signature/${sig.id}`}
                      alt={sig.name}
                      className="overlay-thumbnail"
                    />
                    <p className="overlay-name">{sig.name}</p>
                  </div>
                ))
              ) : (
                <p className="empty-text">No signatures saved</p>
              )}
            </div>
          </div>

          <div className="overlay-section">
            <h3 className="subsection-title">Watermarks</h3>
            <div className="overlay-grid">
              {watermarks.length > 0 ? (
                watermarks.map((wm) => (
                  <div
                    key={wm.id}
                    className={`overlay-item ${overlay?.type === 'watermark' ? 'selected' : ''}`}
                    onClick={() => handleSelectOverlay(wm.id, 'watermark')}
                  >
                    <img
                      src={`/api/watermark/${wm.id}`}
                      alt={wm.name}
                      className="overlay-thumbnail"
                    />
                    <p className="overlay-name">{wm.name}</p>
                  </div>
                ))
              ) : (
                <p className="empty-text">No watermarks saved</p>
              )}
            </div>
          </div>

          <h2 className="section-title">3. Adjust & Apply</h2>
          <div className="controls-section">
            <div className="form-group">
              <label className="label">Width: {overlaySize.width}px</label>
              <input
                type="range"
                className="slider"
                min="50"
                max="500"
                value={overlaySize.width}
                onChange={(e) => setOverlaySize({ ...overlaySize, width: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="label">Height: {overlaySize.height}px</label>
              <input
                type="range"
                className="slider"
                min="25"
                max="250"
                value={overlaySize.height}
                onChange={(e) => setOverlaySize({ ...overlaySize, height: parseInt(e.target.value) })}
              />
            </div>

            <button
              className="btn btn-success btn-block"
              onClick={handleApplyToDocument}
              disabled={loading || !document || !overlay}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Apply & Download
                </>
              )}
            </button>
          </div>
        </div>

        <div className="editor-canvas card">
          <h2 className="section-title">Preview</h2>
          {document ? (
            <div className="canvas-wrapper" ref={canvasRef}>
              <div className="canvas-content">
                {document.info.type === 'pdf' ? (
                  <div className="pdf-preview">
                    <p>PDF Preview</p>
                    <p className="preview-note">
                      Position the overlay using the controls. The final document will be downloaded.
                    </p>
                  </div>
                ) : (
                  <img src={document.url} alt="Document" className="document-image" />
                )}
                
                {overlay && (
                  <Draggable
                    position={overlayPosition}
                    onStop={(e, data) => setOverlayPosition({ x: data.x, y: data.y })}
                    bounds="parent"
                  >
                    <div
                      className="draggable-overlay"
                      style={{
                        width: overlaySize.width,
                        height: overlaySize.height
                      }}
                    >
                      <img src={overlay.data} alt="Overlay" className="overlay-image" />
                      <div className="overlay-hint">
                        <Move size={16} />
                        Drag to position
                      </div>
                    </div>
                  </Draggable>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Upload size={64} className="empty-state-icon" />
              <p className="empty-state-title">No Document Loaded</p>
              <p className="empty-state-description">
                Upload a document to start editing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentEditor
