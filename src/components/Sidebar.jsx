import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  PenTool, 
  Droplet, 
  FileText, 
  FolderOpen,
  Shield
} from 'lucide-react'
import './Sidebar.css'

function Sidebar({ isOpen }) {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/signature', icon: PenTool, label: 'Signature Digitizer' },
    { path: '/watermark', icon: Droplet, label: 'Watermark Creator' },
    { path: '/document', icon: FileText, label: 'Document Editor' },
    { path: '/library', icon: FolderOpen, label: 'Library' }
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            end={item.path === '/'}
          >
            <item.icon size={20} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="security-badge">
          <Shield size={16} />
          <span>Secure & Encrypted</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
