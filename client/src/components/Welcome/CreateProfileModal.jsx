import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api';

const AVATAR_COLORS = [
  '#9B8BB4', '#7B8FA1', '#C9919C', '#B5A99A',
  '#A8C5B5', '#D4A5A5', '#8BA0C9', '#C4A882',
];

export default function CreateProfileModal({ onCreated, onClose }) {
  const [name, setName] = useState('');
  const [homeTime, setHomeTime] = useState('17:00');
  const [role, setRole] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a name'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/profiles', {
        name: name.trim(),
        avatar_color: avatarColor,
        home_time: homeTime,
        role: role.trim(),
      });
      onCreated(data);
    } catch {
      setError('Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-soft w-full max-w-md p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Create Profile</h2>
        <p className="text-sm text-gray-400 mb-6">Set up your personal home assistant profile</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Your name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alyssa"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/40 text-gray-700"
              autoFocus
            />
          </div>

          {/* Home time */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">What time do you usually get home from work?</label>
            <input
              type="time"
              value={homeTime}
              onChange={(e) => setHomeTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/40 text-gray-700"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role / nickname <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Mom, Partner, Dad…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/40 text-gray-700"
            />
          </div>

          {/* Avatar color */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Avatar color</label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className="w-9 h-9 rounded-full border-4 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: avatarColor === c ? '#3a3a3a' : 'transparent',
                    transform: avatarColor === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-dusty-rose">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-ash text-white font-semibold text-sm hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
