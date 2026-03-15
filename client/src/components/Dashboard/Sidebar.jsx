import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Calendar, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Star } from 'lucide-react';
import logoMark from '../../assets/domus-logo-mark.png';

const navItems = [
  { icon: Home,           label: 'Home',     path: '/dashboard' },
  { icon: ShoppingCart,   label: 'Grocery',  path: '/grocery' },
  { icon: UtensilsCrossed,label: 'Dinner',   path: '/dinner' },
  { icon: Calendar,       label: 'Calendar', path: '/calendar' },
];

export default function Sidebar() {
  const { activeProfile, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = activeProfile
    ? activeProfile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-20 min-h-screen bg-french-blue shadow-card flex flex-col items-center py-8 gap-2">
      {/* Logo mark */}
      <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center mb-6 bg-transparent">
        <img src={logoMark} alt="Domus logo" className="w-full h-full object-contain" />
      </div>

      {/* Nav links */}
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 ${
              active
                ? 'bg-purple-ash text-white shadow-md'
                : 'text-gray-400 hover:bg-cream hover:text-purple-ash'
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Profile + stars */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: activeProfile?.avatar_color || '#9B8BB4' }}
        >
          {initials}
        </div>
        <div className="flex items-center gap-0.5">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-semibold text-amber-500">{activeProfile?.stars ?? 0}</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/'); }}
        title="Switch profile"
        className="w-12 h-12 rounded-2xl text-gray-300 hover:bg-cream hover:text-dusty-rose transition-all"
      >
        <LogOut size={18} className="mx-auto" />
      </button>
    </aside>
  );
}
