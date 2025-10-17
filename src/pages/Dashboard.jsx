import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, Droplet, FileText, Zap, Shield, Cloud } from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const features = [
    {
      icon: PenTool,
      title: 'Signature Digitizer',
      description: 'Convert handwritten signatures into high-quality digital assets with AI-powered background removal',
      color: '#2563eb',
      path: '/signature'
    },
    {
      icon: Droplet,
      title: 'Watermark Creator',
      description: 'Create custom text or image watermarks with advanced customization options',
      color: '#10b981',
      path: '/watermark'
    },
    {
      icon: FileText,
      title: 'Document Editor',
      description: 'Apply signatures and watermarks to PDFs and images with precise placement controls',
      color: '#f59e0b',
      path: '/document'
    }
  ]

  const highlights = [
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Advanced algorithms for instant signature processing and watermark creation'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encryption ensures your documents and signatures remain confidential'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Securely store and sync your signatures and watermarks across devices'
    }
  ]

  return (
    <div className="page dashboard">
      <div className="page-header">
        <h1 className="page-title">Welcome to SignaturePro</h1>
        <p className="page-description">
          Professional signature digitization and watermark creation for secure document handling
        </p>
      </div>

      <div className="dashboard-content">
        <section className="section">
          <h2 className="section-title">Get Started</h2>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card card card-hover"
                onClick={() => navigate(feature.path)}
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-icon" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon size={32} style={{ color: feature.color }} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <button className="btn btn-primary" style={{ backgroundColor: feature.color }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Why Choose SignaturePro?</h2>
          <div className="highlights-grid">
            {highlights.map((highlight, index) => (
              <div key={index} className="highlight-card card">
                <div className="highlight-icon">
                  <highlight.icon size={24} />
                </div>
                <h3 className="highlight-title">{highlight.title}</h3>
                <p className="highlight-description">{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta-card card">
            <h2 className="cta-title">Ready to digitize your signatures?</h2>
            <p className="cta-description">
              Start by uploading a photo of your handwritten signature and let our AI do the rest.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signature')}>
              Upload Signature
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
