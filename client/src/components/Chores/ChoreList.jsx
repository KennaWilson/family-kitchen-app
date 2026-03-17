import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function StarBurst({ active }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-amber-400 animate-starburst"
          style={{
            transform: `rotate(${i * 45}deg) translateY(-20px)`,
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
      <Star className="text-amber-400 animate-starburst" size={24} fill="currentColor" />
    </div>
  );
}

export default function ChoreList() {
  const { activeProfile, updateStars } = useApp();
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
  const [assigneeId, setAssigneeId] = useState(null);

  const pid = assigneeId || activeProfile?.id;

  const [chores, setChores] = useState(() => {
    try {
      const saved = localStorage.getItem('domus_demo_chores');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const starter = [
      { id: Date.now(), title: 'Clean bathroom', completed: false },
      { id: Date.now() + 1, title: 'Do laundry', completed: false },
    ];
    localStorage.setItem('domus_demo_chores', JSON.stringify(starter));
    return starter;
  });
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [burstId, setBurstId] = useState(null);

  useEffect(() => {
    if (!assigneeId && activeProfile?.id) {
      setAssigneeId(activeProfile.id);
    }
  }, [activeProfile?.id, assigneeId]);

  function persistChores(updater) {
    setChores((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('domus_demo_chores', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  async function addChore() {
    if (!input.trim()) return;
    const chore = {
      id: Date.now(),
      title: input.trim(),
      completed: false,
    };
    persistChores((prev) => [chore, ...prev]);
    setInput('');
  }

  async function toggleChore(chore) {
    // Update completed state locally
    const nowCompleted = !chore.completed;
    persistChores((prev) =>
      prev.map((c) =>
        c.id === chore.id ? { ...c, completed: nowCompleted } : c,
      ),
    );

    // Simple local stars update: +1 when completing, -1 when undoing
    if (pid === activeProfile?.id) {
      const delta = nowCompleted ? 1 : -1;
      const newStars = Math.max(0, (activeProfile?.stars ?? 0) + delta);
      updateStars(newStars);
    }

    if (!chore.completed) {
      // Show starburst
      setBurstId(chore.id);
      setTimeout(() => setBurstId(null), 800);
    }
  }

  async function deleteChore(id) {
    persistChores((prev) => prev.filter((c) => c.id !== id));
  }

  async function saveEdit(chore) {
    persistChores((prev) =>
      prev.map((c) =>
        c.id === chore.id ? { ...c, title: editVal } : c,
      ),
    );
    setEditId(null);
  }

  const active = chores.filter((c) => !c.completed);
  const done   = chores.filter((c) => c.completed);
  const totalCount = chores.length;
  const completedCount = done.length;

  const currentAssignee = profiles.find((p) => p.id === pid) || activeProfile;

  return (
    <div className="bg-cream-dark rounded-3xl shadow-card p-6 h-full flex flex-col" style={{ backgroundColor: '#EDE9E5' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Chores {completedCount}/{totalCount || 0}
          </h2>
          {currentAssignee && (
            <p className="text-xs text-gray-400 mt-0.5">
              Assigned to {currentAssignee.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-amber-500">{activeProfile?.stars ?? 0}</span>
        </div>
      </div>

      {/* Assignee selector */}
      {profiles.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {profiles.map((p) => {
            const initials = p.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const selected = pid === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setAssigneeId(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
                  selected
                    ? 'border-purple-ash bg-purple-ash/10 text-purple-ash'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-cream'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: p.avatar_color || '#9B8BB4' }}
                >
                  {initials}
                </span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add input */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addChore()}
          placeholder="Add a chore…"
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/30"
        />
        <button
          onClick={addChore}
          className="w-10 h-10 flex items-center justify-center bg-purple-ash text-white rounded-xl hover:bg-opacity-90 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Active chores */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
        {active.map((chore) => (
          <div key={chore.id} className="relative flex items-center gap-3 p-3 rounded-xl hover:bg-cream group transition-colors">
            <StarBurst active={burstId === chore.id} />
            <button
              onClick={() => toggleChore(chore)}
              className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-purple-ash flex-shrink-0 transition-colors"
            />
            {editId === chore.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  autoFocus
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(chore)}
                  className="flex-1 text-sm px-2 py-1 rounded-lg border border-gray-200 focus:outline-none"
                />
                <button onClick={() => saveEdit(chore)} className="text-purple-ash"><Check size={15} /></button>
                <button onClick={() => setEditId(null)} className="text-gray-300"><X size={15} /></button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700">{chore.title}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(chore.id); setEditVal(chore.title); }} className="text-gray-300 hover:text-gray-500">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteChore(chore.id)} className="text-gray-300 hover:text-dusty-rose">
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {active.length === 0 && (
          <p className="text-sm text-gray-300 text-center py-6">All caught up! ✨</p>
        )}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <details className="mt-4 border-t border-gray-100 pt-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            ✓ {done.length} completed
          </summary>
          <div className="mt-2 space-y-1">
            {done.map((chore) => (
              <div key={chore.id} className="flex items-center gap-3 px-3 py-2">
                <button
                  onClick={() => toggleChore(chore)}
                  className="w-5 h-5 rounded-full bg-purple-ash flex items-center justify-center flex-shrink-0"
                >
                  <Check size={11} className="text-white" />
                </button>
                <span className="flex-1 text-xs text-gray-400 line-through">{chore.title}</span>
                <button onClick={() => deleteChore(chore.id)} className="text-gray-200 hover:text-dusty-rose">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
