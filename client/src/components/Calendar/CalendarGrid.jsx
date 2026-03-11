import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, startOfWeek as getSow, endOfWeek as getEow,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarGrid({ events, onDateClick, onEventClick, view, currentDate }) {

  if (view === 'week') {
    const weekStart = getSow(currentDate, { weekStartsOn: 0 });
    const weekEnd   = getEow(currentDate, { weekStartsOn: 0 });
    const days      = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours     = Array.from({ length: 24 }, (_, i) => i);

    function eventsForDayHour(day, hour) {
      return events.filter((e) => {
        const start = new Date(e.start_dt);
        return isSameDay(start, day) && start.getHours() === hour;
      });
    }

    return (
      <div className="bg-white rounded-3xl shadow-card overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-100">
          <div className="px-3 py-3 text-xs text-gray-400" />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={`px-2 py-3 text-center text-xs font-semibold border-l border-gray-100 ${isToday(d) ? 'text-purple-ash' : 'text-gray-500'}`}
            >
              <span className="block text-gray-400 font-normal">{format(d, 'EEE')}</span>
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full mt-1 ${isToday(d) ? 'bg-purple-ash text-white' : ''}`}>
                {format(d, 'd')}
              </span>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto flex-1">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-50 min-h-[48px]">
              <div className="px-2 py-1 text-[10px] text-gray-300 text-right pr-3 pt-1">
                {hour === 0 ? '' : `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`}
              </div>
              {days.map((d) => {
                const dayHourEvents = eventsForDayHour(d, hour);
                return (
                  <div
                    key={d.toISOString()}
                    onClick={() => onDateClick(format(d, 'yyyy-MM-dd'))}
                    className="border-l border-gray-50 px-1 py-0.5 cursor-pointer hover:bg-cream/50 transition-colors"
                  >
                    {dayHourEvents.map((e) => (
                      <div
                        key={e.id}
                        onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
                        className="text-[10px] rounded-lg px-1.5 py-0.5 text-white font-medium truncate mb-0.5 cursor-pointer hover:brightness-90"
                        style={{ backgroundColor: e.color }}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd     = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays    = eachDayOfInterval({ start: calStart, end: calEnd });

  function eventsForDay(day) {
    return events.filter((e) => isSameDay(new Date(e.start_dt), day));
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl shadow-card overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((d) => (
          <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {calDays.map((day) => {
          const dayEvents = eventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today   = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(format(day, 'yyyy-MM-dd'))}
              className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors last:border-r-0 ${
                inMonth ? 'bg-white hover:bg-cream/50' : 'bg-gray-50/60'
              } ${today ? 'bg-purple-ash/5' : ''}`}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1 ${
                  today
                    ? 'bg-purple-ash text-white'
                    : inMonth
                    ? 'text-gray-700'
                    : 'text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </span>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className="text-[10px] px-1.5 py-0.5 rounded-md text-white font-medium truncate cursor-pointer hover:brightness-90 transition-all"
                    style={{ backgroundColor: event.color }}
                  >
                    {format(new Date(event.start_dt), 'h:mm')} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[9px] text-gray-400 px-1">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
