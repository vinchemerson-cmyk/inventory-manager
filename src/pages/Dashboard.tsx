import { useNavigate } from 'react-router-dom';
import { Search, Package, Layers, DollarSign, AlertTriangle, Plus, Minus, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatCurrency, formatShortDate, calcDashboardStats, getComponentById } from '../utils/helpers';
import { NavBar } from '../components';
import './Dashboard.css';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();

  const stats = calcDashboardStats(state.components);

  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getComponentName = (componentId: string) => {
    const comp = getComponentById(state.components, componentId);
    return comp?.name ?? '未知元件';
  };

  return (
    <div className="dashboard">
      <NavBar
        title="仪表盘"
        rightAction={
          <button
            className="nav-icon-btn"
            onClick={() => navigate('/search')}
          >
            <Search size={20} />
          </button>
        }
      />

      <div className="dashboard-content">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#eff6ff' }}>
              <Layers size={20} color="#3b82f6" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-label">元件种类</span>
              <span className="stat-card-value">{stats.componentTypes}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#f0fdf4' }}>
              <Package size={20} color="#22c55e" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-label">总库存量</span>
              <span className="stat-card-value">{stats.totalQuantity.toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon" style={{ backgroundColor: '#fefce8' }}>
              <DollarSign size={20} color="#eab308" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-label">库存总价值</span>
              <span className="stat-card-value">{formatCurrency(stats.totalValue)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-card-icon"
              style={{ backgroundColor: stats.lowStockCount > 0 ? '#fef2f2' : '#f5f5f5' }}
            >
              <AlertTriangle
                size={20}
                color={stats.lowStockCount > 0 ? '#ef4444' : '#999'}
              />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-label">低库存预警</span>
              <span
                className="stat-card-value"
                style={{ color: stats.lowStockCount > 0 ? '#ef4444' : '#333' }}
              >
                {stats.lowStockCount}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            className="quick-action-btn quick-action-in"
            onClick={() => navigate('/transactions/in')}
          >
            <Plus size={18} />
            <span>入库记录</span>
          </button>
          <button
            className="quick-action-btn quick-action-out"
            onClick={() => navigate('/transactions/out')}
          >
            <Minus size={18} />
            <span>出库记录</span>
          </button>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">最近动态</h3>
            <button
              className="section-link"
              onClick={() => navigate('/transactions')}
            >
              查看全部流水 <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          <div className="recent-list">
            {recentTransactions.length === 0 ? (
              <p className="recent-empty">暂无流水记录</p>
            ) : (
              recentTransactions.map((txn) => (
                <div key={txn.id} className="recent-item">
                  <div className="recent-item-left">
                    <span className="recent-item-name">{getComponentName(txn.componentId)}</span>
                    <span className="recent-item-date">{formatShortDate(txn.date)}</span>
                  </div>
                  <div className="recent-item-right">
                    <span
                      className={`recent-qty ${txn.type === 'in' ? 'recent-qty-in' : 'recent-qty-out'}`}
                    >
                      {txn.type === 'in' ? '+' : '-'}{txn.quantity}
                    </span>
                    {txn.note && (
                      <span className="recent-item-note">{txn.note}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
