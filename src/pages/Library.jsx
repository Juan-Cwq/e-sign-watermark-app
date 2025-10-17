import React, { useState, useEffect } from 'react'
import { Trash2, Download, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react'
import axios from 'axios'
import './Library.css'

function Library() {
  const [activeTab, setActiveTab] = useState('signatures')
  const [signatures, setSignatures] = useState([])
  const [watermarks, setWatermarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadLibraries()
  }, [])

  const loadLibraries = async () => {
    setLoading(true)
    setError(null)

    try {
      const [sigResponse, waterResponse] = await Promise.all([
        axios.get('/api/signature/list'),
        axios.get('/api/watermark/list')
      ])

      setSignatures(sigResponse.data.signatures || [])
      setWatermarks(waterResponse.data.watermarks || [])
    } catch (err) {
      setError('Failed to load library')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return
    }

    try {
      const endpoint = type === 'signature' ? `/api/signature/${id}` : `/api/watermark/${id}`
      await axios.delete(endpoint)

      if (type === 'signature') {
        setSignatures(signatures.filter(sig => sig.id !== id))
      } else {
        setWatermarks(watermarks.filter(wm => wm.id !== id))
      }

      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`)
    } catch (err) {
      setError(`Failed to delete ${type}`)
    }
  }

  const handleDownload = async (id, name, type) => {
    try {
      const endpoint = type === 'signature' ? `/api/signature/${id}` : `/api/watermark/${id}`
      const response = await axios.get(endpoint, { responseType: 'blob' })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${name}.png`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to download')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const items = activeTab === 'signatures' ? signatures : watermarks

  return (
    <div className="page library">
      <div className="page-header">
        <h1 className="page-title">Library</h1>
        <p className="page-description">
          Manage your saved signatures and watermarks
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

      <div className="library-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'signatures' ? 'active' : ''}`}
            onClick={() => setActiveTab('signatures')}
          >
            Signatures ({signatures.length})
          </button>
          <button
            className={`tab ${activeTab === 'watermarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('watermarks')}
          >
            Watermarks ({watermarks.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p className="loading-text">Loading library...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={64} className="empty-state-icon" />
            <p className="empty-state-title">No {activeTab} saved</p>
            <p className="empty-state-description">
              {activeTab === 'signatures'
                ? 'Upload and process a signature to add it to your library'
                : 'Create a watermark to add it to your library'}
            </p>
          </div>
        ) : (
          <div className="library-grid">
            {items.map((item) => (
              <div key={item.id} className="library-item card card-hover fade-in">
                <div className="item-preview">
                  <img
                    src={activeTab === 'signatures' 
                      ? `/api/signature/${item.id}` 
                      : `/api/watermark/${item.id}`}
                    alt={item.name}
                    className="item-image"
                  />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-date">{formatDate(item.created_at)}</p>
                  {activeTab === 'watermarks' && (
                    <span className="badge badge-primary">{item.type}</span>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="action-button"
                    onClick={() => handleDownload(item.id, item.name, activeTab.slice(0, -1))}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => handleDelete(item.id, activeTab.slice(0, -1))}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Library
