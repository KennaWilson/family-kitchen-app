import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, StickyNote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Dashboard/Sidebar';
import StickyNoteGrid from '../components/Dashboard/StickyNoteGrid';
import ChoreList from '../components/Chores/ChoreList';
import GroceryList from '../components/Grocery/GroceryList';
import logoWordmark from '../assets/domus-wordmark.png';

export default function DashboardPage() {
  const { activeProfile } = useApp();
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('domus_demo_profiles');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const starter = [
      { id: 1, name: 'Chloe', avatar_color: '#9B8BB4', stars: 6 },
      { id: 2, name: 'Cole',  avatar_color: '#7B8FA1', stars: 4 },
    ];
    localStorage.setItem('domus_demo_profiles', JSON.stringify(starter));
    return starter;
  });

  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('domus_demo_profiles');
        if (saved) setProfiles(JSON.parse(saved));
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col gap-6 p-8 overflow-auto">
        {/* Main row: sticky notes + grocery + weekly menu + chores */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 flex-1 min-w-[1200px]">
            {/* Left / center area */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {/* Welcome header */}
              <div className="flex items-baseline gap-6">
                <img
                  src={logoWordmark}
                  alt="DOMUS"
                  className="h-8 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome Home {activeProfile?.name}
                  </h1>
                  <p className="text-gray-400 mt-1 text-sm">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* "Write a response" bar – quick sticky note creator for now */}
              <QuickNoteBar />

              {/* Main grid: sticky notes + grocery + weekly menu */}
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.6fr] gap-6 flex-1 min-h-0">
                {/* Sticky notes area */}
                <div className="min-h-0">
                  <StickyNoteGrid />
                </div>

                {/* Grocery + Weekly menus column */}
                <div className="flex flex-col gap-6 min-h-0">
                  <div className="flex-1 min-h-0">
                    <GroceryList />
                  </div>
                  <TodayMenuCard />
                </div>
              </div>
            </div>

            {/* Right panel — Chores */}
            <div className="w-80 xl:w-96 flex-shrink-0">
              <ChoreList />
            </div>
          </div>
        </div>

        {/* Bottom leaderboard */}
        <HouseholdLeaderboard profiles={profiles} />
      </main>
    </div>
  );
}

function QuickNoteBar() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!pid || !text.trim()) return;
    setSaving(true);
    try {
      const raw = text.trim();
      const STORAGE_KEY = 'domus_demo_tasks';
      let current = [];
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) current = JSON.parse(saved);
      } catch {
        // ignore
      }
      const task = {
        id: Date.now(),
        title: raw,
        note: '',
        color: '#C9919C',
        completed: false,
      };
      const next = [task, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('domus:tasks-updated'));
      setText('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl px-4 py-3 flex items-center gap-3 bg-white glow-bar ${
          saving ? 'glow-bar-loading' : focused ? 'glow-bar-active' : ''
        }`}
      >
        <StickyNote size={18} className="text-gray-300" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Write a response… (we'll turn it into a sticky note)"
          className="flex-1 border-none outline-none text-sm text-gray-700 placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-ash disabled:text-gray-300"
        >
          <span>Create note</span>
        </button>
      </form>
    </div>
  );
}

function TodayMenuCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-cream-dark rounded-3xl shadow-card p-5 flex flex-col" style={{ backgroundColor: '#EDE9E5' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Weekly Menus</h2>
        <button
          type="button"
          onClick={() => navigate('/dinner')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-cream hover:text-gray-700 transition-all"
          aria-label="Go to dinner page"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-300">
        No dinner planned for today. Add one on the Dinner page.
      </p>
    </div>
  );
}

function HouseholdLeaderboard({ profiles }) {
  if (!profiles || profiles.length === 0) return null;

  const sorted = [...profiles].sort(
    (a, b) => (b.stars ?? 0) - (a.stars ?? 0)
  );

  return (
    <section className="mt-2">
      <h2 className="text-sm font-semibold text-gray-500 mb-3">
        Household chore scores
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {sorted.map((p) => {
          const initials = p.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={p.id}
              className="min-w-[150px] rounded-2xl bg-white shadow-card px-4 py-3 flex flex-col items-center"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2"
                style={{ backgroundColor: p.avatar_color || '#9B8BB4' }}
              >
                {initials}
              </div>
              <p className="text-xs font-semibold text-gray-800">{p.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Chore score</p>
              <p className="text-sm font-bold text-amber-500 mt-0.5">
                {p.stars ?? 0}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
