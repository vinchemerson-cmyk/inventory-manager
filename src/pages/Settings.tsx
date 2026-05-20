import { useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { exportComponentsCSV, exportTransactionsCSV, downloadCSV } from '../utils/csv';
import { NavBar, ConfirmDialog } from '../components';
import {
  Pencil, Trash2, Plus, Check, X,
  Download, Upload, AlertTriangle, Info
} from 'lucide-react';
import type { Category, Location, Supplier, BrandItem, PackageItem, ModelItem } from '../types';
import './Settings.css';

interface EditingItem {
  id: string | null;
  name: string;
}

const UNITS = ['个', '片', '米', '升', '克', '千克', '套', '卷', '包', '盒'];

export default function Settings() {
  const {
    state,
    addCategory, updateCategory, deleteCategory,
    addLocation, updateLocation, deleteLocation,
    addSupplier, updateSupplier, deleteSupplier,
    addBrand, updateBrand, deleteBrand,
    addPackage, updatePackage, deletePackage,
    addModel, updateModel, deleteModel,
    updateSettings,
    exportData, importData, resetData
  } = useApp();
  const { categories, locations, suppliers, brands, packages, models, settings, components, transactions } = state;

  const [editingCategory, setEditingCategory] = useState<EditingItem>({ id: null, name: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [editingLocation, setEditingLocation] = useState<EditingItem>({ id: null, name: '' });
  const [newLocationName, setNewLocationName] = useState('');
  const [showNewLocation, setShowNewLocation] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<EditingItem>({ id: null, name: '' });
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showNewSupplier, setShowNewSupplier] = useState(false);

  const [editingBrand, setEditingBrand] = useState<EditingItem>({ id: null, name: '' });
  const [newBrandName, setNewBrandName] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);

  const [editingPackage, setEditingPackage] = useState<EditingItem>({ id: null, name: '' });
  const [newPackageName, setNewPackageName] = useState('');
  const [showNewPackage, setShowNewPackage] = useState(false);

  const [editingModel, setEditingModel] = useState<EditingItem>({ id: null, name: '' });
  const [newModelName, setNewModelName] = useState('');
  const [showNewModel, setShowNewModel] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory({ id: cat.id, name: cat.name });
  };

  const handleSaveCategory = () => {
    if (editingCategory.name.trim() && editingCategory.id) {
      updateCategory({ id: editingCategory.id, name: editingCategory.name.trim() });
    }
    setEditingCategory({ id: null, name: '' });
  };

  const handleCancelEditCategory = () => {
    setEditingCategory({ id: null, name: '' });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const handleStartEditLocation = (loc: Location) => {
    setEditingLocation({ id: loc.id, name: loc.name });
  };

  const handleSaveLocation = () => {
    if (editingLocation.name.trim() && editingLocation.id) {
      updateLocation({ id: editingLocation.id, name: editingLocation.name.trim() });
    }
    setEditingLocation({ id: null, name: '' });
  };

  const handleCancelEditLocation = () => {
    setEditingLocation({ id: null, name: '' });
  };

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      addLocation(newLocationName.trim());
      setNewLocationName('');
      setShowNewLocation(false);
    }
  };

  const handleStartEditSupplier = (sup: Supplier) => {
    setEditingSupplier({ id: sup.id, name: sup.name });
  };

  const handleSaveSupplier = () => {
    if (editingSupplier.name.trim() && editingSupplier.id) {
      updateSupplier({ id: editingSupplier.id, name: editingSupplier.name.trim() });
    }
    setEditingSupplier({ id: null, name: '' });
  };

  const handleCancelEditSupplier = () => {
    setEditingSupplier({ id: null, name: '' });
  };

  const handleAddSupplier = () => {
    if (newSupplierName.trim()) {
      addSupplier(newSupplierName.trim());
      setNewSupplierName('');
      setShowNewSupplier(false);
    }
  };

  const handleStartEditBrand = (brand: BrandItem) => {
    setEditingBrand({ id: brand.id, name: brand.name });
  };

  const handleSaveBrand = () => {
    if (editingBrand.name.trim() && editingBrand.id) {
      updateBrand({ id: editingBrand.id, name: editingBrand.name.trim() });
    }
    setEditingBrand({ id: null, name: '' });
  };

  const handleCancelEditBrand = () => {
    setEditingBrand({ id: null, name: '' });
  };

  const handleAddBrand = () => {
    if (newBrandName.trim()) {
      addBrand(newBrandName.trim());
      setNewBrandName('');
      setShowNewBrand(false);
    }
  };

  const handleStartEditPackage = (pkg: PackageItem) => {
    setEditingPackage({ id: pkg.id, name: pkg.name });
  };

  const handleSavePackage = () => {
    if (editingPackage.name.trim() && editingPackage.id) {
      updatePackage({ id: editingPackage.id, name: editingPackage.name.trim() });
    }
    setEditingPackage({ id: null, name: '' });
  };

  const handleCancelEditPackage = () => {
    setEditingPackage({ id: null, name: '' });
  };

  const handleAddPackage = () => {
    if (newPackageName.trim()) {
      addPackage(newPackageName.trim());
      setNewPackageName('');
      setShowNewPackage(false);
    }
  };

  const handleStartEditModel = (model: ModelItem) => {
    setEditingModel({ id: model.id, name: model.name });
  };

  const handleSaveModel = () => {
    if (editingModel.name.trim() && editingModel.id) {
      updateModel({ id: editingModel.id, name: editingModel.name.trim() });
    }
    setEditingModel({ id: null, name: '' });
  };

  const handleCancelEditModel = () => {
    setEditingModel({ id: null, name: '' });
  };

  const handleAddModel = () => {
    if (newModelName.trim()) {
      addModel(newModelName.trim());
      setNewModelName('');
      setShowNewModel(false);
    }
  };

  const handleExportCSV = () => {
    const csv = exportComponentsCSV(components, categories, locations);
    downloadCSV(csv, `库存数据_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportTransactions = () => {
    const csv = exportTransactionsCSV(transactions, components, suppliers);
    downloadCSV(csv, `流水数据_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportJSON = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `全部数据_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = importData(text);
      setImportMessage(success ? '数据导入成功！' : '导入失败，请检查文件格式。');
      setTimeout(() => setImportMessage(null), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    resetData();
    setShowResetConfirm(false);
  };

  const renderEditRow = (
    item: EditingItem,
    onSave: () => void,
    onCancel: () => void,
    onChange: (name: string) => void
  ) => (
    <div className="settings-edit-row">
      <input
        className="settings-edit-row__input"
        value={item.name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
      />
      <button className="settings-icon-btn settings-icon-btn--save" onClick={onSave} title="保存">
        <Check size={16} />
      </button>
      <button className="settings-icon-btn settings-icon-btn--cancel" onClick={onCancel} title="取消">
        <X size={16} />
      </button>
    </div>
  );

  const renderNewRow = (
    value: string,
    onSave: () => void,
    onCancel: () => void,
    onChange: (v: string) => void,
    placeholder: string
  ) => (
    <div className="settings-edit-row">
      <input
        className="settings-edit-row__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={placeholder}
        autoFocus
      />
      <button className="settings-icon-btn settings-icon-btn--save" onClick={onSave} title="保存">
        <Check size={16} />
      </button>
      <button className="settings-icon-btn settings-icon-btn--cancel" onClick={onCancel} title="取消">
        <X size={16} />
      </button>
    </div>
  );

  return (
    <div className="settings-page">
      <NavBar title="个人设置" />

      <div className="settings-page__content">
        <div className="settings-card">
          <h3 className="settings-card__title">分类管理</h3>
          <div className="settings-list">
            {categories.map((cat) => (
              <div key={cat.id} className="settings-list__item">
                {editingCategory.id === cat.id ? (
                  renderEditRow(
                    editingCategory,
                    handleSaveCategory,
                    handleCancelEditCategory,
                    (name) => setEditingCategory((prev) => ({ ...prev, name }))
                  )
                ) : (
                  <>
                    <span className="settings-list__name">{cat.name}</span>
                    <div className="settings-list__actions">
                      <button
                        className="settings-icon-btn"
                        onClick={() => handleStartEditCategory(cat)}
                        title="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn settings-icon-btn--danger"
                        onClick={() => deleteCategory(cat.id)}
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {showNewCategory && (
              <div className="settings-list__item">
                {renderNewRow(newCategoryName, handleAddCategory, () => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                }, setNewCategoryName, '输入分类名称')}
              </div>
            )}
          </div>
          {!showNewCategory && (
            <button
              className="settings-add-btn"
              onClick={() => setShowNewCategory(true)}
            >
              <Plus size={16} />
              新增分类
            </button>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">存放位置管理</h3>
          <div className="settings-list">
            {locations.map((loc) => (
              <div key={loc.id} className="settings-list__item">
                {editingLocation.id === loc.id ? (
                  renderEditRow(
                    editingLocation,
                    handleSaveLocation,
                    handleCancelEditLocation,
                    (name) => setEditingLocation((prev) => ({ ...prev, name }))
                  )
                ) : (
                  <>
                    <span className="settings-list__name">{loc.name}</span>
                    <div className="settings-list__actions">
                      <button
                        className="settings-icon-btn"
                        onClick={() => handleStartEditLocation(loc)}
                        title="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn settings-icon-btn--danger"
                        onClick={() => deleteLocation(loc.id)}
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {showNewLocation && (
              <div className="settings-list__item">
                {renderNewRow(newLocationName, handleAddLocation, () => {
                  setShowNewLocation(false);
                  setNewLocationName('');
                }, setNewLocationName, '输入位置名称')}
              </div>
            )}
          </div>
          {!showNewLocation && (
            <button
              className="settings-add-btn"
              onClick={() => setShowNewLocation(true)}
            >
              <Plus size={16} />
              新增位置
            </button>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">供应商管理</h3>
          <div className="settings-list">
            {suppliers.map((sup) => (
              <div key={sup.id} className="settings-list__item">
                {editingSupplier.id === sup.id ? (
                  renderEditRow(
                    editingSupplier,
                    handleSaveSupplier,
                    handleCancelEditSupplier,
                    (name) => setEditingSupplier((prev) => ({ ...prev, name }))
                  )
                ) : (
                  <>
                    <span className="settings-list__name">{sup.name}</span>
                    <div className="settings-list__actions">
                      <button
                        className="settings-icon-btn"
                        onClick={() => handleStartEditSupplier(sup)}
                        title="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn settings-icon-btn--danger"
                        onClick={() => deleteSupplier(sup.id)}
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {showNewSupplier && (
              <div className="settings-list__item">
                {renderNewRow(newSupplierName, handleAddSupplier, () => {
                  setShowNewSupplier(false);
                  setNewSupplierName('');
                }, setNewSupplierName, '输入供应商名称')}
              </div>
            )}
          </div>
          {!showNewSupplier && (
            <button
              className="settings-add-btn"
              onClick={() => setShowNewSupplier(true)}
            >
              <Plus size={16} />
              新增供应商
            </button>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">品牌管理</h3>
          <div className="settings-list">
            {brands.map((brand) => (
              <div key={brand.id} className="settings-list__item">
                {editingBrand.id === brand.id ? (
                  renderEditRow(
                    editingBrand,
                    handleSaveBrand,
                    handleCancelEditBrand,
                    (name) => setEditingBrand((prev) => ({ ...prev, name }))
                  )
                ) : (
                  <>
                    <span className="settings-list__name">{brand.name}</span>
                    <div className="settings-list__actions">
                      <button
                        className="settings-icon-btn"
                        onClick={() => handleStartEditBrand(brand)}
                        title="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn settings-icon-btn--danger"
                        onClick={() => deleteBrand(brand.id)}
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {showNewBrand && (
              <div className="settings-list__item">
                {renderNewRow(newBrandName, handleAddBrand, () => {
                  setShowNewBrand(false);
                  setNewBrandName('');
                }, setNewBrandName, '输入品牌名称')}
              </div>
            )}
          </div>
          {!showNewBrand && (
            <button
              className="settings-add-btn"
              onClick={() => setShowNewBrand(true)}
            >
              <Plus size={16} />
              新增品牌
            </button>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">封装管理</h3>
          <div className="settings-list">
            {packages.map((pkg) => (
              <div key={pkg.id} className="settings-list__item">
                {editingPackage.id === pkg.id ? (
                  renderEditRow(
                    editingPackage,
                    handleSavePackage,
                    handleCancelEditPackage,
                    (name) => setEditingPackage((prev) => ({ ...prev, name }))
                  )
                ) : (
                  <>
                    <span className="settings-list__name">{pkg.name}</span>
                    <div className="settings-list__actions">
                      <button
                        className="settings-icon-btn"
                        onClick={() => handleStartEditPackage(pkg)}
                        title="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn settings-icon-btn--danger"
                        onClick={() => deletePackage(pkg.id)}
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {showNewPackage && (
              <div className="settings-list__item">
                {renderNewRow(newPackageName, handleAddPackage, () => {
                  setShowNewPackage(false);
                  setNewPackageName('');
                }, setNewPackageName, '输入封装名称')}
              </div>
            )}
          </div>
          {!showNewPackage && (
            <button
              className="settings-add-btn"
              onClick={() => setShowNewPackage(true)}
            >
              <Plus size={16} />
              新增封装
            </button>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">型号管理</h3>
          <div className="settings-list">
            {models.map((model) => (
              <div key={model.id} className="settings-list__item">
                {editingModel.id === model.id ? (
                  renderEditRow(
                    editingModel,
                    handleSaveModel,
                    handleCancelEditModel,
                    (name) => setEditingModel((prev) => ({ ...prev, name }))
                  )
                ) : (
                  <>
                    <span className="settings-list__name">{model.name}</span>
                    <div className="settings-list__actions">
                      <button
                        className="settings-icon-btn"
                        onClick={() => handleStartEditModel(model)}
                        title="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn settings-icon-btn--danger"
                        onClick={() => deleteModel(model.id)}
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {showNewModel && (
              <div className="settings-list__item">
                {renderNewRow(newModelName, handleAddModel, () => {
                  setShowNewModel(false);
                  setNewModelName('');
                }, setNewModelName, '输入型号名称')}
              </div>
            )}
          </div>
          {!showNewModel && (
            <button
              className="settings-add-btn"
              onClick={() => setShowNewModel(true)}
            >
              <Plus size={16} />
              新增型号
            </button>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">数据管理</h3>
          <div className="settings-data-actions">
            <button className="settings-btn settings-btn--primary" onClick={handleExportCSV}>
              <Download size={16} />
              导出库存 CSV
            </button>
            <button className="settings-btn settings-btn--primary" onClick={handleExportTransactions}>
              <Download size={16} />
              导出流水 CSV
            </button>
            <button className="settings-btn settings-btn--primary" onClick={handleExportJSON}>
              <Download size={16} />
              导出全部数据 (JSON)
            </button>
            <button className="settings-btn settings-btn--secondary" onClick={handleImportClick}>
              <Upload size={16} />
              导入数据
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button className="settings-btn settings-btn--danger" onClick={() => setShowResetConfirm(true)}>
              <AlertTriangle size={16} />
              清空所有数据
            </button>
          </div>
          {importMessage && (
            <div className={`settings-import-msg ${importMessage.includes('成功') ? 'settings-import-msg--success' : 'settings-import-msg--error'}`}>
              {importMessage}
            </div>
          )}
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">应用设置</h3>
          <div className="settings-options">
            <div className="settings-option">
              <span className="settings-option__label">低库存预警</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.lowStockAlertEnabled}
                  onChange={(e) => updateSettings({ lowStockAlertEnabled: e.target.checked })}
                />
                <span className="settings-toggle__slider" />
              </label>
            </div>

            <div className="settings-option">
              <span className="settings-option__label">默认单位</span>
              <select
                className="settings-select"
                value={settings.defaultUnit}
                onChange={(e) => updateSettings({ defaultUnit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="settings-option">
              <span className="settings-option__label">货币符号</span>
              <input
                className="settings-input"
                type="text"
                value={settings.currency}
                onChange={(e) => updateSettings({ currency: e.target.value })}
                maxLength={5}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3 className="settings-card__title">关于</h3>
          <div className="settings-about">
            <div className="settings-about__row">
              <Info size={20} className="settings-about__icon" />
              <div>
                <p className="settings-about__name">元器件库存管理系统</p>
                <p className="settings-about__desc">专业的电子元器件库存管理工具，支持入库、出库、库存统计与数据分析。</p>
              </div>
            </div>
            <div className="settings-about__meta">
              <span>版本 1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          visible
          title="确认清空"
          message="此操作将清空所有库存数据和流水记录，且不可恢复。确定要继续吗？"
          confirmText="确定清空"
          cancelText="取消"
          onConfirm={handleResetData}
          onCancel={() => setShowResetConfirm(false)}
          danger
        />
      )}
    </div>
  );
}
