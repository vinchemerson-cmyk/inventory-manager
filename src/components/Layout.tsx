import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ListOrdered, BarChart3, User } from 'lucide-react'
import './Layout.css'

const tabs = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/inventory', label: '库存', icon: Package },
  { path: '/transactions', label: '流水', icon: ListOrdered },
  { path: '/statistics', label: '统计', icon: BarChart3 },
  { path: '/settings', label: '我的', icon: User },
]

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="layout">
      <nav className="layout-sidebar">
        <div className="layout-logo">库存管家</div>
        <ul className="layout-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
            return (
              <li key={tab.path}>
                <button
                  className={`layout-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(tab.path)}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
