import { useEffect, useMemo, useState } from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { format, isAfter, parseISO, addDays } from 'date-fns';
import Sidebar from '../components/Dashboard/Sidebar';
import api from '../api';
import { useApp } from '../context/AppContext';

function toDateStr(date) {
  return format(date, 'yyyy-MM-dd');
}

export default function DinnerPage() {
  const { activeProfile } = useApp();
  const pid = activeProfile?.id;

  const [meals, setMeals] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [dishName, setDishName] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dateStr, setDateStr] = useState(toDateStr(new Date()));
  const [newCookId, setNewCookId] = useState(null);

  useEffect(() => {
    if (!pid) return;

    const fetchMeals = () => {
      api
        .get(`/profiles/${pid}/groceries/meal-plan`)
        .then((r) => setMeals(r.data))
        .catch(console.error);
    };

    const fetchIdeas = () => {
      api
        .get(`/profiles/${pid}/dinner-ideas`)
        .then((r) => setIdeas(r.data))
        .catch(console.error);
    };

    const fetchProfiles = () => {
      api
        .get('/profiles')
        .then((r) => {
          setProfiles(r.data);
          if (!newCookId && activeProfile?.id) {
            setNewCookId(activeProfile.id);
          }
        })
        .catch(console.error);
    };

    fetchMeals();
    fetchIdeas();
    fetchProfiles();

    const mealsHandler = () => fetchMeals();
    const ideasHandler = () => fetchIdeas();

    window.addEventListener('domus:meals-updated', mealsHandler);
    window.addEventListener('domus:dinner-ideas-updated', ideasHandler);

    return () => {
      window.removeEventListener('domus:meals-updated', mealsHandler);
      window.removeEventListener('domus:dinner-ideas-updated', ideasHandler);
    };
  }, [pid, activeProfile?.id, newCookId]);

  const todayKey = toDateStr(new Date());

  const todayMeal = meals.find((m) => m.day_date === todayKey) || null;
  const todayCook = todayMeal
    ? profiles.find((p) => p.id === todayMeal.dinner_cook_id) || null
    : null;

  const upcomingMeals = useMemo(() => {
    const today = parseISO(todayKey);
    return meals
      .filter((m) => isAfter(parseISO(m.day_date), today))
      .sort((a, b) => (a.day_date < b.day_date ? -1 : 1))
      .slice(0, 3);
  }, [meals, todayKey]);

  const favoriteRecipes = useMemo(() => {
    const map = new Map();
    meals
      .filter((m) => m.favorite)
      .forEach((m) => {
        const key = `${m.recipe_title}-${m.recipe_url || ''}`;
        if (!map.has(key)) {
          map.set(key, {
            title: m.recipe_title,
            url: m.recipe_url,
            image: m.recipe_image,
          });
        }
      });
    return Array.from(map.values());
  }, [meals]);

  async function toggleFavorite(meal) {
    const updated = await api
      .patch(`/profiles/${pid}/groceries/meal-plan/${meal.id}`, {
        favorite: !meal.favorite,
      })
      .then((r) => r.data);
    setMeals((prev) => prev.map((m) => (m.id === meal.id ? updated : m)));
  }

  async function assignCookForMeal(mealId, cookId) {
    const updated = await api
      .patch(`/profiles/${pid}/groceries/meal-plan/${mealId}`, {
        dinner_cook_id: cookId,
      })
      .then((r) => r.data);
    setMeals((prev) => prev.map((m) => (m.id === mealId ? updated : m)));
  }

  function openRecipe(meal) {
    if (!meal.recipe_url) return;
    window.open(meal.recipe_url, '_blank', 'noopener,noreferrer');
  }

  async function handleAddDinner(e) {
    e.preventDefault();
    if (!dishName.trim() || !dateStr) return;
    const payload = {
      day_date: dateStr,
      recipe_title: dishName.trim(),
      recipe_image: imageUrl.trim(),
      recipe_id: '',
      recipe_url: recipeUrl.trim(),
      notes: notes.trim(),
      dinner_cook_id: newCookId || activeProfile?.id || null,
    };
    const { data } = await api.post(
      `/profiles/${pid}/groceries/meal-plan`,
      payload
    );
    setMeals((prev) => [...prev, data]);
    setDishName('');
    setRecipeUrl('');
    setImageUrl('');
    setNotes('');
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
        {/* Dinner tonight */}
        <section className="bg-white rounded-3xl shadow-card p-6 flex flex-col md:flex-row gap-6 items-stretch" style={{ backgroundColor: '#EDE9E5' }}>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Dinner tonight {format(new Date(), 'M/d')}
              </p>
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                {todayMeal ? todayMeal.recipe_title : 'No dinner planned'}
              </h2>
              {todayMeal && todayCook && (
                <p className="text-xs text-gray-500 mb-1">
                  Dinner by {todayCook.name}
                </p>
              )}
              {todayMeal && todayMeal.notes && (
                <p className="text-sm text-gray-500 mb-3">{todayMeal.notes}</p>
              )}
              {todayMeal && (
                <button
                  type="button"
                  onClick={() => openRecipe(todayMeal)}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-cream transition-all"
                >
                  view recipe
                </button>
              )}
            </div>
          </div>
          <div className="relative w-full md:w-64 h-36 rounded-2xl bg-gradient-to-tr from-dusty-rose/40 to-purple-ash/40 overflow-hidden flex items-center justify-center">
            {todayMeal && todayMeal.recipe_image ? (
              <img
                src={todayMeal.recipe_image}
                alt={todayMeal.recipe_title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl opacity-40">🍽️</div>
            )}
            {todayMeal && (
              <button
                type="button"
                onClick={() => toggleFavorite(todayMeal)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-amber-400 shadow-sm"
                aria-label="Toggle favorite"
              >
                <Star
                  size={18}
                  className={todayMeal.favorite ? 'fill-amber-400' : ''}
                />
              </button>
            )}
          </div>
        </section>

        {/* Upcoming dinners row */}
        <section className="flex items-center gap-3">
          <div className="flex-1 flex gap-3 overflow-x-auto pb-1">
            {upcomingMeals.map((m) => (
              <div
                key={m.id}
                className="min-w-[150px] border border-gray-200 rounded-2xl px-3 py-3 bg-white flex flex-col justify-between"
                style={{ backgroundColor: '#EDE9E5' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      {format(parseISO(m.day_date), 'M/d')}
                    </p>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {m.recipe_title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(m)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-amber-400 hover:bg-cream"
                  >
                    <Star
                      size={14}
                      className={m.favorite ? 'fill-amber-400' : ''}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => openRecipe(m)}
                  className="w-full text-xs text-gray-400 flex items-center justify-between"
                >
                  <span>details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
            {upcomingMeals.length === 0 && (
              <p className="text-sm text-gray-300">
                No upcoming dinners scheduled.
              </p>
            )}
          </div>
        </section>

        {/* Favorites and ideas */}
        <section className="space-y-6 max-w-xl">
            {/* Favorite dinners */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Favorite dinners
              </h3>
              <div className="space-y-2">
                {favoriteRecipes.map((fav) => (
                  <button
                    key={`${fav.title}-${fav.url}`}
                    type="button"
                    onClick={() => {
                      if (fav.url) window.open(fav.url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-white border border-gray-200 text-sm text-gray-800 hover:bg-cream transition-all"
                  >
                    <span>{fav.title}</span>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Star size={16} className="fill-amber-400" />
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </button>
                ))}
                {favoriteRecipes.length === 0 && (
                  <p className="text-sm text-gray-300">
                    Mark dinners as favorites to see them here.
                  </p>
                )}
              </div>
            </div>

            {/* Dinner ideas */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Dinner ideas
              </h3>
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm text-gray-800"
                  >
                    <span>{idea.title}</span>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <p className="text-sm text-gray-300">
                    Ask Domus to "add &lt;dish&gt; to dinner ideas" to brainstorm meals.
                  </p>
                )}
              </div>
            </div>
        </section>

        {/* Add new dinner plan + who is doing dinner */}
        <section className="bg-white rounded-3xl shadow-card p-6" style={{ backgroundColor: '#EDE9E5' }}>
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Add new dinner plan
          </h3>
          <form
            onSubmit={handleAddDinner}
            className="grid grid-cols-1 lg:grid-cols-[2fr_1.4fr] gap-6 items-start"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Dish Name"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-dusty-rose/40"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Dinner date
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-dusty-rose/40 bg-cream/50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Add special instruction
                </label>
                <textarea
                  rows={3}
                  placeholder="Add special instruction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-dusty-rose/40 resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Recipe URL
                </label>
                <input
                  type="url"
                  placeholder="Paste recipe instructions URL (optional)"
                  value={recipeUrl}
                  onChange={(e) => setRecipeUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-dusty-rose/40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="Paste image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-dusty-rose/40"
                />
              </div>

              {/* Who is doing dinner */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold">
                  Who is doing dinner?
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {profiles.map((p) => {
                    const initials = p.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    const selected = (newCookId || activeProfile?.id) === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setNewCookId(p.id)}
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
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setDishName('');
                  setRecipeUrl('');
                  setImageUrl('');
                  setNotes('');
                  setDateStr(toDateStr(new Date()));
                  setNewCookId(activeProfile?.id || null);
                }}
                className="w-9 h-9 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-cream"
                aria-label="Cancel"
              >
                ✕
              </button>
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-dusty-rose text-white flex items-center justify-center hover:bg-opacity-90"
                aria-label="Save dinner"
              >
                ✓
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
