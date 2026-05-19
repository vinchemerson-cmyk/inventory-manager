import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import {
  formatDate,
  formatMonth,
  getComponentById,
} from '../utils/helpers';
import { NavBar, Modal } from '../components';
import type { TransactionType } from '../types';
import './TransactionList.css';

interface FilterState {
  dateFrom: string;
  dateTo: string;
  compSearch: string;
  categoryId: string;
}

export default function TransactionList() {
  const { state } = useApp();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    compSearch: '',
    categoryId: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    compSearch: '',
    categoryId: '',
  });

  const hasActiveFilters =
    appliedFilters.dateFrom ||
    appliedFilters.dateTo ||
    appliedFilters.compSearch ||
    appliedFilters.categoryId;

  const filteredTxns = useMemo(() => {
    let list = state.transactions;

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (appliedFilters.dateFrom) {
      list = list.filter((t) => t.date >= appliedFilters.dateFrom);
    }
    if (appliedFilters.dateTo) {
      list = list.filter((t) => t.date <= appliedFilters.dateTo + 'T23:59:59');
    }

    if (appliedFilters.compSearch.trim()) {
      const q = appliedFilters.compSearch.trim().toLowerCase();
      list = list.filter((t) => {
        const comp = getComponentById(state.components, t.componentId);
        return (
          comp?.name.toLowerCase().includes(q) ||
          comp?.model.toLowerCase().includes(q)
        );
      });
    }

    if (appliedFilters.categoryId) {
      list = list.filter((t) => {
        const comp = getComponentById(state.components, t.componentId);
        return comp?.categoryId === appliedFilters.categoryId;
      });
    }

    return list;
  }, [state.transactions, typeFilter, appliedFilters, state.components]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof filteredTxns> = {};
    filteredTxns.forEach((txn) => {
      const month = formatMonth(txn.date);
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(txn);
    });
    return Object.entries(groups);
  }, [filteredTxns]);

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'in': return '入库';
      case 'out': return '出库';
      case 'adjust': return '调整';
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'in':
        return <ArrowDown size={16} />;
      case 'out':
        return <ArrowUp size={16} />;
      case 'adjust':
        return <RotateCcw size={16} />;
    }
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setFilterVisible(false);
  };

  const resetFilters = () => {
    const empty = { dateFrom: '', dateTo: '', compSearch: '', categoryId: '' };
    setFilters(empty);
    setAppliedFilters(empty);
    setFilterVisible(false);
  };

  return (
    <div className="transaction-list">
      <NavBar
        title="流水记录"
        rightAction={
          <div style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              onClick={() => setFilterVisible(true)}
            >
              <SlidersHorizontal size={20} />
            </button>
            {hasActiveFilters && <div className="filter-active-dot" />}
          </div>
        }
      />

      <div className="txn-segment-control">
        {['all', 'in', 'out', 'adjust'].map((type) => (
          <button
            key={type}
            className={`segment-item ${typeFilter === type ? 'segment-item-active' : ''}`}
            onClick={() => setTypeFilter(type)}
          >
            {type === 'all' ? '全部' : getTypeLabel(type as TransactionType)}
          </button>
        ))}
      </div>

      {filteredTxns.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 48, fontSize: 14 }}>
          暂无流水记录
        </div>
      ) : (
        groupedByMonth.map(([month, txns]) => (
          <div key={month} className="txn-month-group">
            <div className="txn-month-header">
              <span className="txn-month-label">{month}</span>
            </div>
            <div className="txn-month-items">
              {txns.map((txn) => {
                const comp = getComponentById(state.components, txn.componentId);
                return (
                  <div
                    key={txn.id}
                    className="txn-card"
                    onClick={() =>
                      navigate(`/inventory/${txn.componentId}`)
                    }
                  >
                    <div className={`txn-card-icon txn-card-icon-${txn.type}`}>
                      {getTypeIcon(txn.type)}
                    </div>
                    <div className="txn-card-info">
                      <div className="txn-card-name">
                        {comp?.name ?? '未知元件'}
                      </div>
                      <div className="txn-card-model">
                        {comp?.model || ''}
                      </div>
                      <div className="txn-card-date">
                        {formatDate(txn.date)}
                      </div>
                    </div>
                    <div className="txn-card-right">
                      <span className={`txn-card-qty qty-${txn.type}`}>
                        {txn.type === 'in' ? '+' : txn.type === 'out' ? '-' : '±'}
                        {txn.quantity}
                      </span>
                      {txn.note && (
                        <span className="txn-card-note">{txn.note}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <Modal
        visible={filterVisible}
        title="筛选"
        onClose={() => setFilterVisible(false)}
      >
        <div className="filter-modal-body">
          <div className="filter-modal-row">
            <label className="filter-modal-label">开始日期</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>
          <div className="filter-modal-row">
            <label className="filter-modal-label">结束日期</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
          <div className="filter-modal-row">
            <label className="filter-modal-label">元器件搜索</label>
            <input
              type="text"
              className="form-input"
              placeholder="输入名称或型号..."
              value={filters.compSearch}
              onChange={(e) =>
                setFilters({ ...filters, compSearch: e.target.value })
              }
            />
          </div>
          <div className="filter-modal-row">
            <label className="filter-modal-label">分类</label>
            <select
              className="form-select"
              value={filters.categoryId}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value })
              }
            >
              <option value="">全部分类</option>
              {state.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-modal-actions">
            <button
              className="filter-modal-btn filter-modal-btn-reset"
              onClick={resetFilters}
            >
              重置
            </button>
            <button
              className="filter-modal-btn filter-modal-btn-apply"
              onClick={applyFilters}
            >
              应用
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
