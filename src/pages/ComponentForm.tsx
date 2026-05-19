import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { NavBar, SelectModal } from '../components';
import type { ComponentItem } from '../types';
import './ComponentForm.css';

const PACKAGE_OPTIONS = [
  '0805', '0603', '0402', 'SOT-23', 'SOD-123',
  'LQFP-48', 'QFN-32', 'SOP-8', 'DIP-8', '模块', '其他',
];
const UNIT_OPTIONS = ['个', '片', '米', '卷', '包'];

export default function ComponentForm() {
  const { id } = useParams<{ id: string }>();
  const { state, addComponent, updateComponent, addCategory, addLocation } = useApp();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const existing = useMemo(
    () => state.components.find((c) => c.id === id),
    [state.components, id]
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [model, setModel] = useState(existing?.model ?? '');
  const [pkg, setPkg] = useState(existing?.package ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity ?? 0);
  const [unit, setUnit] = useState(existing?.unit ?? '个');
  const [safeStock, setSafeStock] = useState(existing?.safeStock ?? 0);
  const [locationId, setLocationId] = useState(existing?.locationId ?? '');
  const [unitPrice, setUnitPrice] = useState(existing ? String(existing.unitPrice) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [datasheetUrl, setDatasheetUrl] = useState(existing?.datasheetUrl ?? '');
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '');
  const [showExtra, setShowExtra] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '请输入元件名称';
    if (!categoryId) errs.categoryId = '请选择分类';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit && existing) {
      const updated: ComponentItem = {
        ...existing,
        name: name.trim(),
        model,
        package: pkg,
        brand,
        categoryId,
        unit,
        safeStock,
        locationId,
        unitPrice: parseFloat(unitPrice) || 0,
        description,
        datasheetUrl,
        tags: tagList,
        updatedAt: new Date().toISOString(),
      };
      updateComponent(updated);
      navigate(`/inventory/${id}`);
    } else {
      addComponent({
        name: name.trim(),
        model,
        package: pkg,
        brand,
        categoryId,
        quantity: quantity || 0,
        unit,
        safeStock,
        locationId,
        unitPrice: parseFloat(unitPrice) || 0,
        description,
        datasheetUrl,
        tags: tagList,
      });
      navigate('/inventory');
    }
  };

  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    setCategoryModalVisible(false);
  };

  const handleCategoryCreate = (name: string) => {
    const newCat = addCategory(name);
    setCategoryId(newCat.id);
    setCategoryModalVisible(false);
  };

  const handleLocationSelect = (locId: string) => {
    setLocationId(locId);
    setLocationModalVisible(false);
  };

  const handleLocationCreate = (name: string) => {
    const newLoc = addLocation(name);
    setLocationId(newLoc.id);
    setLocationModalVisible(false);
  };

  const selectedCategory = state.categories.find((c) => c.id === categoryId);
  const selectedLocation = state.locations.find((l) => l.id === locationId);

  return (
    <div className="component-form">
      <NavBar
        title={isEdit ? '编辑元器件' : '新增元器件'}
        showBack
        backTo={isEdit ? `/inventory/${id}` : '/inventory'}
        rightAction={
          <button className="nav-save-btn" onClick={handleSave}>
            保存
          </button>
        }
      />

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">基本信息</h3>
        </div>
        <div className="form-section-body">
          <div className="form-row">
            <label className="form-label form-label-required">名称</label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：STM32F103C8T6"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-row">
            <label className="form-label">型号</label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：ARM Cortex-M3"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label">封装</label>
            <select
              className="form-select"
              value={pkg}
              onChange={(e) => setPkg(e.target.value)}
            >
              <option value="">请选择封装</option>
              {PACKAGE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">品牌</label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：ST / 国巨 / 村田"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label form-label-required">分类</label>
            <div
              className="select-modal-trigger"
              onClick={() => setCategoryModalVisible(true)}
            >
              <span className={selectedCategory ? '' : 'select-modal-placeholder'}>
                {selectedCategory?.name || '请选择分类'}
              </span>
            </div>
            {errors.categoryId && (
              <div className="form-error">{errors.categoryId}</div>
            )}
          </div>
          <SelectModal
            visible={categoryModalVisible}
            title="选择分类"
            options={state.categories}
            value={categoryId}
            placeholder="搜索分类..."
            allowCreate
            createLabel="新建分类"
            onSelect={handleCategorySelect}
            onCreate={handleCategoryCreate}
            onClose={() => setCategoryModalVisible(false)}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">库存参数</h3>
        </div>
        <div className="form-section-body">
          <div className="form-row">
            <label className="form-label form-label-required">初始数量</label>
            {isEdit ? (
              <div>
                <div className="quantity-readonly-wrap">
                  <input
                    type="text"
                    className="form-input"
                    value={quantity}
                    readOnly
                  />
                  <span className="quantity-readonly-unit">{unit}</span>
                </div>
                <div className="form-hint">
                  库存数量需通过入库 / 出库 / 盘点调整修改
                </div>
              </div>
            ) : (
              <input
                type="number"
                className="form-input"
                placeholder="0"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            )}
          </div>

          <div className="form-row">
            <label className="form-label">单位</label>
            <select
              className="form-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">安全库存</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              min={0}
              value={safeStock}
              onChange={(e) => setSafeStock(Number(e.target.value))}
            />
          </div>

          <div className="form-row">
            <label className="form-label">存放位置</label>
            <div
              className="select-modal-trigger"
              onClick={() => setLocationModalVisible(true)}
            >
              <span className={selectedLocation ? '' : 'select-modal-placeholder'}>
                {selectedLocation?.name || '请选择位置'}
              </span>
            </div>
          </div>
          <SelectModal
            visible={locationModalVisible}
            title="选择位置"
            options={state.locations}
            value={locationId}
            placeholder="搜索位置..."
            allowCreate
            createLabel="新建位置"
            onSelect={handleLocationSelect}
            onCreate={handleLocationCreate}
            onClose={() => setLocationModalVisible(false)}
          />

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
        </div>
      </div>

      <div className="form-section">
        <div
          className="form-section-header"
          onClick={() => setShowExtra(!showExtra)}
        >
          <h3 className="form-section-title">附加信息</h3>
          <ChevronDown
            size={18}
            className={`section-collapse-icon ${showExtra ? 'open' : ''}`}
          />
        </div>
        {showExtra && (
          <div className="form-section-body">
            <div className="form-row">
              <label className="form-label">备注</label>
              <textarea
                className="form-textarea"
                placeholder="补充描述信息..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">规格书链接</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={datasheetUrl}
                onChange={(e) => setDatasheetUrl(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">标签</label>
              <input
                type="text"
                className="form-input"
                placeholder="多个标签用逗号分隔，例如：常用, 0805"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
