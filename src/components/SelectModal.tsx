import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Modal from './Modal';
import './SelectModal.css';

interface SelectOption {
  id: string;
  name: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  value: string;
  placeholder?: string;
  allowCreate?: boolean;
  createLabel?: string;
  onSelect: (id: string) => void;
  onCreate?: (name: string) => void;
  onClose: () => void;
}

export default function SelectModal({
  visible,
  title,
  options,
  value,
  placeholder = '搜索...',
  allowCreate = false,
  createLabel = '新建',
  onSelect,
  onCreate,
  onClose,
}: SelectModalProps) {
  const [search, setSearch] = useState('');

  const filtered = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (onCreate && search.trim()) {
      onCreate(search.trim());
      setSearch('');
    }
  };

  const showCreate = allowCreate && search.trim() && !filtered.some(
    (o) => o.name.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <Modal visible={visible} title={title} onClose={onClose}>
      <div className="select-modal-search">
        <Search size={16} className="select-modal-search-icon" />
        <input
          type="text"
          className="select-modal-search-input"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="select-modal-list">
        {filtered.map((opt) => (
          <div
            key={opt.id}
            className={`select-modal-item ${value === opt.id ? 'select-modal-item-active' : ''}`}
            onClick={() => {
              onSelect(opt.id);
              setSearch('');
            }}
          >
            <span>{opt.name}</span>
            {value === opt.id && (
              <span className="select-modal-check">✓</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && !showCreate && (
          <div className="select-modal-empty">无匹配结果</div>
        )}
        {showCreate && (
          <div className="select-modal-item select-modal-create" onClick={handleCreate}>
            <Plus size={16} />
            <span>
              {createLabel} "{search}"
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
