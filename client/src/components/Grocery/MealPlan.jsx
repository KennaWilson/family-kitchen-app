import { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';
import { useApp } from '../../context/AppContext';
import { format, startOfWeek, addDays } from 'date-fns';

export default function MealPlan({ pendingMeal, onPendingConsumed }) {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;

  const [meals, setMeals] = useState([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [pickingDay, setPickingDay] = useState(null); // date string when user clicks +

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!pid) return;
    api.get(`/profiles/${pid}/groceries/meal-plan`).then((r) => setMeals(r.data)).catch(console.error);
  }, [pid]);

  // When a recipe is added from RecipePanel, prompt to choose a day
  useEffect(() => {
    if (pendingMeal) setPickingDay('pick');
  }, [pendingMeal]);

  async function assignMeal(dayStr) {
    if (!pendingMeal) return;
    const { data } = await api.post(`/profiles/${pid}/groceries/meal-plan`, {
      day_date: dayStr,
      ...pendingMeal,
    });
    setMeals((prev) => [...prev, data]);
    setPickingDay(null);
    onPendingConsumed();
  }

  async function removeMeal(id) {
    await api.delete(`/profiles/${pid}/groceries/meal-plan/${id}`);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function mealsForDay(day) {
    const str = format(day, 'yyyy-MM-dd');
    return meals.filter((m) => m.day_date === str);
  }

  return (
    <div className="bg-white rounded-3xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Meal Plan</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart((d) => addDays(d, -7))} className="p-1.5 rounded-lg hover:bg-cream text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button onClick={() => setWeekStart((d) => addDays(d, 7))} className="p-1.5 rounded-lg hover:bg-cream text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day picker modal */}
      {pickingDay === 'pick' && pendingMeal && (
        <div className="mb-4 p-4 bg-dusty-rose/10 rounded-2xl border border-dusty-rose/20 animate-fadeIn">
          <p className="text-sm font-semibold text-dusty-rose mb-3">
            Add "{pendingMeal.recipe_title}" — pick a day:
          </p>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d.toISOString()}
                onClick={() => assignMeal(format(d, 'yyyy-MM-dd'))}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-dusty-rose/30 hover:bg-dusty-rose hover:text-white hover:border-dusty-rose transition-all font-medium text-gray-600"
              >
                {format(d, 'EEE d')}
              </button>
            ))}
            <button
              onClick={() => { setPickingDay(null); onPendingConsumed(); }}
              className="text-xs px-3 py-1.5 rounded-xl text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayMeals = mealsForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl p-2 min-h-[90px] border transition-colors ${
                isToday ? 'border-dusty-rose/40 bg-dusty-rose/5' : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <p className={`text-[10px] font-bold mb-1.5 ${isToday ? 'text-dusty-rose' : 'text-gray-400'}`}>
                {format(day, 'EEE')}
                <span className="block text-[11px] font-normal">{format(day, 'd')}</span>
              </p>
              <div className="space-y-1">
                {dayMeals.map((m) => (
                  <div key={m.id} className="group relative text-[9px] bg-white rounded-lg px-1.5 py-1 text-gray-600 leading-tight shadow-sm border border-gray-100 cursor-default">
                    {m.recipe_image && (
                      <img src={m.recipe_image} alt="" className="w-full h-8 object-cover rounded mb-0.5 opacity-70" />
                    )}
                    <span className="line-clamp-2">{m.recipe_title}</span>
                    <button
                      onClick={() => removeMeal(m.id)}
                      className="absolute top-0.5 right-0.5 hidden group-hover:flex w-4 h-4 items-center justify-center bg-dusty-rose rounded-full text-white"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
