import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, Save, AlertCircle, CheckCircle } from 'lucide-react'
import imageProcessor from '../utils/clientImageProcessor'
import storageManager from '../utils/localStorage'
import './SignatureDigitizer.css'

function SignatureDigitizer() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState(null)
  const [processedPreview, setProcessedPreview] = useState(null)
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
      // Process signature client-side
      const processed = await imageProcessor.processSignature(file)
      const dataUrl = await imageProcessor.blobToDataURL(processed)
      
      setProcessedBlob(processed)
      setProcessedPreview(dataUrl)
      setSuccess('Signature processed successfully!')
    } catch (err) {
      setError('Failed to process signature: ' + err.message)
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
    if (!processedBlob || !signatureName.trim()) {
      setError('Please provide a name for your signature')
      return
    }

    try {
      // Compress image before saving to reduce storage usage
      const compressedBlob = await imageProcessor.compressImage(processedBlob, 600, 0.7)
      await storageManager.saveSignature(signatureName, compressedBlob)
      setSuccess('Signature saved to library!')
      setSignatureName('')
    } catch (err) {
      setError('Failed to save signature: ' + err.message)
    }
  }

  const handleDownload = () => {
    if (!processedBlob) return
    imageProcessor.downloadBlob(processedBlob, `${signatureName || 'signature'}.png`)
  }

  return (
    <div className="page signature-digitizer">
      <div className="page-header">
        <h1 className="page-title">Signature Digitizer</h1>
        <p className="page-description">
          Upload your handwritten signature and transform it into a professional digital asset
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

      <div className="digitizer-content">
        <div className="upload-section card">
          <h2 className="section-title">Upload Signature</h2>
          
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${uploadedFile ? 'has-file' : ''}`}
          >
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div className="file-preview">
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Uploaded signature"
                  className="preview-image"
                />
                <p className="file-name">{uploadedFile.name}</p>
              </div>
            ) : (
              <div className="dropzone-content">
                <Upload size={48} className="upload-icon" />
                <p className="dropzone-title">
                  {isDragActive ? 'Drop your signature here' : 'Drag & drop your signature'}
                </p>
                <p className="dropzone-subtitle">or click to browse</p>
                <p className="dropzone-hint">Supports PNG, JPG, JPEG</p>
              </div>
            )}
          </div>

          <div className="tips-section">
            <h3 className="tips-title">Tips for best results:</h3>
            <ul className="tips-list">
              <li>✓ Use a white or light-colored background</li>
              <li>✓ Ensure good lighting and clear signature</li>
              <li>✓ Sign with a dark pen or marker</li>
              <li>✓ Avoid shadows and reflections</li>
            </ul>
          </div>
        </div>

        <div className="preview-section card">
          <h2 className="section-title">Processed Signature</h2>
          
          {processing ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">Processing your signature...</p>
            </div>
          ) : processedPreview ? (
            <div className="processed-content">
              <div className="signature-preview">
                <img
                  src={processedPreview}
                  alt="Processed signature"
                  className="processed-image"
                />
              </div>

              <div className="actions-section">
                <div className="save-section">
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter signature name..."
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveSignature}
                    disabled={!signatureName.trim()}
                  >
                    <Save size={18} />
                    Save to Library
                  </button>
                </div>

                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleDownload}
                >
                  <Download size={18} />
                  Download PNG
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Upload size={64} className="empty-state-icon" />
              <p className="empty-state-title">No signature processed yet</p>
              <p className="empty-state-description">
                Upload a signature image to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignatureDigitizer
