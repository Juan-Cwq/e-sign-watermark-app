import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import './SignatureDigitizer.css'

function SignatureDigitizer() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processedSignature, setProcessedSignature] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [signatureName, setSignatureName] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadedFile(file)
    setError(null)
    setSuccess(null)
    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/signature/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProcessedSignature(response.data.data)
      setSuccess('Signature processed successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process signature')
    } finally {
      setProcessing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleSaveSignature = async () => {
    if (!processedSignature || !signatureName.trim()) {
      setError('Please provide a name for your signature')
      return
    }

    try {
      const response = await axios.post('/api/signature/save', {
        image: processedSignature.preview,
        name: signatureName,
        format: 'png'
      })

      setSuccess('Signature saved to library!')
      setSignatureName('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save signature')
    }
  }

  const handleDownload = (format) => {
    if (!processedSignature) return

    const imageData = processedSignature.formats[format]
    const link = document.createElement('a')
    link.href = imageData
    link.download = `signature.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="page signature-digitizer">
      <div className="page-header">
        <h1 className="page-title">Signature Digitizer</h1>
        <p className="page-description">
          Upload a photo of your handwritten signature and convert it to a professional digital format
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

      <div className="signature-content">
        <div className="upload-section card">
          <h2 className="section-title">Upload Signature</h2>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${uploadedFile ? 'has-file' : ''}`}
          >
            <input {...getInputProps()} />
            {processing ? (
              <div className="dropzone-content">
                <div className="spinner"></div>
                <p className="dropzone-text">Processing signature...</p>
              </div>
            ) : uploadedFile ? (
              <div className="dropzone-content">
                <CheckCircle size={48} className="dropzone-icon success" />
                <p className="dropzone-text">{uploadedFile.name}</p>
                <p className="dropzone-hint">Drop another file to replace</p>
              </div>
            ) : (
              <div className="dropzone-content">
                <Upload size={48} className="dropzone-icon" />
                <p className="dropzone-text">
                  {isDragActive ? 'Drop your signature here' : 'Drag & drop your signature image'}
                </p>
                <p className="dropzone-hint">or click to browse (PNG, JPG)</p>
              </div>
            )}
          </div>

          <div className="upload-tips">
            <h3 className="tips-title">Tips for best results:</h3>
            <ul className="tips-list">
              <li>Use a white or light-colored background</li>
              <li>Ensure good lighting and clear signature</li>
              <li>Sign with a dark pen or marker</li>
              <li>Avoid shadows and reflections</li>
            </ul>
          </div>
        </div>

        {processedSignature && (
          <div className="preview-section card fade-in">
            <h2 className="section-title">Processed Signature</h2>
            
            <div className="preview-container">
              <div className="preview-image-wrapper">
                <img
                  src={processedSignature.preview}
                  alt="Processed signature"
                  className="preview-image"
                />
              </div>
              
              <div className="preview-info">
                <div className="info-item">
                  <span className="info-label">Original Size:</span>
                  <span className="info-value">
                    {processedSignature.original_size[0]} × {processedSignature.original_size[1]}px
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Processed Size:</span>
                  <span className="info-value">
                    {processedSignature.processed_size[0]} × {processedSignature.processed_size[1]}px
                  </span>
                </div>
              </div>
            </div>

            <div className="actions-section">
              <h3 className="section-title">Save to Library</h3>
              <div className="save-form">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter signature name (e.g., 'John Doe - Formal')"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                />
                <button
                  className="btn btn-success"
                  onClick={handleSaveSignature}
                  disabled={!signatureName.trim()}
                >
                  <Save size={18} />
                  Save to Library
                </button>
              </div>

              <h3 className="section-title">Download</h3>
              <div className="download-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownload('png')}
                >
                  <Download size={18} />
                  Download PNG
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDownload('jpg')}
                >
                  <Download size={18} />
                  Download JPG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignatureDigitizer
