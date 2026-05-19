import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getCategoryName, getLocationName } from '../utils/helpers';
import { NavBar, SearchBar, EmptyState } from '../components';
import './InventoryList.css';

type SortOption = 'default' | 'name-asc' | 'qty-asc' | 'qty-desc';

export default function InventoryList() {
  const { state } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const filtered = useMemo(() => {
    let list = state.components;

    if (categoryFilter !== 'all') {
      list = list.filter((c) => c.categoryId === categoryFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.package.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh'));
        break;
      case 'qty-asc':
        list = [...list].sort((a, b) => a.quantity - b.quantity);
        break;
      case 'qty-desc':
        list = [...list].sort((a, b) => b.quantity - a.quantity);
        break;
    }

    return list;
  }, [state.components, categoryFilter, search, sortBy]);

  return (
    <div className="inventory-list">
      <NavBar
        title="我的库存"
        rightAction={
          <button
            className="nav-add-btn"
            onClick={() => navigate('/inventory/new')}
          >
            <Plus size={18} />
            <span>新增</span>
          </button>
        }
      />

      <SearchBar
        placeholder="搜索名称 / 型号 / 封装"
        value={search}
        onChange={setSearch}
      />

      <div className="category-chips">
        <button
          className={`chip ${categoryFilter === 'all' ? 'chip-active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          全部
        </button>
        {state.categories.map((cat) => (
          <button
            key={cat.id}
            className={`chip ${categoryFilter === cat.id ? 'chip-active' : ''}`}
            onClick={() => setCategoryFilter(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="inventory-toolbar">
        <span className="toolbar-count">{filtered.length} 个元件</span>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="default">默认</option>
          <option value="name-asc">名称 A-Z</option>
          <option value="qty-asc">库存 ↑</option>
          <option value="qty-desc">库存 ↓</option>
        </select>
      </div>

      <div className="inventory-card-list">
        {filtered.length === 0 ? (
          <EmptyState
            title="暂无元件"
            description={search || categoryFilter !== 'all' ? '没有匹配的元件，试试调整筛选条件' : '点击右上角"新增"添加第一个元件'}
          />
        ) : (
          filtered.map((comp) => (
            <div
              key={comp.id}
              className="inventory-card"
              onClick={() => navigate(`/inventory/${comp.id}`)}
            >
              <div className="inventory-card-body">
                <div className="inventory-card-info">
                  <span className="inventory-card-name">{comp.name}</span>
                  <span className="inventory-card-meta">
                    {[comp.model, comp.package, comp.brand].filter(Boolean).join(' / ')}
                  </span>
                  <div className="inventory-card-footer">
                    <span className="inventory-card-location">
                      <MapPin size={12} />
                      {getLocationName(state.locations, comp.locationId)}
                    </span>
                    <span className="inventory-card-category">
                      {getCategoryName(state.categories, comp.categoryId)}
                    </span>
                  </div>
                </div>
                <div className="inventory-card-qty-wrap">
                  <span
                    className={`inventory-card-qty ${comp.quantity <= comp.safeStock ? 'qty-low' : ''}`}
                  >
                    {comp.quantity}
                  </span>
                  <span className="inventory-card-unit">{comp.unit}</span>
                  <ChevronRight size={16} color="#ccc" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
