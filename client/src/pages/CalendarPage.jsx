import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { ArrowLeft, Plus, RefreshCw, Link2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import EventModal from '../components/Calendar/EventModal';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function CalendarPage() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!pid) return;
    loadEvents();
    // Check Google Calendar connection status
    api.get(`/auth/google/status?profileId=${pid}`)
      .then((r) => setGoogleConnected(r.data.connected))
      .catch(() => {});

    // If redirected back from Google OAuth
    if (searchParams.get('connected') === 'true') {
      setGoogleConnected(true);
      syncGoogle();
    }
  }, [pid]);

  async function loadEvents() {
    const { data } = await api.get(`/profiles/${pid}/events`);
    setEvents(data);
  }

  async function syncGoogle() {
    setSyncing(true);
    try {
      const { data: gEvents } = await api.get(`/auth/google/events?profileId=${pid}`);
      // Upsert Google events into local DB
      for (const ge of gEvents) {
        const start = ge.start?.dateTime || ge.start?.date;
        const end   = ge.end?.dateTime || ge.end?.date;
        if (!start || !end) continue;
        // Avoid duplicates by google_id
        const existing = events.find((e) => e.google_id === ge.id);
        if (!existing) {
          await api.post(`/profiles/${pid}/events`, {
            title: ge.summary || '(No title)',
            start_dt: new Date(start).toISOString(),
            end_dt:   new Date(end).toISOString(),
            description: ge.description || '',
            event_type: 'work',
            color: '#7B8FA1',
          });
        }
      }
      await loadEvents();
    } catch (err) {
      console.error('Google sync error:', err);
    } finally {
      setSyncing(false);
    }
  }

  function handleDateClick(dateStr) {
    setSelectedEvent(null);
    setClickedDate(dateStr);
    setModalOpen(true);
  }

  function handleEventClick(event) {
    setSelectedEvent(event);
    setClickedDate(null);
    setModalOpen(true);
  }

  async function handleSave(eventData) {
    if (selectedEvent) {
      const { data } = await api.put(`/profiles/${pid}/events/${selectedEvent.id}`, eventData);
      setEvents((prev) => prev.map((e) => e.id === data.id ? data : e));
    } else {
      const { data } = await api.post(`/profiles/${pid}/events`, eventData);
      setEvents((prev) => [...prev, data]);
    }
    setModalOpen(false);
  }

  async function handleDelete(id) {
    await api.delete(`/profiles/${pid}/events/${id}`);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setModalOpen(false);
  }

  function prev() {
    setCurrentDate((d) => view === 'month' ? subMonths(d, 1) : subWeeks(d, 1));
  }
  function next() {
    setCurrentDate((d) => view === 'month' ? addMonths(d, 1) : addWeeks(d, 1));
  }

  const title = view === 'month'
    ? format(currentDate, 'MMMM yyyy')
    : `Week of ${format(currentDate, 'MMM d, yyyy')}`;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
              <p className="text-sm text-gray-400">Your events &amp; schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Calendar connect */}
            {googleConnected ? (
              <button
                onClick={syncGoogle}
                disabled={syncing}
                className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-cream transition-all"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing…' : 'Sync Google'}
              </button>
            ) : (
              <a
                href={`http://localhost:3001/api/auth/google?profileId=${pid}`}
                className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-french-blue hover:bg-cream transition-all"
              >
                <Link2 size={14} />
                Connect Google Calendar
              </a>
            )}

            {/* View toggle */}
            <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
              {['month', 'week'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all capitalize ${
                    view === v ? 'bg-purple-ash text-white' : 'text-gray-500 hover:bg-cream'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Add event */}
            <button
              onClick={() => { setSelectedEvent(null); setClickedDate(format(new Date(), 'yyyy-MM-dd')); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-ash text-white text-sm font-semibold rounded-xl hover:bg-opacity-90 transition-all"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>

        {/* Calendar navigation */}
        <div className="flex items-center gap-4">
          <button onClick={prev} className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-all border border-gray-200">
            ‹
          </button>
          <h2 className="text-xl font-semibold text-gray-700 min-w-[200px] text-center">{title}</h2>
          <button onClick={next} className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-gray-600 transition-all border border-gray-200">
            ›
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-cream transition-all"
          >
            Today
          </button>
        </div>

        {/* Calendar grid */}
        <CalendarGrid
          events={events}
          view={view}
          currentDate={currentDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </main>

      {modalOpen && (
        <EventModal
          event={selectedEvent}
          defaultDate={clickedDate}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
