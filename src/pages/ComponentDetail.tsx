import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Pencil,
  MapPin,
  Plus,
  Minus,
  RotateCcw,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import {
  formatDate,
  formatCurrency,
  getCategoryName,
  getLocationName,
} from '../utils/helpers';
import { NavBar, ConfirmDialog } from '../components';
import './ComponentDetail.css';

export default function ComponentDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, deleteComponent } = useApp();
  const navigate = useNavigate();

  const [txnFilter, setTxnFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const component = useMemo(
    () => state.components.find((c) => c.id === id),
    [state.components, id]
  );

  const compTxns = useMemo(() => {
    let list = state.transactions.filter((t) => t.componentId === id);
    if (txnFilter !== 'all') {
      list = list.filter((t) => t.type === txnFilter);
    }
    return list;
  }, [state.transactions, id, txnFilter]);

  if (!component) {
    return (
      <div className="component-detail">
        <NavBar title="元器件详情" showBack backTo="/inventory" />
        <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
          <Package size={48} color="#ccc" />
          <p style={{ marginTop: 12 }}>元器件不存在</p>
        </div>
      </div>
    );
  }

  const isLowStock = component.quantity <= component.safeStock;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return '入库';
      case 'out': return '出库';
      case 'adjust': return '调整';
      default: return type;
    }
  };

  const handleDelete = () => {
    deleteComponent(component.id);
    navigate('/inventory');
  };

  return (
    <div className="component-detail">
      <NavBar
        title={component.name}
        showBack
        backTo="/inventory"
        rightAction={
          <button
            className="nav-edit-btn"
            onClick={() => navigate(`/inventory/${id}/edit`)}
          >
            <Pencil size={18} />
          </button>
        }
      />

      <div className="detail-card">
        <div className="detail-card-header">
          <h3 className="detail-card-title">基本信息</h3>
          <span className="detail-category-tag">
            {getCategoryName(state.categories, component.categoryId)}
          </span>
        </div>

        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">名称</span>
            <span className="detail-info-value">{component.name}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">型号</span>
            <span className="detail-info-value">{component.model || '-'}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">封装</span>
            <span className="detail-info-value">{component.package || '-'}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">品牌</span>
            <span className="detail-info-value">{component.brand || '-'}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">存放位置</span>
            <span className="detail-info-value" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={12} color="#999" />
              {getLocationName(state.locations, component.locationId)}
            </span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">单价</span>
            <span className="detail-info-value">
              {formatCurrency(component.unitPrice)}
            </span>
          </div>
        </div>

        <div className="detail-qty-section">
          <div className="detail-qty-wrap">
            <span className={`detail-qty-value ${isLowStock ? 'low' : ''}`}>
              {component.quantity}
            </span>
            <span className="detail-qty-unit">{component.unit}</span>
          </div>
          <div
            className={`detail-safe-stock-badge ${isLowStock ? 'badge-warn' : 'badge-ok'}`}
          >
            {isLowStock ? (
              <>
                <AlertTriangle size={14} />
                <span>低于安全库存 ({component.safeStock})</span>
              </>
            ) : (
              <>
                <Package size={14} />
                <span>库存充足</span>
              </>
            )}
          </div>
        </div>

        {component.unitPrice > 0 && (
          <div className="detail-total-value">
            总价值：{formatCurrency(component.quantity * component.unitPrice)}
          </div>
        )}
      </div>

      <div className="detail-actions-row">
        <button
          className="detail-action-btn action-in"
          onClick={() => navigate(`/transactions/in?componentId=${component.id}`)}
        >
          <Plus size={16} />
          <span>入库</span>
        </button>
        <button
          className="detail-action-btn action-out"
          onClick={() => navigate(`/transactions/out?componentId=${component.id}`)}
        >
          <Minus size={16} />
          <span>出库</span>
        </button>
        <button
          className="detail-action-btn action-adjust"
          onClick={() => navigate(`/transactions/adjust?componentId=${component.id}`)}
        >
          <RotateCcw size={16} />
          <span>调整库存</span>
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="section-header" style={{ padding: '0 16px', marginBottom: 8 }}>
          <h3 className="section-title">库存变化记录</h3>
        </div>

        <div className="txn-filter-bar">
          {['all', 'in', 'out', 'adjust'].map((f) => (
            <button
              key={f}
              className={`txn-filter-chip ${txnFilter === f ? 'txn-filter-chip-active' : ''}`}
              onClick={() => setTxnFilter(f)}
            >
              {f === 'all' ? '全部' : getTypeLabel(f)}
            </button>
          ))}
        </div>

        <div className="txn-timeline">
          {compTxns.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', fontSize: 14, padding: 24 }}>
              暂无记录
            </p>
          ) : (
            compTxns.map((txn) => (
              <div key={txn.id} className="txn-item">
                <div className={`txn-icon-wrap txn-icon-${txn.type}`}>
                  <span className="txn-icon-label">{getTypeLabel(txn.type)}</span>
                </div>
                <div className="txn-body">
                  <div className="txn-body-row">
                    <span className={`txn-type-badge badge-${txn.type}`}>
                      {getTypeLabel(txn.type)}
                    </span>
                    <span className="txn-date">{formatDate(txn.date)}</span>
                  </div>
                  <div className="txn-detail-row">
                    <span className="txn-qty-change">
                      {txn.type === 'in' ? '+' : txn.type === 'out' ? '-' : '±'}
                      {txn.quantity} {component.unit}
                    </span>
                    <span className="txn-remaining">
                      剩余 {txn.remainingStock} {component.unit}
                    </span>
                  </div>
                  {txn.note && (
                    <div className="txn-note">{txn.note}</div>
                  )}
                  <div className="txn-operator">{txn.operator}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="detail-delete-section">
        <button
          className="detail-delete-btn"
          onClick={() => setShowDeleteConfirm(true)}
        >
          删除此元器件
        </button>
      </div>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="确认删除"
        message={`确定要删除 "${component.name}" 吗？相关的流水记录也会一并删除，此操作不可恢复。`}
        confirmText="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
