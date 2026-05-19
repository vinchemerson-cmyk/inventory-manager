import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { getCategoryName, getLocationName } from '../utils/helpers';
import { NavBar, EmptyState } from '../components';
import { Search, X, Clock, ArrowRight, Package } from 'lucide-react';
import './Search.css';

const SEARCH_HISTORY_KEY = 'inventory_search_history';
const MAX_HISTORY = 10;

function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveSearchHistory(history: string[]) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { components, categories, locations } = state;

  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(loadSearchHistory);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase().trim();
    return components.filter((c) =>
      c.name.toLowerCase().includes(lower) ||
      c.model.toLowerCase().includes(lower) ||
      c.package.toLowerCase().includes(lower) ||
      c.brand.toLowerCase().includes(lower)
    );
  }, [query, components]);

  const handleInputFocus = () => {
    if (!query.trim()) {
      setIsHistoryOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      setIsHistoryOpen(true);
    } else {
      setIsHistoryOpen(false);
    }
  };

  const handleResultClick = (id: string) => {
    addToHistory(query.trim());
    navigate(`/components/${id}`);
  };

  const addToHistory = (term: string) => {
    if (!term) return;
    const newHistory = [term, ...searchHistory.filter((h) => h !== term)].slice(0, MAX_HISTORY);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    setIsHistoryOpen(false);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      addToHistory(query.trim());
      setIsHistoryOpen(false);
    }
  };

  const handleClearInput = () => {
    setQuery('');
    inputRef.current?.focus();
    setIsHistoryOpen(true);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsHistoryOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showHistory = isHistoryOpen && searchHistory.length > 0 && !query.trim();

  return (
    <div className="search-page">
      <NavBar title="搜索" showBack />

      <div className="search-page__content" ref={containerRef}>
        <div className="search-input-wrapper">
          <Search size={20} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="搜索元器件名称、型号、封装、品牌..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="search-clear-btn" onClick={handleClearInput}>
              <X size={18} />
            </button>
          )}
        </div>

        {showHistory && (
          <div className="search-history">
            <div className="search-history__header">
              <span className="search-history__title">
                <Clock size={16} />
                搜索历史
              </span>
              <button className="search-history__clear" onClick={handleClearHistory}>
                清空
              </button>
            </div>
            <div className="search-history__list">
              {searchHistory.map((term, i) => (
                <button
                  key={i}
                  className="search-history__item"
                  onClick={() => handleHistoryClick(term)}
                >
                  <Clock size={14} className="search-history__item-icon" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && (
          <div className="search-results">
            <div className="search-results__header">
              找到 <strong>{results.length}</strong> 个匹配结果
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon={<Search size={48} />}
                title="未找到匹配结果"
                description="请尝试其他关键词搜索"
              />
            ) : (
              <div className="search-results__list">
                {results.map((comp) => (
                  <div
                    key={comp.id}
                    className="search-result-card"
                    onClick={() => handleResultClick(comp.id)}
                  >
                    <div className="search-result-card__main">
                      <div className="search-result-card__header">
                        <Package size={18} className="search-result-card__package-icon" />
                        <span className="search-result-card__name">{comp.name}</span>
                        {comp.model && (
                          <span className="search-result-card__model">{comp.model}</span>
                        )}
                      </div>
                      <div className="search-result-card__meta">
                        <span className="search-result-card__tag">
                          {getCategoryName(categories, comp.categoryId)}
                        </span>
                        {comp.package && (
                          <span className="search-result-card__detail">{comp.package}</span>
                        )}
                        {comp.brand && (
                          <span className="search-result-card__detail">{comp.brand}</span>
                        )}
                      </div>
                    </div>
                    <div className="search-result-card__aside">
                      <span className="search-result-card__quantity">{comp.quantity}</span>
                      <span className="search-result-card__location">
                        {getLocationName(locations, comp.locationId)}
                      </span>
                      <ArrowRight size={16} className="search-result-card__arrow" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
