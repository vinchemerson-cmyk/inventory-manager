import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './NavBar.css';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
}

export default function NavBar({ title, showBack, backTo, rightAction }: NavBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1 as unknown as string);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {showBack && (
          <button className="navbar-back-btn" onClick={handleBack}>
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="navbar-title">{title}</h1>
      </div>
      {rightAction && <div className="navbar-right">{rightAction}</div>}
    </nav>
  );
}
