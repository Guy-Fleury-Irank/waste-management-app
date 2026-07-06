import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BarChart3, Users, MapPin, Truck, ClipboardList, User, Wrench } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const iconClass = "w-4 h-4 stroke-[1.5]";

  const navItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: <BarChart3 className={iconClass} />, roles: ['admin'] },
    { label: 'Tableau de bord', path: '/staff-dashboard', icon: <BarChart3 className={iconClass} />, roles: ['staff'] },
    { label: 'Mon tableau', path: '/client-dashboard', icon: <BarChart3 className={iconClass} />, roles: ['client'] },
    { label: 'Utilisateurs', path: '/users', icon: <Users className={iconClass} />, roles: ['admin'] },
    { label: 'Sites', path: '/sites', icon: <MapPin className={iconClass} />, roles: ['admin', 'staff', 'client'] },
    { label: 'Collectes', path: '/collectes', icon: <Truck className={iconClass} />, roles: ['admin', 'staff'] },
    { label: 'Véhicules', path: '/vehicules', icon: <Truck className={iconClass} />, roles: ['admin', 'staff'] },
    { label: 'Abonnements', path: '/abonnements', icon: <ClipboardList className={iconClass} />, roles: ['admin', 'staff', 'client'] },
    { label: 'Mon profil', path: '/profile', icon: <User className={iconClass} />, roles: ['admin', 'staff', 'client'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-60 bg-surface border-r border-border min-h-screen flex flex-col">
      {/* Header sidebar xAI */}
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-base font-bold tracking-tight text-gray-900">
          Waste<span className="font-light">Manager</span>
        </h1>
        <p className="text-xs text-gray-300 font-light mt-0.5">Gestion des déchets</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 font-light'
              }`
            }
          >
            <span className="flex items-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className="px-3 py-3 border-t border-gray-100">
        <NavLink
          to="/debug-mongo"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors ${
              isActive
                ? 'bg-gray-900 text-white font-medium'
                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50 font-light'
            }`
          }
        >
          <Wrench className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Diagnostic MongoDB</span>
        </NavLink>
      </div>
    </aside>
  );
}