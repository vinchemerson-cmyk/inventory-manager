import { useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getTodayStr } from '../utils/helpers';
import { NavBar, Modal, SelectModal } from '../components';
import type { TransactionType, OutType } from '../types';
import './TransactionForm.css';

export default function TransactionForm() {
  const { type: urlType } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, addTransaction, addSupplier } = useApp();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const preSelectedComponentId = queryParams.get('componentId');

  const txnType: TransactionType =
    urlType === 'in' ? 'in' : urlType === 'adjust' ? 'adjust' : 'out';

  const isIn = txnType === 'in';
  const isOut = txnType === 'out';
  const isAdjust = txnType === 'adjust';

  const [componentId, setComponentId] = useState(preSelectedComponentId || '');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [outType, setOutType] = useState<OutType>('project_use');
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const [compSearchVisible, setCompSearchVisible] = useState(false);
  const [compSearch, setCompSearch] = useState('');
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);

  const selectedComponent = useMemo(
    () => state.components.find((c) => c.id === componentId),
    [state.components, componentId]
  );

  const filteredComponents = useMemo(() => {
    if (!compSearch.trim()) {
      return state.components.slice(0, 30);
    }
    const q = compSearch.trim().toLowerCase();
    return state.components
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [state.components, compSearch]);

  const validate = (): boolean => {
    if (!componentId) {
      setError('请选择元器件');
      return false;
    }
    const qty = Number(quantity);
    if (!quantity || qty <= 0 || !Number.isInteger(qty)) {
      setError('请输入有效的正整数数量');
      return false;
    }
    if (isOut && selectedComponent && qty > selectedComponent.quantity) {
      setError(`出库数量不能超过当前库存 (${selectedComponent.quantity})`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    const qty = Number(quantity);

    addTransaction({
      componentId,
      type: txnType,
      quantity: qty,
      unitPrice: isIn && unitPrice ? parseFloat(unitPrice) : undefined,
      totalPrice: isIn && unitPrice ? qty * parseFloat(unitPrice) : undefined,
      supplierId: isIn && supplierId ? supplierId : undefined,
      outType: isOut ? outType : undefined,
      projectName: isOut && projectName ? projectName : undefined,
      date,
      note,
      operator: '操作员',
    });

    navigate(-1 as unknown as string);
  };

  const getTitle = () => {
    if (isIn) return '新增入库';
    if (isOut) return '新增出库';
    return '库存调整';
  };

  const getBackTo = () => {
    if (preSelectedComponentId) {
      return `/inventory/${preSelectedComponentId}`;
    }
    return '/transactions';
  };

  return (
    <div className="transaction-form">
      <NavBar
        title={getTitle()}
        showBack
        backTo={getBackTo()}
        rightAction={
          <button className="nav-save-btn" onClick={handleSave}>
            保存
          </button>
        }
      />

      {error && <div className="transaction-error">{error}</div>}

      <div className="comp-select-section" style={{ marginTop: 16 }}>
        <label className="comp-select-label comp-select-label-required">
          元器件
        </label>
        <div
          className="comp-select-trigger"
          onClick={() => setCompSearchVisible(true)}
        >
          <span className={selectedComponent ? '' : 'comp-select-placeholder'}>
            {selectedComponent
              ? `${selectedComponent.name} (${selectedComponent.model || '-'})`
              : '选择元器件'}
          </span>
          <ChevronDown size={16} className="comp-select-arrow" />
        </div>
      </div>

      <Modal
        visible={compSearchVisible}
        title="选择元器件"
        onClose={() => setCompSearchVisible(false)}
      >
        <div className="comp-search-modal-body">
          <div className="select-modal-search">
            <Search size={16} className="select-modal-search-icon" />
            <input
              type="text"
              className="select-modal-search-input"
              placeholder="搜索名称或型号..."
              value={compSearch}
              onChange={(e) => setCompSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="comp-search-result">
            {filteredComponents.length === 0 && (
              <div className="select-modal-empty">无匹配元器件</div>
            )}
            {filteredComponents.map((comp) => (
              <div
                key={comp.id}
                className={`comp-search-item ${componentId === comp.id ? 'comp-search-item-active' : ''}`}
                onClick={() => {
                  setComponentId(comp.id);
                  setCompSearchVisible(false);
                  setCompSearch('');
                }}
              >
                <div className="comp-search-item-left">
                  <div className="comp-search-item-name">{comp.name}</div>
                  <div className="comp-search-item-meta">
                    {comp.model} {comp.package && `| ${comp.package}`}
                  </div>
                </div>
                <div className="comp-search-item-right">
                  {comp.quantity} {comp.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <div className="form-section" style={{ marginTop: 12 }}>
        <div className="form-section-body">
          <div className="form-row">
            <label className="form-label form-label-required">数量</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="0"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {selectedComponent && (
                <span style={{ fontSize: 14, color: '#666', whiteSpace: 'nowrap' }}>
                  {selectedComponent.unit} (库存: {selectedComponent.quantity})
                </span>
              )}
            </div>
          </div>

          {isIn && (
            <>
              <div className="form-row">
                <label className="form-label">单价 ({state.settings.currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label className="form-label">供应商</label>
                <div
                  className="select-modal-trigger"
                  onClick={() => setSupplierModalVisible(true)}
                >
                  <span className={supplierId ? '' : 'select-modal-placeholder'}>
                    {state.suppliers.find((s) => s.id === supplierId)?.name || '选择供应商'}
                  </span>
                </div>
              </div>
              <SelectModal
                visible={supplierModalVisible}
                title="选择供应商"
                options={state.suppliers}
                value={supplierId}
                placeholder="搜索供应商..."
                allowCreate
                createLabel="新建供应商"
                onSelect={(id) => {
                  setSupplierId(id);
                  setSupplierModalVisible(false);
                }}
                onCreate={(name) => {
                  addSupplier(name);
                }}
                onClose={() => setSupplierModalVisible(false)}
              />
            </>
          )}

          {isOut && (
            <>
              <div className="out-type-section">
                <label className="form-label">出库类型</label>
                <select
                  className="form-select"
                  value={outType}
                  onChange={(e) => setOutType(e.target.value as OutType)}
                >
                  <option value="project_use">项目消耗</option>
                  <option value="scrap">报废</option>
                  <option value="giveaway">赠送</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label">项目名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例如：智能小车项目"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </>
          )}

          {isAdjust && (
            <div className="form-row">
              <label className="form-label form-label-required">调整后库存</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="0"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {selectedComponent && (
                  <span style={{ fontSize: 14, color: '#666', whiteSpace: 'nowrap' }}>
                    {selectedComponent.unit} (当前: {selectedComponent.quantity})
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <label className="form-label">日期</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label">备注</label>
            <input
              type="text"
              className="form-input"
              placeholder="备注信息..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
