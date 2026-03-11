import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Check } from 'lucide-react';
import api from '../../api';
import { useApp } from '../../context/AppContext';

const STICKY_COLORS = ['#C9919C', '#9B8BB4', '#7B8FA1', '#B5A99A', '#D4A5A5', '#A8C5B5'];

export default function StickyNoteGrid() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;

  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState(STICKY_COLORS[0]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    if (!pid) return;
    api.get(`/profiles/${pid}/tasks`).then((r) => setTasks(r.data)).catch(console.error);
  }, [pid]);

  async function addTask() {
    if (!newTitle.trim()) return;
    const { data } = await api.post(`/profiles/${pid}/tasks`, {
      title: newTitle.trim(),
      note: newNote.trim(),
      color: newColor,
    });
    setTasks((prev) => [data, ...prev]);
    setNewTitle(''); setNewNote(''); setNewColor(STICKY_COLORS[0]); setShowAdd(false);
  }

  async function toggleComplete(task) {
    const { data } = await api.put(`/profiles/${pid}/tasks/${task.id}`, {
      ...task,
      completed: !task.completed,
    });
    setTasks((prev) => prev.map((t) => t.id === task.id ? data : t));
  }

  async function deleteTask(id) {
    await api.delete(`/profiles/${pid}/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function saveEdit(task) {
    const { data } = await api.put(`/profiles/${pid}/tasks/${task.id}`, {
      ...task, title: editTitle, note: editNote,
    });
    setTasks((prev) => prev.map((t) => t.id === task.id ? data : t));
    setEditId(null);
  }

  const active = tasks.filter((t) => !t.completed);
  const done   = tasks.filter((t) => t.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Today's Notes</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-sm text-purple-ash hover:text-opacity-80 font-medium"
        >
          <Plus size={16} /> Add note
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 bg-white rounded-2xl p-4 shadow-card border border-gray-100 animate-fadeIn">
          <input
            autoFocus
            type="text"
            placeholder="What do you need to do?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/30 mb-2"
          />
          <input
            type="text"
            placeholder="Add a note (optional)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/30 mb-3"
          />
          <div className="flex items-center gap-2 mb-3">
            {STICKY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform"
                style={{ backgroundColor: c, borderColor: newColor === c ? '#3a3a3a' : 'transparent', transform: newColor === c ? 'scale(1.2)' : 'scale(1)' }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addTask} className="px-4 py-2 bg-purple-ash text-white text-xs font-semibold rounded-xl hover:bg-opacity-90">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-400 text-xs rounded-xl hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Active sticky notes */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {active.map((task, i) => (
          <div
            key={task.id}
            className="relative rounded-2xl p-5 shadow-card hover:shadow-soft transition-all duration-200 hover:-rotate-1 group"
            style={{ backgroundColor: task.color, minHeight: '120px' }}
          >
            {/* Controls */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditId(task.id); setEditTitle(task.title); setEditNote(task.note || ''); }}
                className="w-6 h-6 rounded-full bg-white/40 hover:bg-white/70 flex items-center justify-center"
              >
                <Pencil size={11} className="text-gray-700" />
              </button>
              <button
                onClick={() => toggleComplete(task)}
                className="w-6 h-6 rounded-full bg-white/40 hover:bg-white/70 flex items-center justify-center"
              >
                <Check size={11} className="text-gray-700" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="w-6 h-6 rounded-full bg-white/40 hover:bg-white/70 flex items-center justify-center"
              >
                <X size={11} className="text-gray-700" />
              </button>
            </div>

            {editId === task.id ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/60 rounded-lg px-2 py-1 text-sm font-semibold text-gray-800 focus:outline-none"
                />
                <input
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full bg-white/60 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none"
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveEdit(task)} className="text-xs bg-white/60 rounded-lg px-3 py-1 font-semibold text-gray-700 hover:bg-white/80">Save</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-gray-600 hover:underline">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold text-white text-sm leading-snug pr-6">{task.title}</p>
                {task.note && <p className="text-white/80 text-xs mt-1.5 leading-relaxed">{task.note}</p>}
                {task.due_date && (
                  <p className="text-white/70 text-[10px] mt-3 font-medium">
                    📅 {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

        {active.length === 0 && !showAdd && (
          <div className="col-span-2 xl:col-span-3 text-center py-8 text-gray-300 text-sm">
            No tasks for today! Click "Add note" to get started.
          </div>
        )}
      </div>

      {/* Completed section */}
      {done.length > 0 && (
        <details className="mt-5">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            ✓ {done.length} completed
          </summary>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mt-3 opacity-50">
            {done.map((task) => (
              <div key={task.id} className="relative rounded-2xl p-5 shadow-card line-through" style={{ backgroundColor: task.color, minHeight: '80px' }}>
                <p className="font-semibold text-white text-sm">{task.title}</p>
                <button onClick={() => toggleComplete(task)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/40 flex items-center justify-center text-xs text-gray-700 hover:bg-white/70">↩</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
