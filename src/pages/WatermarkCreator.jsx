import React, { useState } from 'react'
import { Type, Image as ImageIcon, Save, Download, RotateCw, AlertCircle, CheckCircle } from 'lucide-react'
import { ChromePicker } from 'react-color'
import axios from 'axios'
import './WatermarkCreator.css'

function WatermarkCreator() {
  const [watermarkType, setWatermarkType] = useState('text')
  const [textSettings, setTextSettings] = useState({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    color: '#FF0000',
    opacity: 0.5,
    rotation: 45
  })
  const [imageFile, setImageFile] = useState(null)
  const [imageSettings, setImageSettings] = useState({
    opacity: 0.5,
    rotation: 0
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [watermarkName, setWatermarkName] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const templates = [
    { name: 'CONFIDENTIAL', color: '#FF0000', rotation: 45 },
    { name: 'DRAFT', color: '#808080', rotation: 45 },
    { name: 'COPY', color: '#0000FF', rotation: 0 },
    { name: 'SAMPLE', color: '#FFA500', rotation: 45 },
    { name: 'APPROVED', color: '#008000', rotation: 0 },
    { name: 'VOID', color: '#FF0000', rotation: 45 }
  ]

  const handleCreateWatermark = async () => {
    setLoading(true)
    setError(null)

    try {
      let requestData = { type: watermarkType }

      if (watermarkType === 'text') {
        requestData = {
          ...requestData,
          text: textSettings.text,
          fontSize: textSettings.fontSize,
          color: textSettings.color,
          opacity: textSettings.opacity,
          rotation: textSettings.rotation
        }
      } else {
        if (!imageFile) {
          setError('Please upload an image')
          setLoading(false)
          return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
          requestData = {
            ...requestData,
            image: reader.result,
            opacity: imageSettings.opacity,
            rotation: imageSettings.rotation
          }

          try {
            const response = await axios.post('/api/watermark/create', requestData)
            setPreview(response.data.data)
            setSuccess('Watermark created successfully!')
          } catch (err) {
            setError(err.response?.data?.error || 'Failed to create watermark')
          } finally {
            setLoading(false)
          }
        }
        reader.readAsDataURL(imageFile)
        return
      }

      const response = await axios.post('/api/watermark/create', requestData)
      setPreview(response.data.data)
      setSuccess('Watermark created successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create watermark')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWatermark = async () => {
    if (!preview || !watermarkName.trim()) {
      setError('Please provide a name for your watermark')
      return
    }

    try {
      await axios.post('/api/watermark/save', {
        image: preview.image,
        name: watermarkName,
        type: watermarkType,
        settings: watermarkType === 'text' ? textSettings : imageSettings
      })

      setSuccess('Watermark saved to library!')
      setWatermarkName('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save watermark')
    }
  }

  const handleDownload = () => {
    if (!preview) return

    const link = document.createElement('a')
    link.href = preview.image
    link.download = `watermark.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const applyTemplate = (template) => {
    setTextSettings({
      ...textSettings,
      text: template.name,
      color: template.color,
      rotation: template.rotation
    })
  }

  return (
    <div className="page watermark-creator">
      <div className="page-header">
        <h1 className="page-title">Watermark Creator</h1>
        <p className="page-description">
          Create custom text or image watermarks with advanced customization options
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

      <div className="watermark-content">
        <div className="settings-section card">
          <h2 className="section-title">Watermark Settings</h2>

          <div className="type-selector">
            <button
              className={`type-button ${watermarkType === 'text' ? 'active' : ''}`}
              onClick={() => setWatermarkType('text')}
            >
              <Type size={20} />
              Text Watermark
            </button>
            <button
              className={`type-button ${watermarkType === 'image' ? 'active' : ''}`}
              onClick={() => setWatermarkType('image')}
            >
              <ImageIcon size={20} />
              Image Watermark
            </button>
          </div>

          {watermarkType === 'text' ? (
            <div className="settings-form">
              <div className="form-group">
                <label className="label">Watermark Text</label>
                <input
                  type="text"
                  className="input"
                  value={textSettings.text}
                  onChange={(e) => setTextSettings({ ...textSettings, text: e.target.value })}
                  placeholder="Enter watermark text"
                />
              </div>

              <div className="templates-section">
                <label className="label">Quick Templates</label>
                <div className="templates-grid">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      className="template-button"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Font Size: {textSettings.fontSize}px</label>
                <input
                  type="range"
                  className="slider"
                  min="20"
                  max="120"
                  value={textSettings.fontSize}
                  onChange={(e) => setTextSettings({ ...textSettings, fontSize: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="label">Color</label>
                <div className="color-picker-wrapper">
                  <button
                    className="color-swatch"
                    style={{ backgroundColor: textSettings.color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="color-picker-popover">
                      <div
                        className="color-picker-cover"
                        onClick={() => setShowColorPicker(false)}
                      />
                      <ChromePicker
                        color={textSettings.color}
                        onChange={(color) => setTextSettings({ ...textSettings, color: color.hex })}
                      />
                    </div>
                  )}
                  <span className="color-value">{textSettings.color}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Opacity: {Math.round(textSettings.opacity * 100)}%</label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={textSettings.opacity}
                  onChange={(e) => setTextSettings({ ...textSettings, opacity: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <RotateCw size={16} />
                  Rotation: {textSettings.rotation}°
                </label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="360"
                  value={textSettings.rotation}
                  onChange={(e) => setTextSettings({ ...textSettings, rotation: parseInt(e.target.value) })}
                />
              </div>
            </div>
          ) : (
            <div className="settings-form">
              <div className="form-group">
                <label className="label">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
                {imageFile && (
                  <div className="file-info">
                    Selected: {imageFile.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="label">Opacity: {Math.round(imageSettings.opacity * 100)}%</label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={imageSettings.opacity}
                  onChange={(e) => setImageSettings({ ...imageSettings, opacity: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <RotateCw size={16} />
                  Rotation: {imageSettings.rotation}°
                </label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="360"
                  value={imageSettings.rotation}
                  onChange={(e) => setImageSettings({ ...imageSettings, rotation: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-block"
            onClick={handleCreateWatermark}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating...
              </>
            ) : (
              'Create Watermark'
            )}
          </button>
        </div>

        <div className="preview-section card">
          <h2 className="section-title">Preview</h2>

          {preview ? (
            <div className="preview-content fade-in">
              <div className="preview-image-wrapper">
                <img
                  src={preview.image}
                  alt="Watermark preview"
                  className="preview-image"
                />
              </div>

              <div className="preview-info">
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{preview.width} × {preview.height}px</span>
                </div>
              </div>

              <div className="actions-section">
                <h3 className="section-title">Save to Library</h3>
                <div className="save-form">
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter watermark name"
                    value={watermarkName}
                    onChange={(e) => setWatermarkName(e.target.value)}
                  />
                  <button
                    className="btn btn-success"
                    onClick={handleSaveWatermark}
                    disabled={!watermarkName.trim()}
                  >
                    <Save size={18} />
                    Save
                  </button>
                </div>

                <button className="btn btn-primary btn-block" onClick={handleDownload}>
                  <Download size={18} />
                  Download Watermark
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ImageIcon size={64} />
              </div>
              <p className="empty-state-title">No Preview</p>
              <p className="empty-state-description">
                Configure your watermark settings and click "Create Watermark" to see a preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WatermarkCreator
