import { useApp } from '../context/AppContext';
import Sidebar from '../components/Dashboard/Sidebar';
import StickyNoteGrid from '../components/Dashboard/StickyNoteGrid';
import BubbleNav from '../components/Dashboard/BubbleNav';
import ChoreList from '../components/Chores/ChoreList';

export default function DashboardPage() {
  const { activeProfile } = useApp();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex gap-6 p-8 overflow-hidden">

        {/* Center column */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Greeting header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {greeting}, {activeProfile?.name}! 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Sticky notes */}
          <div className="flex-1">
            <StickyNoteGrid />
          </div>

          {/* Bubble navigation */}
          <BubbleNav />
        </div>

        {/* Right panel — Chores */}
        <div className="w-80 xl:w-96 flex-shrink-0">
          <ChoreList />
        </div>
      </main>
    </div>
  );
}
