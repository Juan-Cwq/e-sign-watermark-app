import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SignatureDigitizer from './pages/SignatureDigitizer'
import WatermarkCreator from './pages/WatermarkCreator'
import DocumentEditor from './pages/DocumentEditor'
import Library from './pages/Library'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="app">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app-body">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`app-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/signature" element={<SignatureDigitizer />} />
              <Route path="/watermark" element={<WatermarkCreator />} />
              <Route path="/document" element={<DocumentEditor />} />
              <Route path="/library" element={<Library />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
