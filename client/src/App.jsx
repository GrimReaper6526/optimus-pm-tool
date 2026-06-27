import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const { checkMe, isLoading } = useAuthStore();

  useEffect(() => {
    checkMe();
  }, [checkMe]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-primary flex flex-col transition-colors duration-150">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/board/:boardId"
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-surface-raised border border-border-default text-text-primary text-xs rounded-md shadow-md',
          style: {
            background: 'var(--surface-overlay)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)'
          }
        }}
      />
    </div>
  );
}
