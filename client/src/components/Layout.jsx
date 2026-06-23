import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Pages sans sidebar (login, register, landing)
  const noSidebar = ['/login', '/register', '/'].includes(location.pathname);
  if (noSidebar) return children;

  // Si l'utilisateur n'est pas connecté sur une page protégée, rediriger vers login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const pageTitle = location.pathname.replace('/', '').replace(/\//g, ' > ') || 'Accueil';

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header xAI */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <h1 className="text-base font-medium text-gray-900 capitalize">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 font-light">{user?.name}</span>
            <button
              onClick={async () => { await logout(); navigate('/login'); }}
              className="text-sm text-gray-300 hover:text-gray-700 transition-colors font-light"
            >
              Déconnexion
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}