import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  return (
    <nav className="h-14 border-b border-border-default bg-page flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="font-semibold text-text-primary tracking-tight">Modus</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-subtle transition-colors duration-150"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {!user && (
          <Link to="/auth" className="text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-default hover:border-border-strong px-3 py-1.5 rounded transition-all">
            Sign In
          </Link>
        )}

        {user && (
          <div className="flex items-center gap-3 border-l border-border-default pl-3">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-all">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-6 h-6 rounded-full border border-border-default bg-muted"
              />
              <span className="text-sm font-medium text-text-primary hidden sm:inline">{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-md text-text-secondary hover:text-error-text hover:bg-error-bg/30 transition-colors duration-150"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
