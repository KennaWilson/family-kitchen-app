import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Calendar } from 'lucide-react';

export default function BubbleNav() {
  const navigate = useNavigate();

  const bubbles = [
    {
      icon: ShoppingCart,
      label: 'Grocery List',
      sub: 'View list & recipes',
      path: '/grocery',
      bg: 'bg-dusty-rose',
      shadow: 'shadow-dusty-rose/30',
    },
    {
      icon: Calendar,
      label: 'Calendar',
      sub: 'Events & schedule',
      path: '/calendar',
      bg: 'bg-purple-ash',
      shadow: 'shadow-purple-ash/30',
    },
  ];

  return (
    <div className="flex gap-6 justify-center mt-6">
      {bubbles.map(({ icon: Icon, label, sub, path, bg, shadow }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`flex flex-col items-center gap-3 ${bg} text-white px-10 py-6 rounded-3xl shadow-lg ${shadow} hover:scale-105 hover:brightness-105 transition-all duration-200`}
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon size={22} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-white/70 mt-0.5">{sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
