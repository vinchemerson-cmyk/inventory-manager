import { useState } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  placeholder = '搜索...',
  value,
  onChange,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`searchbar ${focused ? 'searchbar-focused' : ''}`}>
      <Search size={18} className="searchbar-icon" />
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button className="searchbar-clear" onClick={() => onChange('')}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
