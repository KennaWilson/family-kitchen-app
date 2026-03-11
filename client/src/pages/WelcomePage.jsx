import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api';
import { useApp } from '../context/AppContext';
import ProfileCard from '../components/Welcome/ProfileCard';
import CreateProfileModal from '../components/Welcome/CreateProfileModal';

export default function WelcomePage() {
  const [profiles, setProfiles] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [greeting, setGreeting] = useState(null); // { name }
  const { login } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/profiles').then((r) => setProfiles(r.data)).catch(console.error);
  }, []);

  function handleSelect(profile) {
    setGreeting(profile);
    login(profile);
    setTimeout(() => navigate('/dashboard'), 2400);
  }

  function handleCreated(profile) {
    setProfiles((prev) => [...prev, profile]);
    setShowCreate(false);
    handleSelect(profile);
  }

  if (greeting) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        {/* Animated floating blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                backgroundColor: ['#9B8BB4','#7B8FA1','#C9919C','#B5A99A','#9B8BB4','#7B8FA1'][i],
                top: `${10 + i * 12}%`,
                left: `${5 + i * 15}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2.5 + i * 0.4}s`,
              }}
            />
          ))}
        </div>
        <div className="relative text-center animate-fadeIn">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-xl"
            style={{ backgroundColor: greeting.avatar_color }}
          >
            {greeting.name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            Hello, {greeting.name}! 👋
          </h1>
          <p className="text-xl text-gray-400">Welcome home. Let's see what's on for today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-purple-ash opacity-5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-dusty-rose opacity-5 translate-x-1/3 translate-y-1/3" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-ash rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-xl">🏠</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Home Assistant</h1>
        </div>
        <p className="text-gray-400 text-lg">Who's home?</p>
      </div>

      {/* Profile cards */}
      <div className="flex flex-wrap gap-6 justify-center mb-10">
        {profiles.map((p) => (
          <ProfileCard key={p.id} profile={p} onSelect={handleSelect} />
        ))}

        {/* Add new profile */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-dashed border-gray-200 hover:border-purple-ash hover:bg-purple-ash/5 transition-all duration-200 w-52 text-gray-400 hover:text-purple-ash cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={28} />
          </div>
          <span className="font-medium text-sm">Add Profile</span>
        </button>
      </div>

      <p className="text-sm text-gray-300">Tap your profile to enter</p>

      {showCreate && (
        <CreateProfileModal
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
