import React from 'react'
import { Menu, FileSignature } from 'lucide-react'
import './Header.css'

function Header({ onMenuClick }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-button" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <div className="logo">
            <FileSignature size={28} className="logo-icon" />
            <span className="logo-text">SignaturePro</span>
          </div>
        </div>
        <div className="header-right">
          <span className="badge badge-success">Professional Edition</span>
        </div>
      </div>
    </header>
  )
}

export default Header
