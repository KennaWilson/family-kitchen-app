import { Star } from 'lucide-react';

export default function ProfileCard({ profile, onSelect }) {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={() => onSelect(profile)}
      className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-white shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-200 w-52 cursor-pointer"
    >
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
        style={{ backgroundColor: profile.avatar_color }}
      >
        {initials}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-semibold text-gray-800 text-lg">{profile.name}</p>
        {profile.role && <p className="text-sm text-gray-400 mt-0.5">{profile.role}</p>}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <span className="text-xs font-semibold text-amber-500">{profile.stars} stars</span>
      </div>

      <span className="text-xs text-purple-ash font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Tap to enter →
      </span>
    </button>
  );
}
