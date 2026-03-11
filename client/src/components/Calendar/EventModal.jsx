import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'personal', label: 'Personal',  color: '#9B8BB4' },
  { value: 'work',     label: 'Work',       color: '#7B8FA1' },
  { value: 'chore',    label: 'Chore',      color: '#C9919C' },
  { value: 'social',   label: 'Social',     color: '#B5A99A' },
];

function pad(n) { return String(n).padStart(2, '0'); }

function toLocalDatetimeStr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventModal({ event, defaultDate, onSave, onDelete, onClose }) {
  const isNew = !event?.id;

  const initStart = event?.start_dt
    ? toLocalDatetimeStr(event.start_dt)
    : defaultDate
    ? `${defaultDate}T09:00`
    : toLocalDatetimeStr(new Date().toISOString());

  const initEnd = event?.end_dt
    ? toLocalDatetimeStr(event.end_dt)
    : defaultDate
    ? `${defaultDate}T10:00`
    : toLocalDatetimeStr(new Date(Date.now() + 3600000).toISOString());

  const [title, setTitle]         = useState(event?.title || '');
  const [startDt, setStartDt]     = useState(initStart);
  const [endDt, setEndDt]         = useState(initEnd);
  const [description, setDescription] = useState(event?.description || '');
  const [eventType, setEventType] = useState(event?.event_type || 'personal');
  const [color, setColor]         = useState(event?.color || '#9B8BB4');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  function handleTypeChange(val) {
    setEventType(val);
    const found = EVENT_TYPES.find((t) => t.value === val);
    if (found) setColor(found.color);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (new Date(endDt) <= new Date(startDt)) { setError('End time must be after start time'); return; }
    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        start_dt: new Date(startDt).toISOString(),
        end_dt: new Date(endDt).toISOString(),
        description,
        event_type: eventType,
        color,
      });
    } catch {
      setError('Failed to save event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-soft w-full max-w-md p-8 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          {isNew ? 'New Event' : 'Edit Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dentist appointment"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-ash/30 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start</label>
              <input
                type="datetime-local"
                value={startDt}
                onChange={(e) => setStartDt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End</label>
              <input
                type="datetime-local"
                value={endDt}
                onChange={(e) => setEndDt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                  style={{
                    backgroundColor: eventType === t.value ? t.color : 'transparent',
                    borderColor: t.color,
                    color: eventType === t.value ? 'white' : t.color,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none resize-none text-sm"
            />
          </div>

          {error && <p className="text-xs text-dusty-rose">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-purple-ash text-white text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isNew ? 'Create Event' : 'Save Changes'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="px-6 py-3 rounded-xl border border-dusty-rose/30 text-dusty-rose text-sm font-semibold hover:bg-dusty-rose hover:text-white transition-all"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
